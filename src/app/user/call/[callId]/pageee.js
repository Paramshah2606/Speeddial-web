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
  Clock
} from "lucide-react";
import useAgoraCall from "@/hooks/useAgoraCall";


// AgoraRTC.setLogLevel(2);

// // Catch internal errors silently so Next.js doesn't print them
// AgoraRTC.on("exception", (evt) => {
//   if (evt.code === "PERMISSION_DENIED") {
//     console.log("heloooo");
//     return;
//   }
// });

export default function CallPage() {
  const { callId } = useParams();

  const [showControls, setShowControls] = useState(true);

  const user = useRef(null);
  const hideControlsTimer = useRef(null);

  const {localVideoTrack,joined,remoteUsers,isAudioEnabled,isVideoEnabled,isScreenSharing,callDuration,activeSpeaker,joinChannel,leaveChannel,toggleAudio,toggleVideo,startScreenShare}=useAgoraCall(callId);

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
          <div className="w-full max-w-7xl">
            {remoteUsers.length > 0 ? (
              <div className={`grid gap-4 h-full ${
                remoteUsers.length === 1 ? 'grid-cols-1' :
                remoteUsers.length === 2 ? 'grid-cols-1 md:grid-cols-2' :
                remoteUsers.length <= 4 ? 'grid-cols-2' :
                'grid-cols-2 md:grid-cols-3'
              }`}>
                {remoteUsers.map((user) => (
                  <div
                    key={user.uid}
                    className="relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-2xl aspect-video border border-gray-200 dark:border-gray-700"
                  >
                    <div 
                      id={`remote-video-${user.uid}`} 
                      className="w-full h-full"
                    />
                    {!user.videoTrack && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
                        <div className="text-center">
                          <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                            <User className="w-10 h-10 text-white" />
                          </div>
                          <p className="text-gray-700 dark:text-gray-300 font-medium">User {user.uid}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Camera off</p>
                        </div>
                      </div>
                    )}
                    
                    {/* User overlay info */}
                    <div className="absolute bottom-3 left-3 bg-white/90 dark:bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700">
                      <p className="text-sm font-medium text-gray-800 dark:text-white">Participant</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // No remote users - show waiting state
              <div className="flex items-center justify-center h-full">
                <div className="text-center max-w-md">
                  <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-600/20 flex items-center justify-center animate-pulse border-4 border-blue-500/30 dark:border-blue-400/30">
                    <Phone className="w-16 h-16 text-blue-500 dark:text-blue-400" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-2 text-gray-800 dark:text-white">Waiting for others to join...</h3>
                  <p className="text-gray-600 dark:text-gray-400">Channel: {callId}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Local Video Preview (if enabled) */}
        {isVideoEnabled && (
          <div className="absolute top-20 right-4 sm:top-24 sm:right-6 w-32 h-24 sm:w-48 sm:h-36 bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden border-2 border-gray-300 dark:border-white/20 z-20">
            <div
              id="local-video"
              className="w-full h-full"
              ref={(el) => {
                if (el && localVideoTrack.current) {
                  localVideoTrack.current.stop();
                  localVideoTrack.current.play(el);
                }
              }}
            />
            <div className="absolute bottom-2 left-2 bg-white/90 dark:bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-xs text-gray-800 dark:text-white border border-gray-200 dark:border-gray-700">
              You
            </div>
          </div>
        )}

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

                {/* End Call - Larger, more prominent */}
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
