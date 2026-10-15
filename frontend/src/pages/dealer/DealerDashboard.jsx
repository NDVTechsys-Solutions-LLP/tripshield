import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { TripShieldMark } from "@/components/BrandMark";
import LeafletMap from "@/components/LeafletMap";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  ShieldAlert, Siren, Car, Activity, Users, LogOut, MapPin, Phone, FileText,
  CheckCircle2, Clock, GitBranch, TrafficCone, ShieldCheck, Radio, Eye, Building2,
  Heart, ShieldPlus, Navigation, Bot, PhoneCall, Mail, AudioLines,
} from "lucide-react";

const TYPE_META = {
  sos: { icon: Siren, color: "#ef4444", label: "SOS" },
  accident: { icon: Car, color: "#ef4444", label: "Accident" },
  deviation: { icon: GitBranch, color: "#f59e0b", label: "Deviation" },
  delay: { icon: TrafficCone, color: "#f59e0b", label: "ETA Delay" },
};

export default function DealerDashboard() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [activeMap, setActiveMap] = useState([]);
  const [filter, setFilter] = useState("all");
  const [detail, setDetail] = useState(null);

  const load = () => {
    api.get("/dealer/stats").then((r) => setStats(r.data));
    api.get("/dealer/incidents").then((r) => setIncidents(r.data));
    api.get("/dealer/active-map").then((r) => setActiveMap(r.data));
  };
  useEffect(() => {
    load();
    const iv = setInterval(load, 8000);
    return () => clearInterval(iv);
  }, []);

  const openDetail = async (id) => {
    const r = await api.get(`/dealer/incidents/${id}`);
    setDetail(r.data);
  };

  const updateStatus = async (id, status) => {
    await api.patch(`/dealer/incidents/${id}`, { status });
    toast.success(`Incident ${status}`);
    load();
    if (detail?.incident_id === id) setDetail({ ...detail, status });
  };

  const filtered = incidents.filter((i) =>
    filter === "all" ? true : filter === "open" ? i.status === "open" : i.type === filter
  );
  const openCount = incidents.filter((i) => i.status === "open").length;

  return (
    <div className="min-h-screen bg-[#07090e] text-white hsj-grid-bg selection:bg-[#3b82f6]/30 pb-16">
      {/* ======================================================== */}
      {/* Floating Top Bar (Matching Landing Page Style)           */}
      {/* ======================================================== */}
      <header className="sticky top-0 z-30 pt-4 px-4 sm:px-6 pointer-events-none">
        <div className="max-w-7xl mx-auto pointer-events-auto rounded-full bg-[#0a0f1b]/90 backdrop-blur-xl border border-white/10 px-5 sm:px-7 py-3 shadow-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TripShieldMark size={32} variant="dealer" glow />
            <div>
              <p className="font-display font-extrabold text-white text-base leading-none tracking-tight">
                SERVICE CENTER <span className="text-[#3b82f6]">COMMAND</span>
              </p>
              <p className="text-xs text-slate-400 font-medium mt-1 flex items-center gap-1.5">
                <Building2 size={12} className="text-slate-400" /> Cyber City, Gurugram · Operations Command
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            {openCount > 0 ? (
              <span className="text-xs font-semibold text-red-400">
                {openCount} Open {openCount === 1 ? "Incident" : "Incidents"}
              </span>
            ) : (
              <span className="hidden sm:inline text-xs text-slate-400 font-medium">
                All Routes Normal
              </span>
            )}

            <div className="hidden md:flex items-center gap-2 pl-2 border-l border-white/10">
              {user?.picture && <img src={user.picture} alt="" className="w-7 h-7 rounded-full border border-white/20" />}
              <span className="text-xs text-slate-300 font-medium">{user?.name}</span>
            </div>

            <button
              data-testid="dealer-logout-button"
              onClick={logout}
              className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div>
          <p className="text-xs font-bold tracking-wider text-[#3b82f6] uppercase mb-2">
            Regional Telematics Hub
          </p>
          <h1 className="font-display font-extrabold text-white text-3xl sm:text-4xl uppercase tracking-tight">
            Incident Command Center
          </h1>
          <p className="text-slate-400 mt-2 font-body text-sm sm:text-base">
            Live operations feed of connected vehicle safety events and roadside assistance coordination.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mt-8">
          <DStat icon={Car} label="Fleet Vehicles" value={stats?.vehicles ?? "—"} testid="dealer-stat-vehicles" />
          <DStat icon={Activity} label="Total Trips" value={stats?.total_journeys ?? "—"} testid="dealer-stat-journeys" />
          <DStat icon={Radio} label="Active Live" value={stats?.active_journeys ?? "—"} testid="dealer-stat-active" />
          <DStat icon={ShieldAlert} label="Open Incidents" value={stats?.open_incidents ?? "—"} testid="dealer-stat-open" highlight={stats?.open_incidents > 0} />
          <DStat icon={Clock} label="Historical" value={stats?.total_incidents ?? "—"} testid="dealer-stat-total" />
        </div>

        {/* Live fleet map */}
        <div className="rounded-2xl border border-white/10 bg-[#0c111d] mt-8 overflow-hidden shadow-2xl">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/20">
            <div className="flex items-center gap-2">
              <Navigation size={18} className="text-[#3b82f6]" />
              <h2 className="font-display font-bold text-white uppercase tracking-wide text-sm">
                Regional Fleet Map
              </h2>
            </div>
            <span data-testid="dealer-active-count" className="text-xs font-semibold text-slate-300 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
              {activeMap.length} active {activeMap.length === 1 ? "journey" : "journeys"}
            </span>
          </div>

          {activeMap.length === 0 ? (
            <div className="p-16 text-center">
              <MapPin className="text-slate-600 mx-auto" size={36} />
              <p className="text-slate-400 mt-3 font-body text-sm">No active journeys on the network right now.</p>
            </div>
          ) : (
            <div className="h-[420px]" data-testid="dealer-live-map">
              <LeafletMap
                className="w-full h-full"
                markers={activeMap.map((j) => ({
                  position: j.position,
                  type: j.vehicle_type,
                  status: j.status,
                  color: j.status === "emergency" ? "#ef4444" : "#3b82f6",
                  popup: `<b>${j.user_name || "Rider"}</b><br/>${j.vehicle_label || ""}<br/><span style="color:${j.status === "emergency" ? "#ef4444" : "#3b82f6"}">${j.status.toUpperCase()}</span> · ${j.route_name || ""}`,
                }))}
              />
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 mt-8">
          {["all", "open", "sos", "accident", "deviation", "delay"].map((f) => (
            <button
              key={f}
              data-testid={`dealer-filter-${f}`}
              onClick={() => setFilter(f)}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                filter === f
                  ? "bg-[#3b82f6] text-white shadow-[0_0_15px_rgba(59,130,246,0.35)]"
                  : "bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Incident table */}
        <div className="rounded-2xl border border-white/10 bg-[#0c111d] mt-5 overflow-hidden shadow-2xl">
          {filtered.length === 0 ? (
            <div className="p-14 text-center">
              <ShieldCheck className="text-emerald-400/70 mx-auto" size={40} />
              <p className="text-slate-300 mt-4 font-body font-medium">No active incidents in this category.</p>
              <p className="text-xs text-slate-500 font-body mt-1">Network traffic and journey conditions normal.</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {filtered.map((i) => {
                const m = TYPE_META[i.type] || TYPE_META.deviation;
                return (
                  <div key={i.incident_id} data-testid="dealer-incident-row" className="flex items-center gap-4 p-5 hover:bg-white/[0.02] transition-colors">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-white/10" style={{ background: `${m.color}18`, color: m.color }}>
                      <m.icon size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-display font-bold text-white text-base">{m.label}</span>
                        <span className="text-[11px] font-semibold rounded-md px-2 py-0.5 uppercase tracking-wide border border-white/10" style={{ background: `${m.color}15`, color: m.color }}>
                          {i.severity}
                        </span>
                      </div>
                      <p className="text-sm text-slate-300 truncate mt-0.5">{i.message}</p>
                      <p className="text-xs text-slate-400 mt-1 font-medium">
                        {i.user_name} · {i.vehicle_label} · {new Date(i.created_at).toLocaleString()}
                      </p>
                    </div>
                    <span className={`hidden sm:inline rounded-lg px-2.5 py-1 text-xs font-semibold uppercase tracking-wide border ${
                      i.status === "open" ? "bg-red-500/10 border-red-500/30 text-red-400" :
                      i.status === "acknowledged" ? "bg-amber-500/10 border-amber-500/30 text-amber-300" : "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                    }`}>
                      {i.status}
                    </span>
                    <button
                      data-testid="dealer-incident-view-button"
                      onClick={() => openDetail(i.incident_id)}
                      className="px-3.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 hover:text-white flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider shrink-0 transition-all cursor-pointer"
                    >
                      <Eye size={14} /> <span>Inspect</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Detail modal */}
      <Dialog open={!!detail} onOpenChange={() => setDetail(null)}>
        <DialogContent className="bg-[#0c111d] border-white/10 text-white backdrop-blur-xl max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl">
          {detail && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display uppercase tracking-wide flex items-center gap-2 text-xl">
                  {(() => { const m = TYPE_META[detail.type] || TYPE_META.deviation; const I = m.icon; return <I style={{ color: m.color }} size={20} />; })()}
                  {(TYPE_META[detail.type] || {}).label} · {detail.user_name}
                </DialogTitle>
              </DialogHeader>

              {detail.location && (
                <div className="rounded-xl overflow-hidden border border-white/10 h-48 mt-2">
                  <LeafletMap className="w-full h-full" incident={detail.location} position={detail.location} />
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-3 mt-3">
                <Info label="Vehicle" value={detail.vehicle_label} />
                <Info label="Route" value={detail.route_name} />
                <Info label="Rider" value={detail.user_name} />
                <Info label="Contact Email" value={detail.user_email} />
              </div>

              <div className="rounded-xl bg-[#090d16] border border-white/10 p-4 mt-3">
                <p className="text-xs tracking-wider text-slate-400 uppercase mb-2.5 font-bold">Shared Emergency Data</p>
                <Info label="Rider Phone" value={detail.shared_data?.phone || "Not shared"} icon={Phone} />
                <Info label="Blood Group" value={detail.shared_data?.blood_group || "Not set"} icon={Heart} />
                <Info label="Allergies" value={detail.shared_data?.allergies || "None noted"} icon={ShieldPlus} />
                <Info label="Location" value={detail.location ? `${detail.location[0].toFixed(4)}, ${detail.location[1].toFixed(4)}` : "—"} icon={MapPin} />
                <div className="mt-2.5 pt-2.5 border-t border-white/5">
                  <p className="text-slate-400 text-xs flex items-center gap-1.5 mb-2 font-semibold"><Users size={12} /> Family Contacts</p>
                  {(detail.shared_data?.contacts || []).length === 0 && <p className="text-xs text-slate-500">None registered</p>}
                  {(detail.shared_data?.contacts || []).map((c, ci) => (
                    <p key={`${c.phone}-${ci}`} className="text-xs text-white flex items-center gap-2 py-0.5 font-medium"><Phone size={12} className="text-slate-400" /> {c.name} · {c.phone}</p>
                  ))}
                </div>
              </div>

              <div className="rounded-xl bg-[#090d16] border border-white/10 p-4 mt-3">
                <p className="text-xs tracking-wider text-slate-400 uppercase mb-2.5 font-bold">Notified Channels</p>
                <div className="flex flex-wrap gap-2">
                  {(detail.shared_with || []).map((s) => (
                    <div key={s} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-xs text-emerald-300 font-medium"><CheckCircle2 size={13} /> {s}</div>
                  ))}
                </div>
              </div>

              {detail.erss_report && (
                <div data-testid="dealer-erss-report" className="rounded-xl bg-[#090d16] border border-[#3b82f6]/30 p-4 mt-3">
                  <p className="text-xs tracking-wider text-blue-400 uppercase mb-2 flex items-center gap-2 font-bold">
                    <Bot size={13} /> ERSS 112 Dispatch Report
                  </p>
                  <Info label="Call" value={detail.erss_report.call_status} icon={PhoneCall} />
                  <Info label="Email" value={detail.erss_report.email_status} icon={Mail} />
                  <Info label="Sent to" value={detail.erss_report.email} icon={Mail} />
                  <Info label="Audio" value={detail.erss_report.audio_attached ? "Clip attached to report" : "Pending / not captured"} icon={AudioLines} />
                  {detail.erss_report.ai_narrative && (
                    <p className="text-xs text-slate-300 italic leading-relaxed border-l-2 border-blue-500/60 pl-2.5 mt-2 font-body">
                      "{detail.erss_report.ai_narrative}"
                    </p>
                  )}
                </div>
              )}

              {/* Journey activity timeline */}
              {detail.journey?.events?.length > 0 && (
                <div className="rounded-xl bg-[#090d16] border border-white/10 p-4 mt-3">
                  <p className="text-xs tracking-wider text-slate-400 uppercase mb-2 flex items-center gap-2 font-bold"><Activity size={12} /> Journey Activity</p>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto hsj-scroll">
                    {[...detail.journey.events].reverse().map((e) => (
                      <div key={e.event_id} className="flex items-start gap-2 text-xs">
                        <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: sev(e.severity) }} />
                        <span className="text-slate-300 font-body">{e.message}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 mt-5">
                <button
                  data-testid="dealer-acknowledge-button"
                  onClick={() => updateStatus(detail.incident_id, "acknowledged")}
                  className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-display font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg"
                >
                  <Radio size={15} /> Acknowledge &amp; Dispatch
                </button>
                <button
                  data-testid="dealer-resolve-button"
                  onClick={() => updateStatus(detail.incident_id, "resolved")}
                  className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-display font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg"
                >
                  <CheckCircle2 size={15} /> Mark Resolved
                </button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function sev(s) {
  return { danger: "#ef4444", warning: "#f59e0b", success: "#10b981", info: "#3b82f6" }[s] || "#64748b";
}

function DStat({ icon: Icon, label, value, testid, highlight }) {
  return (
    <div data-testid={testid} className={`rounded-2xl border p-5 shadow-xl transition-all ${
      highlight ? "border-red-500/30 bg-red-500/5" : "border-white/10 bg-[#0c111d] hover:border-white/20"
    }`}>
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-400 uppercase tracking-wide font-semibold">{label}</span>
        <Icon size={16} className={highlight ? "text-red-400" : "text-slate-400"} />
      </div>
      <p className="font-display font-bold text-3xl text-white mt-2 tracking-tight">{value}</p>
    </div>
  );
}

function Info({ label, value, icon: Icon }) {
  return (
    <div className="flex items-center gap-2 py-1">
      {Icon && <Icon size={13} className="text-slate-400" />}
      <span className="text-xs text-slate-400 uppercase tracking-wide w-28 shrink-0 font-medium">{label}</span>
      <span className="text-xs text-slate-200 truncate font-semibold">{value}</span>
    </div>
  );
}
