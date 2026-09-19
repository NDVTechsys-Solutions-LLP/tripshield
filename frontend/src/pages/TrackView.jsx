import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import api from "@/lib/api";
import LeafletMap from "@/components/LeafletMap";
import { HondaMark } from "@/components/HondaMark";
import {
  ShieldCheck, MapPin, Navigation, Clock, Route as RouteIcon, Activity,
  AlertTriangle, CheckCircle2, Siren, Loader2, WifiOff,
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
            <HondaMark size={26} />
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
          <ShieldCheck size={13} className="text-emerald-400" /> Secured by Honda Safe Journey · Auto-refreshes every few seconds
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
