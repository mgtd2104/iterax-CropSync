import React, { useState } from "react";
import { useUser } from "../context/UserContext";
import { useNavigate } from "react-router-dom";

export default function Landing() {
  const { loginWithEmail, signupWithEmail, loginAsGuest, loading, error } = useUser();
  const navigate = useNavigate();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");
    if (!email || !password) {
      setLocalError("Please enter both email and password.");
      return;
    }
    try {
      if (isSignUp) {
        await signupWithEmail(email, password);
      } else {
        await loginWithEmail(email, password);
      }
      navigate("/onboarding");
    } catch (err) {
      setLocalError(err.message || "Authentication failed. Please try again.");
    }
  };

  const handleGuestLogin = async () => {
    setLocalError("");
    try {
      await loginAsGuest();
      navigate("/onboarding");
    } catch (err) {
      setLocalError(err.message || "Failed to continue as guest.");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAF7] text-[#222222] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#F1F7F3] border border-[#2D6A4F]/20 rounded-xl p-6 shadow-sm">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-[#1B4332]">AgriSense</h1>
          <p className="text-[#222222] mt-2 text-base">
            Smart AI Farm Advisory & Real-time Field Monitoring
          </p>
        </div>

        {(localError || error) && (
          <div className="mb-4 p-3 bg-[#D64545]/10 border border-[#D64545] text-[#D64545] rounded-lg text-sm">
            {localError || error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-[#1B4332] mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
              placeholder="farmer@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1B4332] mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#2D6A4F] text-white font-semibold rounded-lg hover:bg-[#1B4332] transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>Please wait...</span>
            ) : isSignUp ? (
              <span>Create Account</span>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm font-medium text-[#2D6A4F] hover:underline"
          >
            {isSignUp
              ? "Already have an account? Sign In"
              : "Don't have an account? Sign Up"}
          </button>
        </div>

        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <span className="relative bg-[#F1F7F3] px-3 text-xs text-gray-500 uppercase font-semibold">
            Or
          </span>
        </div>

        <button
          type="button"
          onClick={handleGuestLogin}
          disabled={loading}
          className="w-full py-3 border-2 border-[#2D6A4F] text-[#2D6A4F] font-semibold rounded-lg hover:bg-[#2D6A4F]/10 transition-colors flex items-center justify-center gap-2"
        >
          <span>Continue as Guest</span>
        </button>
      </div>
    </div>
  );
}
