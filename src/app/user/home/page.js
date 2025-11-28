"use client";

import { useEffect, useState } from "react";
import { Phone, PhoneCall, Delete, Menu, X, History, Grid3x3, PhoneIncoming, PhoneOutgoing, PhoneMissed, Clock, User } from "lucide-react";
import IncomingCallPopup from "@/components/IncomingCallPopup";
import constant from "@/config/constant";
import { useSocket } from "@/context/socketContext";
import { useRouter } from "next/navigation";

export default function Home() {
  const [incomingCall, setIncomingCall] = useState(null);
  const [showIncomingPopup, setShowIncomingPopup] = useState(false);
  const [user, setUser] = useState(null);
  const [to, setTo] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("dialer"); // "dialer" or "history"
  const [callHistory, setCallHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const {socket} = useSocket();
  const router=useRouter();


  // Fetch call history
  useEffect(() => {
    const fetchHistory = async () => {
      if (!user?.id) return;
      
      setLoadingHistory(true);
      try {
        const response = await fetch(
          `${constant.Server_Url}/api/call/history?userId=${user.id}`
        );
        const data = await response.json();
        console.log("dataa",data.history);
        setCallHistory(data.history || []);
      } catch (error) {
        console.error("Failed to fetch history:", error);
      } finally {
        setLoadingHistory(false);
      }
    };

    if (activeTab === "history") {
      fetchHistory();
    }
  }, [activeTab, user?.id]);

   useEffect(() => {
  if (!socket) return;
    
  socket.on("call:incoming", (data) => {
    console.log("Incoming call:", data);
    setIncomingCall(data);  // store info like caller name, id, virtualNumber
    setShowIncomingPopup(true);
  });

  socket.on("call:canceled", (data) => {
      setIncomingCall(null);  // store info like caller name, id, virtualNumber
      setShowIncomingPopup(false);
  });

  socket.on("call:missed", (data) => {
      setIncomingCall(null);  // store info like caller name, id, virtualNumber
      setShowIncomingPopup(false);
  });

  return () => {
    socket.off("call:incoming");
    socket.off("call:canceled");
  };
}, [socket]);

useEffect(()=>{
    if (!socket || !user) return;
    socket.emit("user:online", {
    virtualNumber: user.callingNumber,
    userId: user.id,
});
},[user])

useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (activeTab !== "dialer") return;
      
      if (e.key >= "0" && e.key <= "9") {
        handleDigitClick(e.key);
      }
      if (e.key === "Backspace") {
        handleBackspace();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [to, activeTab]);

  function formatVirtualNumber(value) {
    const digits = value.replace(/\D/g, "").slice(0, 6);
    const p1 = digits.slice(0, 3);
    const p2 = digits.slice(3, 6);
    if (digits.length > 3) return `${p1}-${p2}`;
    return p1;
  }

  function handleDigitClick(digit) {
    const digits = to.replace(/\D/g, "");
    if (digits.length < 6) {
      setTo(formatVirtualNumber(digits + digit));
    }
  }

  function handleBackspace() {
    const digits = to.replace(/\D/g, "");
    const newDigits = digits.slice(0, -1);
    setTo(formatVirtualNumber(newDigits));
  }

  function handleCall() {
    const digits = to.replace(/\D/g, "");
    if (digits.length !== 6) return;
    socket.emit("call:request", {
      from: user?.callingNumber,
      to: formatVirtualNumber(digits),
      fromUser: user?.username
    });
  }

  const handleAccept = () => {
    socket.emit("call:accept", {
      callId: incomingCall.callId,
      from: incomingCall.callerVirtualNumber,
    });
    setShowIncomingPopup(false);
    router.push(`/user/call/${incomingCall.callId}`);
  };

  const handleReject = () => {
    socket.emit("call:reject", {
      callId: incomingCall.callId,
      from: incomingCall.callerVirtualNumber,
    });
    setShowIncomingPopup(false);
  };

  const onLogout = () => {
    try {
      localStorage.removeItem('user');
      router.push('/auth');
      socket.disconnect();
    } catch (error) {
      console.log("Error", error);
    }
  };

  const getCallStatusIcon = (call) => {
    if (call.userStatus === "missed") {
      return <PhoneMissed className="w-5 h-5 text-red-500" />;
    }
    if (call.userRole === "host") {
      return <PhoneOutgoing className="w-5 h-5 text-blue-500" />;
    }
    return <PhoneIncoming className="w-5 h-5 text-green-500" />;
  };

  const getCallStatusText = (call) => {
    if (call.userStatus === "missed") return "Missed Call";
    if (call.userStatus === "rejected") return "Call Rejected";
    if (call.status === "missed") return "Call Missed"
    if (call.status === "canceled") return "Call Cancelled"
    if (call.status === "ended") return "Call Ended";
    if (call.status === "ringing") return "Ringing";
    return call.status;
  };

  const getOtherParticipant = (call) => {
    return call.participants.find(p => p.userId !== user?.id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {showIncomingPopup && (
        <IncomingCallPopup
          data={incomingCall}
          onAccept={handleAccept}
          onReject={handleReject}
        />
      )}

      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                <Phone className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  SpeedDial
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  <span className="text-green-500 flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    Connected
                  </span>
                </p>
              </div>
            </div>

            {user && (
              <div className="flex gap-3">
                <div className="hidden sm:flex items-center gap-3 bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold">
                    {(user.username || "U")[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                      {user.username || "User"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {user.callingNumber || "No Number"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  className="hidden sm:block bg-red-600 hover:bg-red-700 px-3 py-0.5 rounded-md text-sm transition"
                >
                  Logout
                </button>
              </div>
            )}

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="sm:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white text-black"
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {menuOpen && user && (
            <div className="sm:hidden mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-xl">
              <div className="flex justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                    {(user.username || "U")[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-gray-200">
                      {user.username || "User"}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {user.callingNumber || "No Number"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  className="h-full bg-red-600 hover:bg-red-700 px-3 py-0.5 rounded-md text-sm transition"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-center">
          <div className="w-full max-w-md">
            {/* Tab Navigation */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-2 mb-4">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setActiveTab("dialer")}
                  className={`py-3 px-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                    activeTab === "dialer"
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  <Grid3x3 className="w-5 h-5" />
                  Dialer
                </button>
                <button
                  onClick={() => setActiveTab("history")}
                  className={`py-3 px-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                    activeTab === "history"
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  <History className="w-5 h-5" />
                  History
                </button>
              </div>
            </div>

            {/* Dialer Tab */}
            {activeTab === "dialer" && (
              <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-6 sm:p-8">
                <div className="mb-8">
                  <div className="text-center py-6 px-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border-2 border-gray-200 dark:border-gray-700">
                    <div className="text-4xl sm:text-5xl font-mono font-semibold text-gray-800 dark:text-gray-100 tracking-wider min-h-[3rem] flex items-center justify-center">
                      {to || (
                        <span className="text-gray-400 dark:text-gray-500 text-2xl sm:text-3xl">
                          Enter Number
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
                    <button
                      key={d}
                      onClick={() => handleDigitClick(String(d))}
                      className="aspect-square rounded-2xl bg-gray-100 dark:bg-gray-700 
                      text-gray-800 dark:text-gray-100 text-3xl sm:text-4xl font-semibold
                      shadow-md hover:shadow-lg hover:scale-105 active:scale-95 
                      transition-all duration-150 border border-gray-200 dark:border-gray-600"
                    >
                      {d}
                    </button>
                  ))}

                  <div className="aspect-square"></div>

                  <button
                    onClick={() => handleDigitClick("0")}
                    className="aspect-square rounded-2xl bg-gray-100 dark:bg-gray-700 
                    text-gray-800 dark:text-gray-100 text-3xl sm:text-4xl font-semibold
                    shadow-md hover:shadow-lg hover:scale-105 active:scale-95 
                    transition-all duration-150 border border-gray-200 dark:border-gray-600"
                  >
                    0
                  </button>

                  <button
                    onClick={handleBackspace}
                    className="aspect-square rounded-2xl bg-red-50 dark:bg-red-900/30 
                    text-red-500 dark:text-red-400 flex items-center justify-center
                    shadow-md hover:shadow-lg hover:scale-105 active:scale-95 
                    transition-all duration-150 border border-red-200 dark:border-red-800"
                  >
                    <Delete className="w-8 h-8 sm:w-10 sm:h-10" />
                  </button>
                </div>

                <button
                  onClick={handleCall}
                  disabled={to.replace(/\D/g, "").length !== 6}
                  className="w-full py-5 text-xl font-semibold rounded-2xl
                  bg-gradient-to-r from-green-500 to-emerald-600 text-white 
                  shadow-xl hover:shadow-2xl transform transition-all
                  hover:scale-[1.02] active:scale-95 disabled:from-gray-400 
                  disabled:to-gray-500 disabled:cursor-not-allowed disabled:hover:scale-100
                  flex items-center justify-center gap-3"
                >
                  <PhoneCall className="w-6 h-6" />
                  Call
                </button>
              </div>
            )}

            {/* History Tab */}
            {activeTab === "history" && (
              <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Clock className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                    Call History
                  </h2>
                </div>

                {loadingHistory ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                  </div>
                ) : callHistory.length === 0 ? (
                  <div className="text-center py-12">
                    <Phone className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">No call history yet</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                      Your call history will appear here
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[600px] overflow-y-auto">
                    {callHistory.map((call) => {
                      const otherParticipant = getOtherParticipant(call);
                      return (
                        <div
                          key={call.callId}
                          className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex-shrink-0">
                              {getCallStatusIcon(call)}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <User className="w-4 h-4 text-gray-400" />
                                <p className="font-semibold text-gray-800 dark:text-gray-200 truncate">
                                  {otherParticipant?.username || "Unknown"}
                                </p>
                              </div>
                              
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {getCallStatusText(call)}
                              </p>
                              
                              {call.isGroupCall && (
                                <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs rounded-full">
                                  Group Call
                                </span>
                              )}
                            </div>

                            <button
                              onClick={() => {
                                // Quick redial functionality
                                setActiveTab("dialer");
                                // You would set the number here based on the participant
                              }}
                              className="flex-shrink-0 p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-500 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition"
                            >
                              <PhoneCall className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Quick Info */}
            <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
              {activeTab === "dialer" ? (
                <p>Enter a 6-digit virtual number to make a call</p>
              ) : (
                <p>View your recent call activity</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}