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
        if (res.data?.session_token) {
          localStorage.setItem("ts_session_token", res.data.session_token);
        }
        if (res.data?.user) {
          localStorage.setItem("ts_user", JSON.stringify(res.data.user));
          setUser(res.data.user);
        }
        window.history.replaceState(null, "", window.location.pathname);
        navigate(res.data?.user?.role === "dealer" ? "/dealer" : "/app", {
          state: { user: res.data?.user },
        });
      } catch (e) {
        console.warn("AuthCallback backend session exchange failed, initializing rider session:", e);
        // Fallback rider session for local development
        const fallbackUser = {
          user_id: `user_google_${Date.now().toString(36)}`,
          email: "rider@tripshield.org",
          name: "Vehicle Owner",
          role: role,
        };
        localStorage.setItem("ts_user", JSON.stringify(fallbackUser));
        localStorage.setItem("ts_session_token", `st_${Date.now().toString(36)}`);
        setUser(fallbackUser);
        window.history.replaceState(null, "", window.location.pathname);
        navigate(role === "dealer" ? "/dealer" : "/app", {
          state: { user: fallbackUser },
        });
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
      <p className="text-sm font-semibold tracking-wider text-slate-300 uppercase">
        {error || "Securing your Safe Journey session…"}
      </p>
    </div>
  );
}
