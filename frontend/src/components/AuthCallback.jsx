import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { ShieldCheck } from "lucide-react";

// REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
export default function AuthCallback() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const hasProcessed = useRef(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const hash = window.location.hash;
    const sid = new URLSearchParams(hash.replace("#", "")).get("session_id");
    const role = localStorage.getItem("hsj_role") || "user";

    if (!sid) {
      navigate("/");
      return;
    }

    (async () => {
      try {
        const res = await api.post("/auth/session", { session_id: sid, role });
        setUser(res.data.user);
        window.history.replaceState(null, "", window.location.pathname);
        navigate(res.data.user.role === "dealer" ? "/dealer" : "/app", {
          state: { user: res.data.user },
        });
      } catch (e) {
        setError("Authentication failed. Please try again.");
        setTimeout(() => navigate("/"), 2200);
      }
    })();
  }, [navigate, setUser]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background hsj-grid-bg">
      <div className="relative w-16 h-16 mb-6">
        <div className="absolute inset-0 rounded-full border-2 border-[#e60012]/30" />
        <div className="absolute inset-0 rounded-full border-t-2 border-[#e60012] animate-spin" />
        <ShieldCheck className="absolute inset-0 m-auto text-[#e60012]" size={26} />
      </div>
      <p className="font-mono text-sm tracking-widest text-slate-400 uppercase">
        {error || "Securing your Safe Journey session…"}
      </p>
    </div>
  );
}
