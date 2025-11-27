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
  Maximize,
  Minimize
} from "lucide-react";
import useAgoraCall2 from "@/hooks/useAgoraCall2";

export default function CallPage() {
  const { callId } = useParams();

  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const screenShareContainerRef = useRef(null);

  const user = useRef(null);
  const hideControlsTimer = useRef(null);

  const {
    localVideoTrack,
    joined,
    remoteUsers,
    isAudioEnabled,
    isVideoEnabled,
    isScreenSharing,
    callDuration,
    activeSpeaker,
    remoteScreenShare,
    joinChannel,
    leaveChannel,
    toggleAudio,
    toggleVideo,
    startScreenShare
  } = useAgoraCall2(callId);

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

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      user.current = JSON.parse(storedUser);
    }
  }, []);

  // Effect to play remote screen share
  useEffect(() => {
    if (remoteScreenShare && remoteScreenShare.videoTrack) {
      remoteScreenShare.videoTrack.play("remote-screen-share");
    }
  }, [remoteScreenShare]);

  // Effect to play local screen share preview
  useEffect(() => {
    if (isScreenSharing && screenShareContainerRef.current) {
      const tracks = Array.isArray(localVideoTrack.current) 
        ? localVideoTrack.current 
        : [localVideoTrack.current];
      
      tracks.forEach(track => {
        if (track && track.play) {
          track.play("local-screen-share");
        }
      });
    }
  }, [isScreenSharing]);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (screenShareContainerRef.current?.requestFullscreen) {
        screenShareContainerRef.current.requestFullscreen();
        setIsFullscreen(true);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const renderVideoTile = (videoId, userName, uid, hasVideo, isSpeaking, isLocal = false) => {
    return (
      <div
        className={`relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-2xl border-4 transition-all duration-300 h-full w-full ${
          isSpeaking 
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
              <p className="text-gray-700 dark:text-gray-300 font-medium">{userName}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Camera off</p>
            </div>
          </div>
        )}
        
        {/* User name overlay */}
        <div className={`absolute bottom-3 left-3 backdrop-blur-sm px-3 py-1.5 rounded-lg border transition-all duration-300 ${
          isSpeaking 
            ? 'bg-green-500/90 border-green-400 text-white' 
            : 'bg-white/90 dark:bg-black/60 border-gray-200 dark:border-gray-700'
        }`}>
          <p className={`text-sm font-medium ${
            isSpeaking ? 'text-white' : 'text-gray-800 dark:text-white'
          }`}>
            {userName} {isLocal && "(You)"}
          </p>
        </div>

        {/* Speaking indicator */}
        {isSpeaking && (
          <div className="absolute top-3 right-3 flex items-center gap-2 bg-green-500 text-white px-3 py-1.5 rounded-full shadow-lg animate-pulse">
            <div className="w-2 h-2 rounded-full bg-white"></div>
            <span className="text-xs font-medium">Speaking</span>
          </div>
        )}
      </div>
    );
  };

  const isScreenShareActive = isScreenSharing || remoteScreenShare;

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-50 via-gray-50 to-purple-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800 text-gray-800 dark:text-white overflow-hidden">
      
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 h-screen flex flex-col">
        
        {/* Header - Call Info */}
        <div className={`transition-all duration-300 ${showControls ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full'}`}>
          <div className="bg-white/80 dark:bg-black/60 backdrop-blur-sm p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-white">Call in Progress</h2>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <Clock className="w-4 h-4" />
                      <span>{joined && remoteUsers.length > 0 ? formatDuration(callDuration) : "Calling..."}</span>
                    </div>
                  </div>
                </div>

                {/* Participant Count */}
                <div className="flex items-center gap-2 bg-gray-100 dark:bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm border border-gray-200 dark:border-gray-700">
                  <Users className="w-5 h-5 text-gray-700 dark:text-white" />
                  <span className="font-semibold text-gray-800 dark:text-white">{remoteUsers.length + 1}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Video Grid */}
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
          <div className="w-full max-w-7xl h-full">
            {isScreenShareActive ? (
              /* SCREEN SHARE LAYOUT */
              <div className="h-full flex flex-col gap-4">
                {/* Main screen share area */}
                <div 
                  ref={screenShareContainerRef}
                  className="flex-1 bg-black rounded-2xl overflow-hidden shadow-2xl border-2 border-gray-300 dark:border-gray-600 relative"
                >
                  <div
                    id={isScreenSharing ? "local-screen-share" : "remote-screen-share"}
                    className="w-full h-full"
                    style={{ objectFit: 'contain' }}
                  />
                  
                  {/* Fullscreen toggle button */}
                  <button
                    onClick={toggleFullscreen}
                    className="absolute top-4 right-4 bg-black/60 hover:bg-black/80 text-white p-3 rounded-lg backdrop-blur-sm transition-all"
                  >
                    {isFullscreen ? (
                      <Minimize className="w-5 h-5" />
                    ) : (
                      <Maximize className="w-5 h-5" />
                    )}
                  </button>

                  {/* Screen share info */}
                  <div className="absolute top-4 left-4 bg-purple-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                    <Monitor className="w-5 h-5" />
                    <span className="font-medium">
                      {isScreenSharing ? "You're presenting" : "Viewing presentation"}
                    </span>
                  </div>
                </div>

                {/* Small video tiles below screen share */}
                <div className="flex gap-4 h-32">
                  {/* Local user tile */}
                  <div className="flex-1 min-w-0">
                    {renderVideoTile(
                      "local-video-thumb",
                      user.current?.name || "You",
                      user.current?.id,
                      isVideoEnabled,
                      activeSpeaker === user.current?.id,
                      true
                    )}
                  </div>

                  {/* Remote user tiles */}
                  {remoteUsers.map((remoteUser) => (
                    <div key={remoteUser.uid} className="flex-1 min-w-0">
                      {renderVideoTile(
                        `remote-video-thumb-${remoteUser.uid}`,
                        remoteUser.name || `User ${remoteUser.uid}`,
                        remoteUser.uid,
                        !!remoteUser.videoTrack,
                        activeSpeaker === remoteUser.uid,
                        false
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* NORMAL VIDEO LAYOUT - Always show both users */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full max-h-[70vh]">
                {/* Local user tile - Always visible */}
                {remoteUsers.length > 0 && 
                <div className="relative">
                  {renderVideoTile(
                    "local-video",
                    user.current?.name || "You",
                    user.current?.id,
                    isVideoEnabled,
                    activeSpeaker === user.current?.id,
                    true
                  )}
                </div>}

                {/* Remote user tile or waiting state */}
                {remoteUsers.length > 0 ? (
                  remoteUsers.map((remoteUser) => (
                    <div key={remoteUser.uid} className="relative">
                      {renderVideoTile(
                        `remote-video-${remoteUser.uid}`,
                        remoteUser.name || `User ${remoteUser.uid}`,
                        remoteUser.uid,
                        !!remoteUser.videoTrack,
                        activeSpeaker === remoteUser.uid,
                        false
                      )}
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-center bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border-2 border-gray-200 dark:border-gray-700">
                    <div className="text-center">
                      <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-600/20 flex items-center justify-center animate-pulse border-4 border-blue-500/30">
                        <Phone className="w-12 h-12 text-blue-500" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">Waiting for others...</h3>
                      <p className="text-gray-600 dark:text-gray-400">Channel: {callId}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Controls */}
        <div className={`transition-all duration-300 ${showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full'}`}>
          <div className="bg-white/80 dark:bg-black/80 backdrop-blur-sm p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700">
            <div className="max-w-4xl mx-auto">
              
              {/* Control Buttons */}
              <div className="flex items-center justify-center gap-3 sm:gap-4 md:gap-6 flex-wrap">
                
                {/* Microphone */}
                <button
                  onClick={toggleAudio}
                  className={`group relative w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-all transform hover:scale-110 active:scale-95 shadow-lg border ${
                    isAudioEnabled 
                      ? 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-white' 
                      : 'bg-red-500 hover:bg-red-600 border-red-600 dark:border-red-500 text-white'
                  }`}
                  aria-label={isAudioEnabled ? "Mute" : "Unmute"}
                >
                  {isAudioEnabled ? (
                    <Mic className="w-6 h-6 sm:w-7 sm:h-7" />
                  ) : (
                    <MicOff className="w-6 h-6 sm:w-7 sm:h-7" />
                  )}
                  <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-gray-800 dark:bg-black/80 text-white px-2 py-1 rounded">
                    {isAudioEnabled ? "Mute" : "Unmute"}
                  </span>
                </button>

                {/* Video */}
                <button
                  onClick={toggleVideo}
                  className={`group relative w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-all transform hover:scale-110 active:scale-95 shadow-lg border ${
                    isVideoEnabled 
                      ? 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-white' 
                      : 'bg-red-500 hover:bg-red-600 border-red-600 dark:border-red-500 text-white'
                  }`}
                  aria-label={isVideoEnabled ? "Turn off video" : "Turn on video"}
                >
                  {isVideoEnabled ? (
                    <Video className="w-6 h-6 sm:w-7 sm:h-7" />
                  ) : (
                    <VideoOff className="w-6 h-6 sm:w-7 sm:h-7" />
                  )}
                  <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-gray-800 dark:bg-black/80 text-white px-2 py-1 rounded">
                    {isVideoEnabled ? "Stop video" : "Start video"}
                  </span>
                </button>

                {/* Screen Share */}
                <button
                  onClick={startScreenShare}
                  className={`group relative w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-all transform hover:scale-110 active:scale-95 shadow-lg border ${
                    isScreenSharing 
                      ? 'bg-purple-500 hover:bg-purple-600 border-purple-600 dark:border-purple-500 text-white' 
                      : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-white'
                  }`}
                  aria-label={isScreenSharing ? "Stop sharing" : "Share screen"}
                >
                  {isScreenSharing ? (
                    <MonitorOff className="w-6 h-6 sm:w-7 sm:h-7" />
                  ) : (
                    <Monitor className="w-6 h-6 sm:w-7 sm:h-7" />
                  )}
                  <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-gray-800 dark:bg-black/80 text-white px-2 py-1 rounded">
                    {isScreenSharing ? "Stop sharing" : "Share screen"}
                  </span>
                </button>

                {/* End Call */}
                <button
                  onClick={leaveChannel}
                  className="group relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 flex items-center justify-center transition-all transform hover:scale-110 active:scale-95 shadow-2xl ml-2 text-white border-2 border-red-600 dark:border-red-500"
                  aria-label="End call"
                >
                  <PhoneOff className="w-7 h-7 sm:w-9 sm:h-9" />
                  <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-gray-800 dark:bg-black/80 text-white px-2 py-1 rounded">
                    End call
                  </span>
                </button>
              </div>

              {/* Status Indicators */}
              <div className="mt-6 flex items-center justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isAudioEnabled ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
                  <span className="text-gray-700 dark:text-gray-300">Microphone</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isVideoEnabled ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                  <span className="text-gray-700 dark:text-gray-300">Camera</span>
                </div>
                {isScreenSharing && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
                    <span className="text-gray-700 dark:text-gray-300">Sharing</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}