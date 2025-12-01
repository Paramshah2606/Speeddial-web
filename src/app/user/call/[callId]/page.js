"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { 
  Phone, 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Monitor, 
  MonitorOff,
  PhoneOff,
  User,
  Users,
  Clock,
  LayoutGrid,
  X,
  CircleCheck,
} from "lucide-react";
import { PiCameraRotate } from "react-icons/pi";
import useAgoraCall from "@/hooks/useAgoraCall";
import { useSocket } from "@/context/socketContext";
import { MdGridView, MdOutlinePictureInPictureAlt, MdViewSidebar } from "react-icons/md";
import { LuLayoutGrid } from "react-icons/lu";

export default function CallPage() {
  const { callId } = useParams();

  const [showControls, setShowControls] = useState(true);
  const [showLayoutMenu, setShowLayoutMenu] = useState(false);
  const [selectedLayout, setSelectedLayout] = useState("grid"); // grid, sidebar, spotlight, pip
  const [isLargeScreen, setIsLargeScreen] = useState(false);

  const { socket, endCall,cancelCall } = useSocket();

  const user = useRef(null);
  const hideControlsTimer = useRef(null);

  const {localVideoTrack,joined,remoteUsers,isAudioEnabled,isVideoEnabled,isScreenSharing,callDuration,activeSpeaker,joinChannel,leaveChannel,toggleAudio,toggleVideo,toggleCameraFacing,startScreenShare}=useAgoraCall(callId);

  // Detect screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth >= 1024);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    const handleMouseMove = () => {
      setShowControls(true);
      if (hideControlsTimer.current) {
        clearTimeout(hideControlsTimer.current);
      }
      hideControlsTimer.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchstart", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchstart", handleMouseMove);
      if (hideControlsTimer.current) {
        clearTimeout(hideControlsTimer.current);
      }
    };
  }, []);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      user.current = JSON.parse(storedUser);
    }
  }, []);

  const layouts = [
    {
      id: "grid",
      name: "Grid View",
      icon: <MdGridView size={32}/>,
      description: "Equal tiles",
      requiresLargeScreen: false
    },
    {
      id: "sidebar",
      name: "Sidebar View",
      icon: <MdViewSidebar size={32}/>,
      description: "Main + sidebar",
      requiresLargeScreen: true
    },
    {
      id: "spotlight",
      name: "Spotlight View",
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="14" rx="1" />
          <rect x="3" y="19" width="4" height="2" rx="1" />
          <rect x="10" y="19" width="4" height="2" rx="1" />
          <rect x="17" y="19" width="4" height="2" rx="1" />
        </svg>
      ),
      description: "Focus on speaker",
      requiresLargeScreen: false
    },
    {
      id: "pip",
      name: "Picture-in-Picture",
      icon: <MdOutlinePictureInPictureAlt size={32}/>,
      description: "Overlay view",
      requiresLargeScreen: false
    }
  ].filter(layout => !layout.requiresLargeScreen || isLargeScreen);

  const handleLayoutSelect = (layoutId) => {
    setSelectedLayout(layoutId);
    setShowLayoutMenu(false);
  };

  // Effect to replay video tracks when layout changes
  useEffect(() => {
    // console.log("local video track changed");
    if (!localVideoTrack.current || !joined) return;
    console.log("playing screenshare");
    const timer = setTimeout(() => {
      // Replay local video
      if (isVideoEnabled && localVideoTrack) {
        localVideoTrack.current.play("local-video")
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [selectedLayout, localVideoTrack, isVideoEnabled, remoteUsers, joined]);

  useEffect(()=>{
    const timer = setTimeout(() => {
     remoteUsers.forEach((remoteUser) => {
        if (remoteUser.videoTrack) {
          remoteUser.videoTrack.play(`remote-video-${remoteUser.uid}`);
        }
      });
      }, 100);

      return () => clearTimeout(timer);
  },[selectedLayout])


  const renderVideoTile = (videoId, userName, uid, hasVideo, isSpeaking, isLocal = false, className = "", isAudioMuted = false) => {
    return (
      <div
        className={`aspect-video relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-2xl border-4 transition-all duration-300 w-full h-full ${className} ${
          isSpeaking && !isAudioMuted
            ? 'border-green-500 ring-4 ring-green-500/50' 
            : 'border-gray-200 dark:border-gray-700'
        }`}
      >
        <div 
          id={videoId} 
          className="w-full h-full"
        />
        {!hasVideo && ( 
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                <User className="w-10 h-10 text-white" />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Camera off</p>
            </div>
          </div>
        )}
        
        <div className="absolute bottom-3 left-3 backdrop-blur-sm px-3 py-1.5 rounded-lg border transition-all duration-300 bg-white/90 dark:bg-black/60 border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-800 dark:text-white">
            {userName} {isLocal && "(You)"}
          </p>
        </div>

        {isSpeaking && !isAudioMuted && (
          <div className="absolute top-3 right-3 flex items-center gap-2 bg-green-500 text-white px-3 py-1.5 rounded-full shadow-lg animate-pulse">
            <div className="w-2 h-2 rounded-full bg-white"></div>
            <span className="text-xs font-medium">Speaking</span>
          </div>
        )}
      </div>
    );
  };

  const renderLayout = () => {
    const localUser = {
      videoId: "local-video",
      userName: user.current?.name || "You",
      uid: user.current?.id,
      hasVideo: isVideoEnabled,
      isSpeaking: activeSpeaker == user.current?.id,
      isLocal: true,
      isAudioMuted: !isAudioEnabled
    };

    const allRemoteUsers = remoteUsers.map(remoteUser => ({
      videoId: `remote-video-${remoteUser.uid}`,
      userName: remoteUser.name || `User ${remoteUser.uid}`,
      uid: remoteUser.uid,
      hasVideo: !!remoteUser.videoTrack,
      isSpeaking: activeSpeaker == remoteUser.uid,
      isLocal: false,
      isAudioMuted: !remoteUser.hasAudio
    }));

    const allUsers = [...allRemoteUsers, localUser];

    if (remoteUsers.length === 0) {
      return (
        <div className="grid grid-cols-1 gap-4 h-full max-h-[70vh]">
          {(isVideoEnabled || remoteUsers.length>0) && 
            <div className="relative h-full">
              {renderVideoTile(
                "local-video",
                user.current?.name || "You",
                user.current?.id,
                isVideoEnabled,
                activeSpeaker == user.current?.id,
                true,
                "",
                !isAudioEnabled
              )}
            </div>
          }
          <div className="flex items-center justify-center bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border-2 border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-600/20 flex items-center justify-center animate-pulse border-4 border-blue-500/30">
                <Phone className="w-12 h-12 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">
                Waiting for others...
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Channel: {callId}
              </p>
            </div>
          </div>
        </div>
      );
    }

    switch (selectedLayout) {
      case "grid":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full max-h-[70vh]">
            {allUsers.map((user) => (
              <div key={user.videoId} className="relative h-full">
                {renderVideoTile(
                  user.videoId,
                  user.userName,
                  user.uid,
                  user.hasVideo,
                  user.isSpeaking,
                  user.isLocal,
                  "",
                  user.isAudioMuted
                )}
              </div>
            ))}
          </div>
        );

      case "sidebar":
        // Main video should be remote user, sidebar should have local + other remotes
        const mainUser = allRemoteUsers[0] || localUser;
        const sidebarUsers = mainUser === localUser ? [] : [localUser, ...allRemoteUsers.slice(1)];
        
        return (
          <div className="flex gap-4 h-full max-h-[70vh]">
            <div className="flex-1 min-w-0">
              {renderVideoTile(
                mainUser.videoId,
                mainUser.userName,
                mainUser.uid,
                mainUser.hasVideo,
                mainUser.isSpeaking,
                mainUser.isLocal,
                "h-full",
                mainUser.isAudioMuted
              )}
            </div>
            {sidebarUsers.length > 0 && (
              <div className="w-48 lg:w-64 flex flex-col gap-3 lg:gap-4 overflow-y-auto flex-shrink-0">
                {sidebarUsers.map((user) => (
                  <div key={user.videoId} className="aspect-video flex-shrink-0">
                    {renderVideoTile(
                      user.videoId,
                      user.userName,
                      user.uid,
                      user.hasVideo,
                      user.isSpeaking,
                      user.isLocal,
                      "h-full",
                      user.isAudioMuted
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case "spotlight":
        // Prioritize speaking remote user, fallback to first remote user, then local
        const speakingRemote = allRemoteUsers.find(u => u.isSpeaking && !u.isAudioMuted);
        const spotlightMain = speakingRemote || allRemoteUsers[0] || localUser;
        const spotlightOthers = allUsers.filter(u => u.videoId !== spotlightMain.videoId);
        
        return (
          <div className="flex flex-col gap-3 lg:gap-4 h-full max-h-[70vh]">
            <div className="flex-1 min-h-0">
              {renderVideoTile(
                spotlightMain.videoId,
                spotlightMain.userName,
                spotlightMain.uid,
                spotlightMain.hasVideo,
                spotlightMain.isSpeaking,
                spotlightMain.isLocal,
                "h-full",
                spotlightMain.isAudioMuted
              )}
            </div>
            {spotlightOthers.length > 0 && (
              <div className="flex gap-3 lg:gap-4 h-24 lg:h-32 overflow-x-auto flex-shrink-0">
                {spotlightOthers.map((user) => (
                  <div key={user.videoId} className="w-36 lg:w-48 flex-shrink-0">
                    {renderVideoTile(
                      user.videoId,
                      user.userName,
                      user.uid,
                      user.hasVideo,
                      user.isSpeaking,
                      user.isLocal,
                      "h-full",
                      user.isAudioMuted
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case "pip":
        // Main should be remote user, PiP should be local user
        const pipMain = allRemoteUsers[0] || localUser;
        const pipOverlay = pipMain === localUser ? null : localUser;
        
        return (
          <div className="relative h-full max-h-[70vh]">
            {renderVideoTile(
              pipMain.videoId,
              pipMain.userName,
              pipMain.uid,
              pipMain.hasVideo,
              pipMain.isSpeaking,
              pipMain.isLocal,
              "h-full",
              pipMain.isAudioMuted
            )}
            {pipOverlay && (
              <div className="absolute bottom-4 right-4 w-40 h-28 sm:w-48 sm:h-32 lg:w-64 lg:h-40">
                {renderVideoTile(
                  pipOverlay.videoId,
                  pipOverlay.userName,
                  pipOverlay.uid,
                  pipOverlay.hasVideo,
                  pipOverlay.isSpeaking,
                  pipOverlay.isLocal,
                  "h-full",
                  pipOverlay.isAudioMuted
                )}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-50 via-gray-50 to-purple-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800 text-gray-800 dark:text-white overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        ></div>
      </div>

      <div className="relative z-10 h-screen flex flex-col">
        <div
          className={`transition-all duration-300 ${
            showControls
              ? "opacity-100 translate-y-0"
              : "opacity-0 -translate-y-full"
          }`}
        >
          <div className="bg-white/80 dark:bg-black/60 backdrop-blur-sm p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-white">
                      Call in Progress
                    </h2>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <Clock className="w-4 h-4" />
                      <span>
                        {joined && remoteUsers.length > 0
                          ? formatDuration(callDuration)
                          : "Calling..."}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
  
                  {/* Participant Count */}
                  <div className="flex items-center gap-2 bg-gray-100 dark:bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm border border-gray-200 dark:border-gray-700">
                    <Users className="w-5 h-5 text-gray-700 dark:text-white" />
                    <span className="font-semibold text-gray-800 dark:text-white">
                      {remoteUsers.length + 1}
                    </span>
                  </div>

                  {/* Video Toggle (only show if valid) */}
                  { isVideoEnabled  && (
                     <button
                      onClick={toggleCameraFacing}
                      className="p-3 rounded-full bg-gray-800 text-white"
                    >
                      <PiCameraRotate />
                    </button>
                  )}

                </div>

              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
          <div className="w-full max-w-7xl h-full">
            {renderLayout()}
          </div>
        </div>

        <div
          className={`transition-all duration-300 ${
            showControls
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-full"
          }`}
        >
          <div className="bg-white/80 dark:bg-black/80 backdrop-blur-sm p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-center gap-3 sm:gap-4 md:gap-6 flex-wrap">
                <button
                  onClick={toggleAudio}
                  className={`group relative w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-all transform hover:scale-110 active:scale-95 shadow-lg border ${
                    isAudioEnabled
                      ? "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-white"
                      : "bg-red-500 hover:bg-red-600 border-red-600 dark:border-red-500 text-white"
                  }`}
                >
                  {isAudioEnabled ? (
                    <Mic className="w-6 h-6 sm:w-7 sm:h-7" />
                  ) : (
                    <MicOff className="w-6 h-6 sm:w-7 sm:h-7" />
                  )}
                </button>

                <button
                  onClick={toggleVideo}
                  className={`group relative w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-all transform hover:scale-110 active:scale-95 shadow-lg border ${
                    isVideoEnabled
                      ? "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-white"
                      : "bg-red-500 hover:bg-red-600 border-red-600 dark:border-red-500 text-white"
                  }`}
                >
                  {isVideoEnabled ? (
                    <Video className="w-6 h-6 sm:w-7 sm:h-7" />
                  ) : (
                    <VideoOff className="w-6 h-6 sm:w-7 sm:h-7" />
                  )}
                </button>

                <button
                  onClick={startScreenShare}
                  className={`group relative w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-all transform hover:scale-110 active:scale-95 shadow-lg border ${
                    isScreenSharing
                      ? "bg-purple-500 hover:bg-purple-600 border-purple-600 dark:border-purple-500 text-white"
                      : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-white"
                  }`}
                >
                  {isScreenSharing ? (
                    <MonitorOff className="w-6 h-6 sm:w-7 sm:h-7" />
                  ) : (
                    <Monitor className="w-6 h-6 sm:w-7 sm:h-7" />
                  )}
                </button>

                {/* Layout Button */}
                <button
                  onClick={() => setShowLayoutMenu(!showLayoutMenu)}
                  className="group relative w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-all transform hover:scale-110 active:scale-95 shadow-lg border bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-white"
                >
                  <LayoutGrid className="w-6 h-6 sm:w-7 sm:h-7" />
                  <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-gray-800 dark:bg-black/80 text-white px-2 py-1 rounded">
                    Layout
                  </span>
                </button>

                <button
                  onClick={()=>{
                    leaveChannel();
                    if (socket){
                      if(remoteUsers.length==0){
                        cancelCall(callId);
                      }else{
                        endCall(callId);
                      }
                    } 
                  }}
                  className="group relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 flex items-center justify-center transition-all transform hover:scale-110 active:scale-95 shadow-2xl ml-2 text-white border-2 border-red-600 dark:border-red-500"
                >
                  <PhoneOff className="w-7 h-7 sm:w-9 sm:h-9" />
                </button>
              </div>

              <div className="mt-6 flex items-center justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      isAudioEnabled ? "bg-green-500" : "bg-red-500"
                    } animate-pulse`}
                  ></div>
                  <span className="text-gray-700 dark:text-gray-300">
                    Microphone
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      isVideoEnabled ? "bg-green-500" : "bg-gray-400"
                    }`}
                  ></div>
                  <span className="text-gray-700 dark:text-gray-300">
                    Camera
                  </span>
                </div>
                {isScreenSharing && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
                    <span className="text-gray-700 dark:text-gray-300">
                      Sharing
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Layout Selection Modal */}
      {showLayoutMenu && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 max-w-2xl w-full mx-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                Choose Layout
              </h3>
              <button
                onClick={() => setShowLayoutMenu(false)}
                className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {layouts.map((layout) => (
                <button
                  key={layout.id}
                  onClick={() => handleLayoutSelect(layout.id)}
                  className={`p-4 lg:p-6 rounded-xl border-2 transition-all hover:scale-105 ${
                    selectedLayout === layout.id
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-blue-300 dark:hover:border-blue-700"
                  }`}
                >
                  <div className="flex flex-col items-center gap-2 lg:gap-3">
                    <div className={`${
                      selectedLayout === layout.id
                        ? "text-blue-500"
                        : "text-gray-600 dark:text-gray-300"
                    }`}>
                      {layout.icon}
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-sm lg:text-base text-gray-800 dark:text-white">
                        {layout.name}
                      </p>
                      <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {layout.description}
                      </p>
                    </div>
                    {selectedLayout === layout.id && (
                      <div className="w-5 h-5 lg:w-6 lg:h-6 rounded-full bg-blue-500 flex items-center justify-center">
                        <CircleCheck/>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}