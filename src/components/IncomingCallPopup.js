import { useState } from "react";
import { PhoneCall, PhoneMissed, PhoneIncoming, Maximize2, Minimize2 } from "lucide-react";

export default function IncomingCallPopup({ data, onAccept, onReject }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (isExpanded) {
    // Full screen expanded view
    return (
      <div className="fixed inset-0 z-50 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center animate-fadeIn">
        <div className="text-center px-6 max-w-md w-full">
          
          {/* Animated Phone Icon */}
          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-40 h-40 rounded-full bg-blue-500/20 dark:bg-blue-400/10 animate-ping"></div>
            </div>
            <div className="relative w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-2xl">
              <PhoneIncoming className="w-16 h-16 text-white animate-bounce" />
            </div>
          </div>

          {/* Caller Info */}
          <div className="mb-12">
            <h2 className="text-4xl font-bold text-gray-800 dark:text-white mb-3">
              {data?.fromUser || "Unknown Caller"}
            </h2>
            <p className="text-2xl text-gray-600 dark:text-gray-300 mb-2">
              {data?.from || ""}
            </p>
            <p className="text-lg text-gray-500 dark:text-gray-400">
              Incoming call...
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-8 justify-center items-center mb-8">
            {/* Decline Button */}
            <button
              onClick={onReject}
              className="flex flex-col items-center gap-3 group"
            >
              <div className="w-20 h-20 rounded-full bg-red-500 hover:bg-red-600 shadow-xl flex items-center justify-center transform hover:scale-110 active:scale-95 transition-all">
                <PhoneMissed className="w-10 h-10 text-white" />
              </div>
              <span className="text-gray-700 dark:text-white font-semibold text-sm">Decline</span>
            </button>

            {/* Accept Button */}
            <button
              onClick={onAccept}
              className="flex flex-col items-center gap-3 group"
            >
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-xl flex items-center justify-center transform hover:scale-110 active:scale-95 transition-all">
                <PhoneCall className="w-12 h-12 text-white" />
              </div>
              <span className="text-gray-700 dark:text-white font-semibold">Accept</span>
            </button>
          </div>

          {/* Minimize Button */}
          <button
            onClick={() => setIsExpanded(false)}
            className="px-6 py-3 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 shadow-lg transition-all flex items-center gap-2 mx-auto"
          >
            <Minimize2 className="w-4 h-4" />
            <span className="text-sm font-semibold">Minimize</span>
          </button>
        </div>
      </div>
    );
  }

  // Mobile & Desktop notification views
  return (
    <>
      {/* Mobile View - Top Notification with gaps */}
      <div className="md:hidden fixed top-4 left-4 right-4 z-50 animate-slideDown">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-4">
            <div className="flex items-center gap-3 mb-4">
              
              {/* Avatar/Icon */}
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                <PhoneIncoming className="w-6 h-6 text-white animate-bounce" />
              </div>

              {/* Caller Info */}
              <div className="flex-1 min-w-0">
                <p className="text-gray-800 dark:text-white font-semibold text-base truncate">
                  {data?.fromUser || "Unknown Caller"}
                </p>
                <p className="text-gray-600 dark:text-gray-400 text-sm truncate">
                  {data?.from || "Incoming call..."}
                </p>
              </div>

              {/* Expand button */}
              <button
                onClick={() => setIsExpanded(true)}
                className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 active:scale-95 transition-all flex items-center justify-center shadow-md border border-gray-200 dark:border-gray-600"
                aria-label="Expand"
              >
                <Maximize2 className="w-4 h-4 text-gray-700 dark:text-gray-300" />
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={onReject}
                className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold shadow-md hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <PhoneMissed className="w-4 h-4" />
                <span className="text-sm">Decline</span>
              </button>
              <button
                onClick={onAccept}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold shadow-md hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <PhoneCall className="w-4 h-4" />
                <span className="text-sm">Accept</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop View - Bottom Right Popup */}
      <div className="hidden md:block fixed bottom-6 right-6 z-50 animate-slideUp">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-96 overflow-hidden">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PhoneIncoming className="w-5 h-5 text-white" />
              <span className="text-white font-semibold text-sm">Incoming Call</span>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => setIsExpanded(true)}
                className="w-8 h-8 rounded-lg hover:bg-white/20 transition-colors flex items-center justify-center"
                aria-label="Expand"
              >
                <Maximize2 className="w-4 h-4 text-white" />
              </button>
              <button
                onClick={onReject}
                className="w-8 h-8 rounded-lg hover:bg-white/20 transition-colors flex items-center justify-center"
                aria-label="Reject"
              >
                <PhoneMissed className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-5">
            <div className="flex items-center gap-4 mb-5">
              {/* Avatar */}
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                <PhoneIncoming className="w-8 h-8 text-white" />
              </div>

              {/* Caller Details */}
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white truncate mb-1">
                  {data?.fromUser || "Unknown Caller"}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                  {data?.from || "No number"}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={onReject}
                className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold shadow-lg hover:shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <PhoneMissed className="w-5 h-5" />
                <span>Decline</span>
              </button>
              <button
                onClick={onAccept}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold shadow-lg hover:shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <PhoneCall className="w-5 h-5" />
                <span>Accept</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideDown {
          from {
            transform: translateY(-120%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            transform: translateY(120%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </>
  );
}