import AgoraRTC from "agora-rtc-sdk-ng";
const { useSocket } = require("@/context/socketContext");
const { useRouter } = require("next/navigation");
const { useRef, useState, useEffect } = require("react");
import { toast } from "react-toastify";

const APP_ID = process.env.NEXT_PUBLIC_AGORA_APP_ID;

export default function useAgoraCall2(callId){
    const user = useRef(null);
    const client = useRef(null);
    const localAudioTrack = useRef(null);
    const localVideoTrack = useRef(null);
    const screenTrack = useRef(null);
    const callTimerRef = useRef(null);

    const [joined, setJoined] = useState(false);
    const [remoteUsers, setRemoteUsers] = useState([]);
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);
    const [isVideoEnabled, setIsVideoEnabled] = useState(false);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [callDuration, setCallDuration] = useState(0);
    const [activeSpeaker, setActiveSpeaker] = useState(null); // NEW: Track who is speaking
    const [remoteScreenShare, setRemoteScreenShare] = useState(null); // NEW: Track remote screen share

    const { socket, endCall } = useSocket();
    const router = useRouter();

    async function joinChannel() {
    if (joined) return;

    client.current = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

    // NEW: Enable volume indicator for speaking detection
    client.current.enableAudioVolumeIndicator();

    // NEW: Volume indicator event to detect who's speaking
    client.current.on("volume-indicator", (volumes) => {
      volumes.forEach((volume) => {
        // If volume > 10, consider them speaking
        if (volume.level > 10) {
          setActiveSpeaker(volume.uid);
          // Clear after 1 second of silence
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
        return [...prev, { 
          uid: user.uid, 
          videoTrack: null, 
          audioTrack: null,
          name: `User ${user.uid}` // Default name, can be updated via signaling
        }];
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

      // Check if this is a screen share track (screen shares usually have higher UID or specific naming)
      if (mediaType === "video" && user.videoTrack) {
        // Agora screen shares can be detected by checking video track type
        const trackLabel = user.videoTrack.getTrackLabel();
        if (trackLabel.includes("screen") || user.uid.toString().includes("screen")) {
          setRemoteScreenShare({
            uid: user.uid,
            videoTrack: user.videoTrack
          });
        } else {
          user.videoTrack.play(`remote-video-${user.uid}`);
        }
      }

      if (mediaType === "audio" && user.audioTrack) {
        user.audioTrack.play();
      }
    });

    client.current.on("user-unpublished", (user, mediaType) => {
      console.log("User unpublished", user.uid, mediaType);

      if (mediaType === "video") {
        // Check if it was a screen share
        if (remoteScreenShare && remoteScreenShare.uid === user.uid) {
          setRemoteScreenShare(null);
        }
        
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
      if (remoteScreenShare && remoteScreenShare.uid === user.uid) {
        setRemoteScreenShare(null);
      }
      setRemoteUsers(prev => prev.filter(u => u.uid !== user.uid));
    });

    const uid = user.current.id;
    const token = await fetchToken(callId, uid);

    await client.current.join(APP_ID, callId, token, uid);

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
    setRemoteScreenShare(null);

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
      if (screenTrack.current) {
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

      if (localVideoTrack.current) {
        await client.current.publish(localVideoTrack.current);
      }

      return;
    }

    try {
      const track = await AgoraRTC.createScreenVideoTrack({}, "auto");

      if (Array.isArray(track)) {
        screenTrack.current = track;
        await client.current.publish(track);
      } else {
        screenTrack.current = [track];
        await client.current.publish([track]);
      }

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
    const response = await fetch("http://localhost:5000/api/agora/token", {
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
    if (joined && remoteUsers.length > 0) {
      if (!callTimerRef.current) {
        callTimerRef.current = setInterval(() => {
          setCallDuration(prev => prev + 1);
        }, 1000);
      }
    } else {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
        callTimerRef.current = null;
        setCallDuration(0);
      }
    }
  
    return () => {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
        callTimerRef.current = null;
      }
    };
  }, [remoteUsers.length, joined]);

  useEffect(() => {
    joinChannel();
  
    return () => {
      leaveChannel();
    };
  }, []);

  return {
    localVideoTrack,
    joined,
    remoteUsers,
    isAudioEnabled,
    isVideoEnabled,
    isScreenSharing,
    callDuration,
    activeSpeaker, // NEW
    remoteScreenShare, // NEW
    joinChannel,
    leaveChannel,
    toggleAudio,
    toggleVideo,
    startScreenShare
  };
}