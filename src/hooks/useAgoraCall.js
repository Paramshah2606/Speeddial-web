import constant from "@/config/constant";
import AgoraRTC from "agora-rtc-sdk-ng";
const { useSocket } = require("@/context/socketContext");
const { useRouter } = require("next/navigation");
const { useRef, useState, useEffect } = require("react");
import { toast } from "react-toastify";

const APP_ID = constant.Agora_App_id;

export default function useAgoraCall(callId){
    const user = useRef(null);
    const client = useRef(null);
    const localAudioTrack = useRef(null);
    const localVideoTrack = useRef(null);
    const screenTrack = useRef(null);
    const callTimerRef=useRef(null);

    const {socket}=useSocket();

    const [joined, setJoined] = useState(false);
    const [remoteUsers, setRemoteUsers] = useState([]);
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);
    const [isVideoEnabled, setIsVideoEnabled] = useState(false);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [callDuration, setCallDuration] = useState(0);
    const [activeSpeaker, setActiveSpeaker] = useState(null);
    const [facingMode, setFacingMode] = useState("user"); // "user" = front, "environment" = back camera

    const router = useRouter();

    async function joinChannel() {
    if (joined) return;

    client.current = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

    client.current.enableAudioVolumeIndicator();

    // client.current.on("volume-indicator", (volumes) => {
    //   volumes.forEach((volume) => {
    //     // volume.level is between 0–100
    //     if (volume.level > 30) {   // Increase threshold
    //       setActiveSpeaker(volume.uid);
    //       setTimeout(() => setActiveSpeaker(null), 1000);
    //     }
    //   });
    // });

    client.current.on("volume-indicator", (volumes) => {
      let loudestSpeaker = null;
      let maxLevel = 30; // threshold

      volumes.forEach((volume) => {
        if (volume.level > maxLevel) {
          maxLevel = volume.level;
          loudestSpeaker = volume.uid;
        }
      });

      setActiveSpeaker(loudestSpeaker);
    });

    client.current.on("user-joined", (user) => {
      if (socket) {
        socket.emit('get-user-info', { uid: user.uid, callId });
      }
      console.log("user joined",user);
      setRemoteUsers((prev) => {
        const exists = prev.some((u) => u.uid === user.uid);
        if (exists) return prev;
        return [...prev, { uid: user.uid,name:null, videoTrack: null, audioTrack: null,hasAudio: false, name: null }];
      });
    });

    client.current.on("user-published", async (user, mediaType) => {
      await client.current.subscribe(user, mediaType);
      console.log("Subscribed to", user.uid, mediaType);
      setRemoteUsers((prev) =>
        prev.map((u) =>
          u.uid === user.uid
            ? {
                ...u,
                videoTrack: mediaType === "video" ? user.videoTrack : u.videoTrack,
                audioTrack: mediaType === "audio" ? user.audioTrack : u.audioTrack,
                hasAudio: mediaType === "audio" ? true : u.hasAudio
              }
            : u
        )
      );

      // Play tracks
      if (mediaType === "video" && user.videoTrack) {
        user.videoTrack.play(`remote-video-${user.uid}`);
      }

      if (mediaType === "audio" && user.audioTrack) {
        user.audioTrack.play();
      }
    });

    client.current.on("user-unpublished", (user, mediaType) => {
      console.log("User unpublished", user.uid, mediaType);

      if (mediaType === "video") {
        // remove only the VIDEO track, not the user
        setRemoteUsers(prev =>
          prev.map(u =>
            u.uid === user.uid ? { ...u, videoTrack: null } : u
          )
        );
      }

      if (mediaType === "audio") {
        setRemoteUsers(prev =>
          prev.map(u => 
            u.uid === user.uid ? { ...u, audioTrack: null, hasAudio: false } : u
          )
        );
      }
    });

    client.current.on("user-left", (user) => {
      setRemoteUsers(prev => prev.filter(u => u.uid !== user.uid));
    });



    const uid = user.current.id;
    const token = await fetchToken(callId, uid);

    await client.current.join(APP_ID, callId, token, uid);

    if (socket) {
      socket.emit('broadcast-my-info', {
        callId,
        uid,
        name: user.current.username
      });
    }

    // Always create audio track initially, if mic present
    const hasMic = await checkDevice("audio");
    if (!hasMic) {
      toast.error("No microphone found.");
      setIsAudioEnabled(false);
    } else {
      // localAudioTrack.current = await AgoraRTC.createMicrophoneAudioTrack();
      localAudioTrack.current = await AgoraRTC.createMicrophoneAudioTrack({
        AEC: true,  // echo cancellation
        AGC: true,  // auto gain control
        ANS: true   // noise suppression
      });

      await client.current.publish([localAudioTrack.current]);
      setIsAudioEnabled(true);
    }

    setJoined(true);
  }

  async function leaveChannel() {
    if (localAudioTrack.current) {
      localAudioTrack.current.stop();
      localAudioTrack.current.close();
      const mediaStreamTrack = localAudioTrack.current.getMediaStreamTrack();
      if (mediaStreamTrack) mediaStreamTrack.stop();
      localAudioTrack.current = null;
    }
    if (localVideoTrack.current) {
      localVideoTrack.current.stop();
      localVideoTrack.current.close();
       const mediaStreamTrack = localVideoTrack.current.getMediaStreamTrack();
      if (mediaStreamTrack) mediaStreamTrack.stop();
      localVideoTrack.current = null;
    }
    if (screenTrack.current) {
      screenTrack.current.stop();
      screenTrack.current.close();
      screenTrack.current = null;
    }

    if (client.current) {
      client.current.removeAllListeners();
      await client.current.leave();
      client.current = null;
    }

    setRemoteUsers([]);
    setJoined(false);
    setIsAudioEnabled(false);
    setIsVideoEnabled(false);
    setIsScreenSharing(false);
    router.push("/user/home");
  }

  async function toggleAudio() {
    if (!localAudioTrack.current) {
      const hasMic = await checkDevice("audio");
      if (!hasMic) {
        toast.error("No microphone found.");
        return;
      }
      localAudioTrack.current = await AgoraRTC.createMicrophoneAudioTrack();
      await client.current.publish([localAudioTrack.current]);
      setIsAudioEnabled(true);
      return;
    }

    if (isAudioEnabled) {
      await localAudioTrack.current.setEnabled(false);
      setIsAudioEnabled(false);
    } else {
      await localAudioTrack.current.setEnabled(true);
      setIsAudioEnabled(true);
    }
  }

  async function toggleVideo() {
    if (!localVideoTrack.current) {
      const hasCamera = await checkDevice("video");
      if (!hasCamera) {
        toast.error("No camera found.");
        return;
      }
      localVideoTrack.current = await AgoraRTC.createCameraVideoTrack();
      await client.current.publish(localVideoTrack.current);
      localVideoTrack.current.play("local-video");
      setIsVideoEnabled(true);
      return;
    }

    if (isVideoEnabled) {
      await localVideoTrack.current.setEnabled(false);
      setIsVideoEnabled(false);
    } else {
      await localVideoTrack.current.setEnabled(true);
      setIsVideoEnabled(true);
    }
  }

  const toggleCameraFacing = async () => {
    try {
      const newFacing = facingMode === "user" ? "environment" : "user";
      setFacingMode(newFacing);

      // Stop current track
      if (localVideoTrack.current) {
        localVideoTrack.current.stop();
        await client.current.unpublish(localVideoTrack.current);
      }

      // Create new track with new camera
      const newVideoTrack = await AgoraRTC.createCameraVideoTrack({
        encoderConfig: "720p",
        facingMode: newFacing
      });

      // Replace track
      localVideoTrack.current = newVideoTrack;

      // Publish again
      await client.current.publish(newVideoTrack);

      // Replay video on screen
      setTimeout(() => {
        newVideoTrack.play("local-video");
      }, 100);

    } catch (err) {
      console.error("Error switching camera:", err);
    }
  };


  function isScreenShareSupported() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia);
  }

  async function startScreenShare() {
    if (!isScreenShareSupported()) {
      toast.error("Screen sharing is not supported on this device/browser.");
      return;
    }
    if (isScreenSharing) {
      if (screenTrack.current) {
        await client.current.unpublish(screenTrack.current);
        screenTrack.current.stop();
        screenTrack.current.close();
        screenTrack.current = null;
      }
      setIsScreenSharing(false);
      if (localVideoTrack.current) {
        await client.current.publish(localVideoTrack.current);
      }
      return;
    }
    try {
      screenTrack.current = await AgoraRTC.createScreenVideoTrack();
      if (localVideoTrack.current) {
        await client.current.unpublish(localVideoTrack.current);
      }
      await client.current.publish(screenTrack.current);
      setIsScreenSharing(true);
    } catch (err) {
      toast.error("Screen share permission denied");
    }
  }

async function fetchToken(channelName, uid) {
    const response = await fetch(`${constant.Server_Url}/api/agora/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        channelName,
        uid,
        role: "publisher",
      }),
    });

    const data = await response.json();
    return data.token;
  }

  // Check if device exists (mic or camera)
  async function checkDevice(kind) {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.some(
        (device) => device.kind === (kind === "audio" ? "audioinput" : "videoinput")
      );
    } catch (err) {
      toast.error("Failed to check devices");
      return false;
    }
  }

  useEffect(() => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        user.current = JSON.parse(storedUser);
      }
    }, []);

useEffect(() => {
    // localJoinedRef will be set true once joinChannel completes
    if (joined && remoteUsers.length > 0) {
      // start timer if not already started
      if (!callTimerRef.current) {
        callTimerRef.current = setInterval(() => {
          setCallDuration(prev => prev + 1);
        }, 1000);
      }
    } else {
      // stop timer if running
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
        callTimerRef.current = null;
        setCallDuration(0); // reset if you want to reset when others leave — change as desired
      }
    }
  
    // cleanup when component unmounts
    return () => {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
        callTimerRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remoteUsers.length, joined]);

  useEffect(() => {
  if (!socket) return;

  socket.on('user-info-response', ({ uid, name }) => {
    setRemoteUsers(prev => 
      prev.map(u => u.uid === uid ? { ...u, name } : u)
    );
  });

  return () => socket.off('user-info-response');
}, [socket]);

  useEffect(() => {
      joinChannel();
  
      return () => {
        console.log("Leaving channel");
        leaveChannel();
      };
    }, []);

  return {localVideoTrack,joined,remoteUsers,isAudioEnabled,isVideoEnabled,isScreenSharing,callDuration,activeSpeaker,joinChannel,leaveChannel,toggleAudio,toggleVideo,toggleCameraFacing,startScreenShare};
}