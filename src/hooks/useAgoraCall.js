import AgoraRTC from "agora-rtc-sdk-ng";
const { useSocket } = require("@/context/socketContext");
const { useRouter } = require("next/navigation");
const { useRef, useState, useEffect } = require("react");
import { toast } from "react-toastify";

const APP_ID = process.env.NEXT_PUBLIC_AGORA_APP_ID;

export default function useAgoraCall(callId){
    const user = useRef(null);
    const client = useRef(null);
    const localAudioTrack = useRef(null);
    const localVideoTrack = useRef(null);
    const screenTrack = useRef(null);
    const callTimerRef=useRef(null);

    const [joined, setJoined] = useState(false);
    const [remoteUsers, setRemoteUsers] = useState([]);
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);
    const [isVideoEnabled, setIsVideoEnabled] = useState(false);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [callDuration, setCallDuration] = useState(0);
    const [activeSpeaker, setActiveSpeaker] = useState(null);

    const { socket, endCall } = useSocket();

    const router = useRouter();

    async function joinChannel() {
    if (joined) return;

    client.current = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

    client.current.enableAudioVolumeIndicator();

    client.current.on("volume-indicator", (volumes) => {
      volumes.forEach((volume) => {
        if (volume.level > 10) {
          setActiveSpeaker(volume.uid);
          setTimeout(() => {
            setActiveSpeaker(null);
          }, 1000);
        }
      });
    });

    client.current.on("user-joined", (user) => {
      setRemoteUsers((prev) => {
        const exists = prev.some((u) => u.uid === user.uid);
        if (exists) return prev;
        return [...prev, { uid: user.uid, videoTrack: null, audioTrack: null }];
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
                audioTrack: mediaType === "audio" ? user.audioTrack : u.audioTrack
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
            u.uid === user.uid ? { ...u, audioTrack: null } : u
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

    // Always create audio track initially, if mic present
    const hasMic = await checkDevice("audio");
    if (!hasMic) {
      toast.error("No microphone found.");
      setIsAudioEnabled(false);
    } else {
      localAudioTrack.current = await AgoraRTC.createMicrophoneAudioTrack();
      await client.current.publish([localAudioTrack.current]);
      setIsAudioEnabled(true);
    }

    setJoined(true);
  }

  async function leaveChannel() {
    if (localAudioTrack.current) {
      localAudioTrack.current.stop();
      localAudioTrack.current.close();
      localAudioTrack.current = null;
    }
    if (localVideoTrack.current) {
      localVideoTrack.current.stop();
      localVideoTrack.current.close();
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

    if (socket) endCall(callId);
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

  async function startScreenShare() {
  if (isScreenSharing) {
    // Stop screen share
    if (screenTrack.current) {
      // If multi-track: videoTrack + audioTrack
      const tracks = Array.isArray(screenTrack.current)
        ? screenTrack.current
        : [screenTrack.current];

      await client.current.unpublish(tracks);

      tracks.forEach(t => {
        if (t.stop) t.stop();
        if (t.close) t.close();
      });

      screenTrack.current = null;
    }

    setIsScreenSharing(false);

    // Restore camera video if it was on
    if (localVideoTrack.current) {
      await client.current.publish(localVideoTrack.current);
    }

    return;
  }

  try {
    // IMPORTANT: createScreenVideoTrack may return [video, audio]
    const track = await AgoraRTC.createScreenVideoTrack({}, "auto");

    if (Array.isArray(track)) {
      // Browser supports screen audio
      screenTrack.current = track; // video + audio
      await client.current.publish(track);
    } else {
      // Only video
      screenTrack.current = [track];
      
      await client.current.publish([track]);
    }

    // Unpublish camera while screen-sharing
    if (localVideoTrack.current) {
      await client.current.unpublish(localVideoTrack.current);
    }

    setIsScreenSharing(true);

  } catch (err) {
    console.log(err);
    toast.error("Screen share permission denied");
  }
}

async function fetchToken(channelName, uid) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_DEV_URL}/api/agora/token`, {
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
      joinChannel();
  
      return () => {
        leaveChannel();
      };
    }, []);

  return {localVideoTrack,joined,remoteUsers,isAudioEnabled,isVideoEnabled,isScreenSharing,callDuration,activeSpeaker,joinChannel,leaveChannel,toggleAudio,toggleVideo,startScreenShare};
}