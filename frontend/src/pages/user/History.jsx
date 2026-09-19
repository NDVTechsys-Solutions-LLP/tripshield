import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import {
  History as HistoryIcon, MapPin, Clock, Route as RouteIcon, ChevronDown,
  Radio, Navigation, CheckCircle2, Siren, AlertTriangle, Copy, Activity,
} from "lucide-react";

export default function History() {
  const [journeys, setJourneys] = useState([]);
  const [open, setOpen] = useState(null);

  useEffect(() => {
    api.get("/journeys").then((r) => setJourneys(r.data));
  }, []);

  const copyLink = (token) => {
    navigator.clipboard?.writeText(`${window.location.origin}/track/${token}`);
    toast.success("Tracking link copied");
  };

  const statusMeta = (s) =>
    s === "completed" ? { c: "#10b981", l: "Completed" } :
    s === "emergency" ? { c: "#ef4444", l: "Emergency" } :
    { c: "#3b82f6", l: "Active" };

  return (
    <div className="hsj-fade-up max-w-4xl">
      <p className="font-mono text-xs tracking-widest text-red-400/90 uppercase mb-2">Records</p>
      <h1 className="font-display font-extrabold text-white text-3xl sm:text-4xl uppercase tracking-tight flex items-center gap-3">
        <HistoryIcon className="text-[#e60012]" size={30} /> Journey History
      </h1>
      <p className="text-slate-400 mt-2 font-body">Review past trips, routes, simulations and events.</p>

      {journeys.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/15 bg-[#0f141f] p-12 mt-8 text-center">
          <Navigation className="text-slate-600 mx-auto" size={40} />
          <p className="text-slate-400 mt-4 font-body">No journeys yet. Start your first safe journey.</p>
        </div>
      ) : (
        <div className="space-y-3 mt-8">
          {journeys.map((j) => {
            const m = statusMeta(j.status);
            const isOpen = open === j.journey_id;
            return (
              <div key={j.journey_id} data-testid="history-row" className="rounded-xl border border-white/10 bg-[#0f141f] overflow-hidden">
                <button
                  onClick={() => setOpen(isOpen ? null : j.journey_id)}
                  className="w-full flex items-center gap-4 p-5 text-left hover:bg-white/5 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${m.c}22`, color: m.c }}>
                    {j.mode === "live" ? <Radio size={18} /> : <RouteIcon size={18} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-display font-bold text-white truncate">
                      {j.from_name?.split(",")[0]} → {j.to_name?.split(",")[0]}
                    </p>
                    <p className="font-mono text-[11px] text-slate-500">
                      {j.distance_km} km · {j.eta_min} min · {j.mode === "live" ? "Live/Sim" : "Manual"} · {new Date(j.created_at).toLocaleString()}
                    </p>
                  </div>
                  <span className="rounded-full px-2.5 py-0.5 font-mono text-[10px] uppercase shrink-0" style={{ background: `${m.c}22`, color: m.c }}>
                    {m.l}
                  </span>
                  <ChevronDown size={18} className={`text-slate-500 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>

                {isOpen && (
                  <div className="border-t border-white/10 p-5 space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <Mini icon={RouteIcon} label="Distance" value={`${j.distance_km} km`} />
                      <Mini icon={Clock} label="ETA" value={`${j.eta_min} min`} />
                      <Mini icon={MapPin} label="From" value={j.from_name?.split(",")[0]} />
                      <Mini icon={MapPin} label="To" value={j.to_name?.split(",")[0]} />
                    </div>

                    {j.share_token && (
                      <button
                        data-testid="history-copy-link"
                        onClick={() => copyLink(j.share_token)}
                        className="inline-flex items-center gap-2 rounded-lg border border-white/10 hover:border-[#e60012]/50 px-4 py-2 text-sm text-slate-300"
                      >
                        <Copy size={14} /> Copy tracking link
                      </button>
                    )}

                    <div>
                      <p className="font-mono text-[10px] tracking-widest text-slate-500 uppercase mb-2 flex items-center gap-2">
                        <Activity size={12} /> Event Log
                      </p>
                      <div className="space-y-1.5 max-h-52 overflow-y-auto">
                        {(j.events || []).map((e) => (
                          <div key={e.event_id} className="flex items-center gap-2 text-sm">
                            {e.severity === "danger" ? <Siren size={13} className="text-[#ef4444]" /> :
                             e.severity === "warning" ? <AlertTriangle size={13} className="text-[#f59e0b]" /> :
                             e.severity === "success" ? <CheckCircle2 size={13} className="text-emerald-400" /> :
                             <span className="w-1.5 h-1.5 rounded-full bg-slate-600 ml-1 mr-0.5" />}
                            <span className="text-slate-400">{e.message}</span>
                            <span className="font-mono text-[10px] text-slate-600 ml-auto">{new Date(e.at).toLocaleTimeString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Mini({ icon: Icon, label, value }) {
  return (
    <div className="rounded-lg bg-[#0b0f17] border border-white/10 p-3">
      <Icon className="text-slate-500" size={14} />
      <p className="font-mono text-sm text-white mt-1 truncate">{value}</p>
      <p className="font-mono text-[9px] text-slate-600 uppercase tracking-wide">{label}</p>
    </div>
  );
}
