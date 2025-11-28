"use client";
import { useSocket } from "@/context/socketContext";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Phone, User, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { toast } from "react-toastify";
import constant from "@/config/constant";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router=useRouter();

  async function handleSubmit() {
    const cleanUsername = username.trim();
    const cleanPassword = password.trim();
    if (!cleanUsername || !cleanPassword) return;
    
    setLoading(true);
     try {
      const endpoint = isLogin ? "/api/login" : "/api/register";
      const res = await fetch(`${constant.Server_Url}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username:cleanUsername, password:cleanPassword }),
      });

      const data = await res.json();
      console.log(data);
      
      if (data.status=="success") {
        const user = data.user;
        localStorage.setItem("user", JSON.stringify(user));
        router.push("/user/home");
      } else {
        toast.error(data.error || "Authentication failed");
      }
    } catch (error) {
      console.log("Auth error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200/30 dark:bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-200/30 dark:bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Main Auth Container */}
      <div className="relative w-full max-w-md">
        
        {/* Logo/Brand Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-2xl mb-4 transform hover:scale-110 transition-transform">
            <Phone className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            SpeedDial
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {isLogin ? "Welcome back! Sign in to continue" : "Create your account to get started"}
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
          
          {/* Toggle Tabs */}
          <div className="flex gap-2 mb-8 p-1 bg-gray-100 dark:bg-gray-900 rounded-2xl">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
                isLogin
                  ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-md"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
                !isLogin
                  ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-md"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Input Fields */}
          <div className="space-y-6">
            
            {/* Username Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Username
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <User className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter your username"
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all text-gray-800 dark:text-gray-200 placeholder-gray-400"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter your password"
                  className="w-full pl-12 pr-12 py-4 bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all text-gray-800 dark:text-gray-200 placeholder-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Forgot Password (only for login) */}
            {isLogin && (
              <div className="flex justify-end">
                <button
                  type="button"
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={loading || !username || !password}
              className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 group"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </div>
              ) : (
                <>
                  <span>{isLogin ? "Sign In" : "Create Account"}</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>

          {/* Additional Info */}
          <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            {isLogin ? (
              <p>
                Don't have an account?{" "}
                <button
                  onClick={() => setIsLogin(false)}
                  className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                >
                  Sign up now
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{" "}
                <button
                  onClick={() => setIsLogin(true)}
                  className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                >
                  Sign in
                </button>
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>By continuing, you agree to our</p>
          <div className="flex items-center justify-center gap-3 mt-2">
            <button className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline">
              Terms of Service
            </button>
            <span>•</span>
            <button className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline">
              Privacy Policy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
