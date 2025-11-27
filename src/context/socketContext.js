"use client";

import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [callState, setCallState] = useState({
    incoming: null,
    activeCall: null,
  });
  const router=useRouter();

  useEffect(() => {
    // connect to backend socket server
    const s = io(`${process.env.NEXT_PUBLIC_SERVER_DEV_URL}`, {
      transports: ["websocket"],
      autoConnect: true,
    });

    setSocket(s);

    // when connected → tell backend this user is online
    s.on("connect", () => {
      console.log("Frontend connected:", s.id);
    });

    s.on("call:incoming", (data) => {
      console.log("call:incoming", data);
      setCallState((prev) => ({
        ...prev,
        incoming: data,
      }));
    });

    s.on("call:accepted", (data) => {
      console.log("call:accepted", data);
      setCallState((prev) => ({
        ...prev,
        activeCall: data,
      }));
      router.push(`/user/call/${data.callId}`)
    });

    s.on("call:outgoing", (data) => {
      console.log("call:outgoing", data);
      setCallState((prev) => ({
        ...prev,
        outgoing: data,
      }));
      router.push(`/user/call/${data.callId}`)
    });

    // =============== Call Rejected ===============
    s.on("call:rejected", (data) => {
      console.log("call:rejected", data);
      setCallState((prev) => ({
        ...prev,
        incoming: null,
        activeCall: null,
      }));
      toast.error("Call rejected");
      router.push(`/user/home`)
    });

    // =============== Call Canceled ===============
    s.on("call:canceled", (data) => {
      console.log("call:canceled", data);
      setCallState((prev) => ({
        ...prev,
        incoming: null,
        activeCall: null,
      }));
    });

    // =============== Call Ended ===============
    s.on("call:ended", (data) => {
      console.log("call:ended", data);
      setCallState({
        incoming: null,
        activeCall: null,
      });
      toast.error("Call ended");
      router.push(`/user/home`);
    });

    return () => s.disconnect();
  }, []);

  const requestCall = (from, to) => {
    socket.emit("call:request", { from, to });
  };

  const acceptCall = (callId) => {
    socket.emit("call:accept", { callId });
  };

  const rejectCall = (callId) => {
    socket.emit("call:reject", { callId });
  };

  const cancelCall = (callId) => {
    socket.emit("call:cancel", { callId });
  };

  const endCall = (callId) => {
    socket.emit("call:end", { callId });
  };

  useEffect(() => {
    if (!socket) return;

    const storedUser = localStorage.getItem("user");
    if (!storedUser) return;

    const user = JSON.parse(storedUser);

    socket.emit("user:online", {
      virtualNumber: user.callingNumber,
      userId: user.id,
    });

  }, [socket]);

  return (
    <SocketContext.Provider value={{socket,callState,requestCall,acceptCall,rejectCall,cancelCall,endCall}}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
