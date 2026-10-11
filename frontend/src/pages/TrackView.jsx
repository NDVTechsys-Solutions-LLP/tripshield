import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import api, { API } from "@/lib/api";
import LeafletMap from "@/components/LeafletMap";
import { TripShieldMark } from "@/components/BrandMark";
import {
  ShieldCheck, MapPin, Navigation, Clock, Route as RouteIcon, Activity,
  AlertTriangle, CheckCircle2, Siren, Loader2, WifiOff, AudioLines, PhoneCall,
} from "lucide-react";

export default function TrackView() {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);
  const timer = useRef(null);

  const poll = async () => {
    try {
      const r = await api.get(`/track/${token}`);
      setData(r.data);
      setError(false);
    } catch {
      setError(true);
    }
  };

  const callErss = async () => {
    try { await api.post(`/track/${token}/erss-call`); } catch { /* still allow dialing */ }
    const num = data?.erss?.phone || "9620910910";
    window.location.href = `tel:${num}`;
  };

  useEffect(() => {
    poll();
    timer.current = setInterval(poll, 4000);
    return () => clearInterval(timer.current);
    // eslint-disable-next-line
  }, [token]);

  if (error && !data) {
    return (
      <div className="min-h-screen bg-[#07090e] hsj-grid-bg flex flex-col items-center justify-center text-center px-6">
        <WifiOff className="text-slate-600" size={48} />
        <h1 className="font-display font-extrabold text-white text-2xl uppercase mt-4">Link Unavailable</h1>
        <p className="text-slate-400 mt-2 font-body text-sm">This tracking link is invalid or the journey has ended.</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#07090e] flex items-center justify-center">
        <Loader2 className="text-[#e60012] animate-spin" size={40} />
      </div>
    );
  }

  const emergency = data.status === "emergency";
  const done = data.status === "completed";
  const pct = Math.round((data.progress || 0) * 100);

  return (
    <div className="min-h-screen bg-[#07090e] text-white hsj-grid-bg pb-16">
      {/* Floating Curved Top Bar (Matching Landing & Dealer style) */}
      <header className="sticky top-0 z-30 pt-4 px-4 sm:px-6 pointer-events-none">
        <div className="max-w-5xl mx-auto pointer-events-auto rounded-full bg-[#0a0f1b]/90 backdrop-blur-xl border border-white/10 px-5 sm:px-7 py-3 shadow-2xl flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <TripShieldMark size={28} glow />
            <span className="font-brand font-black text-[#e60012] text-sm tracking-wider">
              TRIPSHIELD
            </span>
            <span className="text-slate-400 font-display font-semibold text-xs ml-1.5">· LIVE</span>
          </div>
          <span className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold uppercase tracking-wider ${
            emergency
              ? "bg-red-500/15 border border-red-500/30 text-red-300"
              : done
              ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-300"
              : "bg-emerald-500/15 border border-emerald-500/30 text-emerald-300"
          }`}>
            <span className={`w-2 h-2 rounded-full ${emergency ? "bg-red-400 animate-pulse" : "bg-emerald-400"}`} />
            <span>{emergency ? "Emergency" : done ? "Safely Arrived" : "Tracking Active"}</span>
          </span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 space-y-6">
        <div>
          <p className="text-xs font-bold tracking-wider text-[#e60012] uppercase mb-2">
            Shared Telematics Link
          </p>
          <h1 className="font-display font-extrabold text-white text-3xl sm:text-4xl uppercase tracking-tight">
            {data.user_name || "Rider"} is on the move
          </h1>
          <p className="text-slate-400 mt-2 font-body text-sm sm:text-base">
            {data.from_name?.split(",")[0]} → {data.to_name?.split(",")[0]} · {data.vehicle_label}
          </p>
        </div>

        {emergency && (
          <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-5 flex items-center gap-3.5 shadow-xl">
            <Siren className="text-[#ef4444] shrink-0" size={24} />
            <p className="text-sm text-red-200 font-body">
              An emergency has been reported on this journey. Authorities and family have been alerted.
            </p>
          </div>
        )}

        {/* Family → 112 / ERSS one-tap call */}
        <div
          data-testid="track-erss-card"
          className="rounded-2xl border border-red-500/30 bg-[#0c111d] p-6 flex flex-col sm:flex-row sm:items-center gap-4 justify-between shadow-xl"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-[#ef4444] shrink-0">
              <PhoneCall size={20} />
            </div>
            <div>
              <p className="text-sm text-white font-body font-semibold">Emergency? Call 112 / ERSS now</p>
              <p className="text-xs text-slate-400 font-body mt-0.5">
                {data.erss?.notified
                  ? "TripShield emergency dispatch has already auto-reported this incident to 112 / ERSS."
                  : "Connects you directly to the national emergency response line."}
              </p>
            </div>
          </div>
          <button
            data-testid="track-call-erss-button"
            onClick={callErss}
            className="shrink-0 px-6 py-3 rounded-xl bg-[#e60012] hover:bg-[#ff1a2e] text-white font-display font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(230,0,18,0.35)] cursor-pointer"
          >
            <PhoneCall size={15} /> Call {data.erss?.phone || "112"}
          </button>
        </div>

        {/* Telemetry Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Stat icon={RouteIcon} label="Total Distance" value={`${data.distance_km} km`} />
          <Stat icon={Clock} label="Estimated Time" value={`${data.eta_min} min`} />
          <Stat icon={Navigation} label="Journey Progress" value={`${pct}%`} />
        </div>

        {/* Map Container */}
        <div className="rounded-2xl border border-white/10 bg-[#0c111d] overflow-hidden h-[460px] shadow-2xl">
          <LeafletMap
            className="w-full h-full"
            route={data.route || []}
            position={data.current_position}
            from={data.from_coords}
            to={data.to_coords}
            incident={emergency ? data.current_position : null}
          />
        </div>

        {/* Audio Recordings */}
        {(data.sos_audio || []).length > 0 && (
          <div data-testid="track-sos-audio" className="rounded-2xl border border-red-500/30 bg-[#0c111d] p-6 shadow-xl">
            <p className="text-xs text-red-300 uppercase mb-4 flex items-center gap-2 font-bold tracking-wider">
              <AudioLines size={15} /> Emergency Audio Captured From Scene
            </p>
            <div className="space-y-3">
              {[...data.sos_audio].reverse().map((a) => (
                <div key={a.audio_id} className="rounded-xl bg-[#090d16] border border-white/10 p-4">
                  <p className="text-xs text-slate-400 mb-2.5 font-medium">
                    Captured {a.created_at ? new Date(a.created_at).toLocaleTimeString() : ""}
                  </p>
                  <audio
                    data-testid="track-audio-player"
                    controls
                    preload="none"
                    className="w-full"
                    src={`${API}/track/${token}/audio/${a.audio_id}`}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Journey Events */}
        <div className="rounded-2xl border border-white/10 bg-[#0c111d] p-6 shadow-xl">
          <p className="text-xs text-slate-300 uppercase mb-4 flex items-center gap-2 font-bold tracking-wider">
            <Activity size={14} className="text-[#e60012]" /> Journey Event Log
          </p>
          {(!data.events || data.events.length === 0) ? (
            <p className="text-xs text-slate-400 py-2">All parameters nominal — no safety alerts.</p>
          ) : (
            <div className="space-y-2.5">
              {[...data.events].reverse().map((e, i) => (
                <div key={i} className="flex items-center gap-2.5 text-xs">
                  {e.severity === "danger" ? <Siren size={15} className="text-[#ef4444] shrink-0" /> :
                   e.severity === "warning" ? <AlertTriangle size={15} className="text-[#f59e0b] shrink-0" /> :
                   <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />}
                  <span className="text-slate-200 font-body">{e.message}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <p className="flex items-center justify-center gap-2 text-xs text-slate-400 pt-4 font-medium">
          <ShieldCheck size={14} className="text-emerald-400" /> Secured by TripShield · Real-time telemetry auto-refreshed
        </p>
        <p data-testid="track-demo-disclaimer" className="text-center text-xs text-slate-500">
          Demo &amp; simulation only — not affiliated with any real brand or emergency service. Location and events shown are simulated.
        </p>
      </main>
    </div>
  );
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0c111d] p-5 shadow-xl">
      <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[#e60012]">
        <Icon size={16} />
      </div>
      <p className="font-display font-bold text-xl text-white mt-3 tracking-tight">{value}</p>
      <p className="text-xs text-slate-400 uppercase tracking-wide mt-0.5 font-semibold">{label}</p>
    </div>
  );
}
