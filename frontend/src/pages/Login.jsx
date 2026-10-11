import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { TripShieldMark } from "@/components/BrandMark";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("ndvtechsys.solutions@gmail.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const loggedUser = await login(email, password, "dealer");
      navigate(loggedUser.role === "dealer" ? "/dealer" : "/app");
    } catch (err) {
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-white flex flex-col justify-center items-center p-4">
      {/* Brand Header */}
      <button
        onClick={() => navigate("/")}
        className="flex items-center gap-2.5 mb-8 cursor-pointer"
      >
        <TripShieldMark size={32} glow />
        <span className="font-display font-extrabold text-[#e60012] text-xl tracking-wide">
          TRIPSHIELD
        </span>
      </button>

      {/* Login Card */}
      <div className="w-full max-w-md rounded-2xl bg-[#0c111d] border border-white/10 p-6 sm:p-8 shadow-2xl">
        <h2 className="font-display font-bold text-white text-xl sm:text-2xl uppercase tracking-tight">
          Service Center Login
        </h2>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              placeholder="ndvtechsys.solutions@gmail.com"
              required
              className="w-full px-4 py-3 rounded-xl bg-[#07090e] border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-[#e60012] focus:ring-1 focus:ring-[#e60012] text-sm transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              placeholder="••••••••••••"
              required
              className="w-full px-4 py-3 rounded-xl bg-[#07090e] border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-[#e60012] focus:ring-1 focus:ring-[#e60012] text-sm transition-colors"
            />
          </div>

          {error && (
            <p className="text-xs text-red-500 font-medium">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-[#e60012] hover:bg-[#c90812] text-white font-semibold text-sm transition-colors cursor-pointer disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
