import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { TripShieldMark } from "@/components/BrandMark";
import {
  ShieldCheck,
  Bike,
  Building2,
  Lock,
  Radio,
  Siren,
  MapPin,
  ArrowRight,
} from "lucide-react";

const HERO =
  "https://images.unsplash.com/photo-1741243632891-de9e443f004e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMzl8MHwxfHNlYXJjaHwyfHxob25kYSUyMG1vdG9yY3ljbGUlMjBzY29vdGVyJTIwZWxlY3RyaWMlMjB2ZWhpY2xlJTIwZGFyayUyMGJhY2tncm91bmR8ZW58MHx8fHwxNzg5NDk3MzI2fDA&ixlib=rb-4.1.0&q=85";

// REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
function startLogin(role) {
  localStorage.setItem("hsj_role", role);
  const redirectUrl = window.location.origin + "/app";
  window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(
    redirectUrl
  )}`;
}

export default function Landing() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) navigate(user.role === "dealer" ? "/dealer" : "/app");
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen bg-background hsj-grid-bg">
      {/* Nav */}
      <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3 text-[#e60012]">
          <TripShieldMark size={40} />
          <div>
            <p className="font-display font-extrabold text-white text-lg leading-none tracking-tight">
              SAFE JOURNEY
            </p>
            <p className="font-mono text-[10px] tracking-widest text-slate-500 mt-1">
              CONNECTED MOBILITY · INDIA
            </p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 font-mono text-xs text-emerald-400">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
          </span>
          SAFETY NETWORK ONLINE
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center pt-6 lg:pt-16 pb-20">
        {/* Left */}
        <div className="hsj-fade-up">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#e60012]/40 bg-[#e60012]/10 px-4 py-1.5 mb-6">
            <span className="font-mono text-xs tracking-widest text-red-400 uppercase">
              Prepare · Protect · Recover
            </span>
          </div>
          <h1 className="font-display font-extrabold text-white text-4xl sm:text-5xl lg:text-6xl uppercase tracking-tight leading-[0.95]">
            Every ride,
            <br />
            <span className="text-[#e60012]">fully guarded.</span>
          </h1>
          <p className="font-body text-slate-400 text-base sm:text-lg mt-6 max-w-lg leading-relaxed">
            Real-time telemetry, encrypted document vault, automatic accident
            detection, one-tap SOS to 112 ERSS &amp; family, and instant
            insurance claims — for every two &amp; four-wheeler.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 max-w-lg">
            {[
              { icon: Lock, label: "Encrypted Vault" },
              { icon: Radio, label: "Live Telemetry" },
              { icon: Siren, label: "112 VSSR SOS" },
              { icon: MapPin, label: "Route Intel" },
            ].map((f) => (
              <div
                key={f.label}
                className="rounded-xl border border-white/10 bg-[#0f141f] p-3 flex flex-col items-center gap-2 text-center"
              >
                <f.icon className="text-[#e60012]" size={20} />
                <span className="font-mono text-[10px] text-slate-400 tracking-wide">
                  {f.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: login cards */}
        <div className="hsj-fade-up" style={{ animationDelay: "0.15s" }}>
          <div className="relative rounded-2xl overflow-hidden border border-white/10 mb-6 h-40 sm:h-52">
            <img src={HERO} alt="TripShield" className="w-full h-full object-cover opacity-70" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#07090e] via-transparent" />
          </div>

          <h2 className="font-display font-bold text-white text-xl uppercase tracking-wide mb-4">
            Choose your portal
          </h2>

          <button
            data-testid="login-google-user-button"
            onClick={() => startLogin("user")}
            className="group w-full text-left rounded-xl border border-white/10 bg-[#0f141f] hover:border-[#e60012]/60 hover:bg-[#161d2c] transition-all p-5 flex items-center gap-4 mb-4"
          >
            <div className="w-12 h-12 rounded-xl bg-[#e60012]/15 flex items-center justify-center text-[#e60012] shrink-0">
              <Bike size={24} />
            </div>
            <div className="flex-1">
              <p className="font-display font-bold text-white text-lg">Vehicle Owner / Rider</p>
              <p className="text-sm text-slate-400">Set up your vehicle &amp; travel safe</p>
            </div>
            <GoogleGlyph />
            <ArrowRight className="text-slate-500 group-hover:text-[#e60012] transition-colors" size={20} />
          </button>

          <button
            data-testid="login-dealer-portal-button"
            onClick={() => startLogin("dealer")}
            className="group w-full text-left rounded-xl border border-white/10 bg-[#0f141f] hover:border-[#3b82f6]/60 hover:bg-[#161d2c] transition-all p-5 flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-[#3b82f6]/15 flex items-center justify-center text-[#3b82f6] shrink-0">
              <Building2 size={24} />
            </div>
            <div className="flex-1">
              <p className="font-display font-bold text-white text-lg">TripShield Service Center</p>
              <p className="text-sm text-slate-400">Dealer command &amp; incident center</p>
            </div>
            <GoogleGlyph />
            <ArrowRight className="text-slate-500 group-hover:text-[#3b82f6] transition-colors" size={20} />
          </button>

          <p className="flex items-center gap-2 text-xs text-slate-500 mt-5 font-mono">
            <ShieldCheck size={14} className="text-emerald-400" />
            Secured with Google · Data shared only on your consent
          </p>
        </div>
      </main>
    </div>
  );
}

function GoogleGlyph() {
  return (
    <span className="hidden sm:flex items-center gap-1.5 rounded-md bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-800">
      <svg width="14" height="14" viewBox="0 0 48 48">
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
      </svg>
      Google
    </span>
  );
}
