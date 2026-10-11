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
    toast.success("Tracking link copied to clipboard");
  };

  const statusMeta = (s) =>
    s === "completed" ? { c: "emerald", l: "Completed" } :
    s === "emergency" ? { c: "red", l: "Emergency" } :
    { c: "blue", l: "In Progress" };

  return (
    <div className="hsj-fade-up max-w-5xl space-y-8">
      {/* Header */}
      <div>
        <p className="text-xs font-bold tracking-wider text-[#e60012] uppercase mb-2">
          Journey Records &amp; Archives
        </p>
        <h1 className="font-display font-extrabold text-white text-3xl sm:text-4xl uppercase tracking-tight flex items-center gap-3">
          Journey History
        </h1>
        <p className="text-slate-400 mt-2 font-body text-sm sm:text-base">
          Review past safe routes, telematics records, and emergency events across your rides.
        </p>
      </div>

      {journeys.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 bg-[#0c111d] p-16 text-center shadow-xl">
          <Navigation className="text-slate-600 mx-auto" size={40} />
          <p className="text-slate-300 mt-4 font-body font-medium">No recorded journeys yet.</p>
          <p className="text-xs text-slate-500 font-body mt-1">
            Start your first safe journey from the Command Hub to build your safety log.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {journeys.map((j) => {
            const m = statusMeta(j.status);
            const isOpen = open === j.journey_id;
            return (
              <div
                key={j.journey_id}
                data-testid="history-row"
                className="rounded-2xl border border-white/10 bg-[#0c111d] overflow-hidden shadow-xl transition-all"
              >
                <button
                  onClick={() => setOpen(isOpen ? null : j.journey_id)}
                  className="w-full flex items-center gap-4 p-5 sm:p-6 text-left hover:bg-white/[0.02] transition-colors cursor-pointer"
                >
                  <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#e60012] shrink-0">
                    {j.mode === "live" ? <Radio size={18} /> : <RouteIcon size={18} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-display font-bold text-white text-base truncate">
                      {j.from_name?.split(",")[0]} → {j.to_name?.split(",")[0]}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5 font-medium">
                      {j.distance_km} km · {j.eta_min} min · {new Date(j.created_at).toLocaleString()}
                    </p>
                  </div>
                  <span className={`rounded-lg px-2.5 py-1 text-xs font-semibold uppercase tracking-wider shrink-0 border ${
                    m.c === "emerald" ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" :
                    m.c === "red" ? "border-red-500/30 bg-red-500/10 text-red-300" :
                    "border-blue-500/30 bg-blue-500/10 text-blue-300"
                  }`}>
                    {m.l}
                  </span>
                  <ChevronDown size={18} className={`text-slate-400 transition-transform ${isOpen ? "rotate-180 text-white" : ""}`} />
                </button>

                {isOpen && (
                  <div className="border-t border-white/10 p-6 bg-black/20 space-y-5">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <Mini icon={RouteIcon} label="Total Distance" value={`${j.distance_km} km`} />
                      <Mini icon={Clock} label="Estimated Time" value={`${j.eta_min} min`} />
                      <Mini icon={MapPin} label="Origin" value={j.from_name?.split(",")[0]} />
                      <Mini icon={MapPin} label="Destination" value={j.to_name?.split(",")[0]} />
                    </div>

                    {j.share_token && (
                      <button
                        data-testid="history-copy-link"
                        onClick={() => copyLink(j.share_token)}
                        className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-white transition-all cursor-pointer"
                      >
                        <Copy size={13} /> Copy Shared Tracking Link
                      </button>
                    )}

                    <div>
                      <p className="text-xs tracking-wider text-slate-400 uppercase mb-3 flex items-center gap-2 font-bold">
                        <Activity size={14} /> Telematics Event Timeline
                      </p>
                      <div className="space-y-2 max-h-52 overflow-y-auto hsj-scroll">
                        {(j.events || []).length === 0 ? (
                          <p className="text-xs text-slate-400">No incident alerts fired on this journey.</p>
                        ) : (
                          (j.events || []).map((e) => (
                            <div key={e.event_id} className="flex items-center gap-2.5 text-xs py-1">
                              {e.severity === "danger" ? <Siren size={14} className="text-red-400 shrink-0" /> :
                               e.severity === "warning" ? <AlertTriangle size={14} className="text-amber-400 shrink-0" /> :
                               e.severity === "success" ? <CheckCircle2 size={14} className="text-emerald-400 shrink-0" /> :
                               <span className="w-1.5 h-1.5 rounded-full bg-slate-500 ml-1 mr-0.5 shrink-0" />}
                              <span className="text-slate-300 font-body">{e.message}</span>
                              <span className="text-[11px] text-slate-400 font-medium ml-auto shrink-0">{new Date(e.at).toLocaleTimeString()}</span>
                            </div>
                          ))
                        )}
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
    <div className="rounded-xl border border-white/5 bg-[#090d16] p-3.5">
      <div className="flex items-center gap-1.5 text-slate-400 text-xs uppercase font-medium">
        <Icon size={12} className="text-[#e60012]" /> {label}
      </div>
      <p className="font-display font-bold text-white text-base mt-1 truncate">{value || "—"}</p>
    </div>
  );
}
