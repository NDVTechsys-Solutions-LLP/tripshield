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
      <div className="min-h-screen bg-background hsj-grid-bg flex flex-col items-center justify-center text-center px-6">
        <WifiOff className="text-slate-600" size={48} />
        <h1 className="font-display font-bold text-white text-2xl uppercase mt-4">Link Unavailable</h1>
        <p className="text-slate-400 mt-2 font-body">This tracking link is invalid or the journey has ended.</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="text-[#e60012] animate-spin" size={40} />
      </div>
    );
  }

  const emergency = data.status === "emergency";
  const done = data.status === "completed";
  const pct = Math.round((data.progress || 0) * 100);

  return (
    <div className="min-h-screen bg-background hsj-grid-bg">
      <header className="border-b border-white/10 bg-[#0b0f17]/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#e60012]">
            <TripShieldMark size={26} />
            <span className="font-display font-extrabold text-white text-sm">SAFE JOURNEY · LIVE</span>
          </div>
          <span className={`flex items-center gap-2 rounded-full px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest ${
            emergency ? "bg-[#ef4444]/15 text-red-300" : done ? "bg-emerald-500/15 text-emerald-300" : "bg-emerald-500/15 text-emerald-300"
          }`}>
            <span className="relative flex h-2 w-2">
              {!done && <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${emergency ? "bg-red-400" : "bg-emerald-400"} opacity-75`} />}
              <span className={`relative inline-flex rounded-full h-2 w-2 ${emergency ? "bg-red-400" : "bg-emerald-400"}`} />
            </span>
            {emergency ? "Emergency" : done ? "Arrived" : "Tracking Live"}
          </span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <p className="font-mono text-xs tracking-widest text-red-400/90 uppercase mb-2">Shared Live Location</p>
        <h1 className="font-display font-extrabold text-white text-2xl sm:text-3xl uppercase tracking-tight">
          {data.user_name || "Rider"} is on the move
        </h1>
        <p className="text-slate-400 mt-2 font-body">
          {data.from_name?.split(",")[0]} → {data.to_name?.split(",")[0]} · {data.vehicle_label}
        </p>

        {emergency && (
          <div className="rounded-xl border border-[#ef4444]/50 bg-[#ef4444]/10 p-4 mt-5 flex items-center gap-3">
            <Siren className="text-[#ef4444]" size={22} />
            <p className="text-sm text-red-200 font-body">
              An emergency has been reported on this journey. Authorities and family have been alerted.
            </p>
          </div>
        )}

        {/* Family → 112 / ERSS one-tap call */}
        <div data-testid="track-erss-card" className="rounded-xl border border-[#ef4444]/40 bg-[#ef4444]/5 p-4 mt-5 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
          <div className="flex items-center gap-3">
            <PhoneCall className="text-[#ef4444] shrink-0" size={22} />
            <div>
              <p className="text-sm text-white font-body font-semibold">Emergency? Call 112 / ERSS now</p>
              <p className="text-xs text-slate-400 mt-0.5">
                {data.erss?.notified
                  ? "TripShield's AI dispatcher has already auto-reported this incident to 112 / ERSS."
                  : "Connects you directly to the emergency response line."}
              </p>
            </div>
          </div>
          <button
            data-testid="track-call-erss-button"
            onClick={callErss}
            className="shrink-0 px-5 py-2.5 rounded-lg bg-[#ef4444] hover:bg-[#dc2626] text-white font-display font-bold uppercase tracking-wide text-sm flex items-center justify-center gap-2 transition-colors"
          >
            <PhoneCall size={16} /> Call {data.erss?.phone || "112"}
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-6">
          <Stat icon={RouteIcon} label="Distance" value={`${data.distance_km} km`} />
          <Stat icon={Clock} label="ETA" value={`${data.eta_min} min`} />
          <Stat icon={Navigation} label="Progress" value={`${pct}%`} />
        </div>

        <div className="rounded-xl border border-white/10 overflow-hidden h-[420px] mt-6">
          <LeafletMap
            className="w-full h-full"
            route={data.route || []}
            position={data.current_position}
            from={data.from_coords}
            to={data.to_coords}
            incident={emergency ? data.current_position : null}
          />
        </div>

        {(data.sos_audio || []).length > 0 && (
          <div data-testid="track-sos-audio" className="rounded-xl border border-[#ef4444]/40 bg-[#ef4444]/5 p-5 mt-6">
            <p className="font-mono text-[10px] tracking-widest text-red-300 uppercase mb-3 flex items-center gap-2">
              <AudioLines size={13} /> Emergency Audio from the scene
            </p>
            <div className="space-y-3">
              {[...data.sos_audio].reverse().map((a) => (
                <div key={a.audio_id} className="rounded-lg bg-black/30 border border-white/10 p-3">
                  <p className="font-mono text-[11px] text-slate-500 mb-2">
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

        <div className="rounded-xl border border-white/10 bg-[#0f141f] p-5 mt-6">
          <p className="font-mono text-[10px] tracking-widest text-slate-500 uppercase mb-3 flex items-center gap-2">
            <Activity size={12} /> Journey Events
          </p>
          {(!data.events || data.events.length === 0) ? (
            <p className="text-xs text-slate-600 font-mono">All nominal — no alerts.</p>
          ) : (
            <div className="space-y-2">
              {[...data.events].reverse().map((e, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  {e.severity === "danger" ? <Siren size={14} className="text-[#ef4444]" /> :
                   e.severity === "warning" ? <AlertTriangle size={14} className="text-[#f59e0b]" /> :
                   <CheckCircle2 size={14} className="text-emerald-400" />}
                  <span className="text-slate-300">{e.message}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <p className="flex items-center justify-center gap-2 text-xs text-slate-600 mt-8 font-mono">
          <ShieldCheck size={13} className="text-emerald-400" /> Secured by TripShield · Auto-refreshes every few seconds
        </p>
        <p data-testid="track-demo-disclaimer" className="text-center text-[11px] text-slate-600 mt-2 font-mono">
          Demo &amp; simulation only — not affiliated with any real brand or emergency service. Location and events shown are simulated.
        </p>
      </main>
    </div>
  );
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#0f141f] p-4">
      <Icon className="text-[#e60012]" size={16} />
      <p className="font-mono font-bold text-lg sm:text-xl text-white mt-2">{value}</p>
      <p className="font-mono text-[10px] text-slate-600 uppercase tracking-wide">{label}</p>
    </div>
  );
}
