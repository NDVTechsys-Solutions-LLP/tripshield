import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { TripShieldMark } from "@/components/BrandMark";
import {
  ShieldCheck,
  Bike,
  Building2,
  Navigation,
  Users,
  Radio,
  Mic,
  ArrowRight,
} from "lucide-react";

const PROTECT = [
  { icon: ShieldCheck, title: "Safe Journey", body: "Plan any route and ride inside a live safety net that watches every kilometre from start to arrival." },
  { icon: Navigation, title: "Live Tracking", body: "Your exact position updates in real time, so the right people always know where you are." },
  { icon: Users, title: "Family Sharing", body: "One tap shares a private live link — loved ones follow your trip and get notified on safe arrival." },
  { icon: Radio, title: "Auto Check-In", body: "Periodic safety check-ins confirm you're okay. No response? It auto-escalates into an alert." },
  { icon: Mic, title: "Auto Recording", body: "On an SOS, a 60-second audio clip is captured and shared with family automatically — hands-free." },
];

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
              Demo · Prepare · Protect · Recover
            </span>
          </div>
          <h1 className="font-display font-extrabold text-white text-4xl sm:text-5xl lg:text-6xl uppercase tracking-tight leading-[0.95]">
            Every ride,
            <br />
            <span className="text-[#e60012]">fully guarded.</span>
          </h1>
          <p className="font-body text-slate-400 text-base sm:text-lg mt-6 max-w-lg leading-relaxed">
            Live journey tracking, instant sharing with family, automatic safety
            check-ins, and auto-recording &amp; reporting of incidents — for every
            two &amp; four-wheeler.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-8 max-w-2xl">
            {[
              { icon: ShieldCheck, label: "Safe Journey" },
              { icon: Navigation, label: "Live Tracking" },
              { icon: Users, label: "Family Sharing" },
              { icon: Radio, label: "Auto Check-In" },
              { icon: Mic, label: "Auto Recording" },
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
          <TrackPreview />

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
          <p data-testid="demo-disclaimer" className="text-[11px] text-slate-600 mt-3 font-mono leading-relaxed">
            Demo &amp; simulation only. Not affiliated with, endorsed by, or connected to any real
            vehicle brand, insurer, or emergency service. All locations, alerts and
            notifications shown are simulated for demonstration.
          </p>
        </div>
      </main>

      {/* How it protects you */}
      <section data-testid="how-it-protects" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <p className="font-mono text-xs tracking-widest text-red-400/90 uppercase mb-2">
          How it protects you
        </p>
        <h2 className="font-display font-extrabold text-white text-2xl sm:text-3xl uppercase tracking-tight">
          Five layers of safety, one ride
        </h2>
        <p className="text-slate-400 mt-2 font-body max-w-xl">
          Swipe through everything TripShield does the moment you hit the road.
        </p>
        <div className="mt-8 flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory hsj-scroll">
          {PROTECT.map((f, i) => (
            <div
              key={f.title}
              data-testid={`protect-card-${i}`}
              className="snap-start shrink-0 w-72 rounded-2xl border border-white/10 bg-[#0f141f] p-6 hover:border-[#e60012]/50 hover:bg-[#161d2c] transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-[#e60012]/15 flex items-center justify-center text-[#e60012]">
                <f.icon size={24} />
              </div>
              <p className="font-mono text-[10px] tracking-widest text-slate-500 uppercase mt-5">
                Step {i + 1}
              </p>
              <h3 className="font-display font-bold text-white text-lg mt-1">{f.title}</h3>
              <p className="text-sm text-slate-400 mt-2 leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function TrackPreview() {
  return (
    <div data-testid="landing-track-preview" className="relative rounded-2xl overflow-hidden border border-white/10 mb-6 h-44 sm:h-56 bg-[#0b1120]">
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.06) 1px,transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 rounded-full bg-black/50 border border-white/10 px-2.5 py-1">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
        </span>
        <span className="font-mono text-[10px] tracking-widest text-red-300 uppercase">Live</span>
      </div>
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 rounded-full bg-black/50 border border-white/10 px-2.5 py-1">
        <Users size={11} className="text-emerald-400" />
        <span className="font-mono text-[10px] tracking-widest text-emerald-300 uppercase">Sharing</span>
      </div>

      <svg viewBox="0 0 400 200" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice">
        <path d="M0,150 H400 M0,70 H400 M120,0 V200 M280,0 V200" stroke="rgba(255,255,255,.05)" strokeWidth="1" />
        <path
          id="landing-route"
          d="M30,165 C90,60 170,185 240,105 S350,45 378,82"
          fill="none"
          stroke="#e60012"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="2 8"
          opacity="0.85"
        >
          <animate attributeName="stroke-dashoffset" from="0" to="-100" dur="2.5s" repeatCount="indefinite" />
        </path>
        <circle cx="30" cy="165" r="5" fill="#10b981" stroke="#0b1120" strokeWidth="2" />
        <circle cx="378" cy="82" r="5" fill="#3b82f6" stroke="#0b1120" strokeWidth="2" />
        <g>
          <circle r="10" fill="#e60012" opacity="0.3">
            <animate attributeName="r" values="6;13;6" dur="1.6s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.35;0;0.35" dur="1.6s" repeatCount="indefinite" />
            <animateMotion dur="6s" repeatCount="indefinite">
              <mpath href="#landing-route" />
            </animateMotion>
          </circle>
          <circle r="6" fill="#e60012" stroke="#fff" strokeWidth="2">
            <animateMotion dur="6s" repeatCount="indefinite">
              <mpath href="#landing-route" />
            </animateMotion>
          </circle>
        </g>
      </svg>

      <div className="absolute inset-0 bg-gradient-to-t from-[#07090e] via-transparent pointer-events-none" />
      <p className="absolute bottom-3 left-3 z-10 font-mono text-[10px] text-slate-400">
        Delhi → Jaipur · tracking live
      </p>
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
