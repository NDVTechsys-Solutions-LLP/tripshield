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
  const [filter, setFilter] = useState("all");
  const [detail, setDetail] = useState(null);

  const load = () => {
    api.get("/dealer/stats").then((r) => setStats(r.data));
    api.get("/dealer/incidents").then((r) => setIncidents(r.data));
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
    <div className="min-h-screen bg-background hsj-grid-bg">
      {/* Topbar */}
      <header className="border-b border-white/10 bg-[#0b0f17]/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-[#3b82f6]"><TripShieldMark size={34} /></span>
            <div>
              <p className="font-display font-extrabold text-white leading-none tracking-tight">
                SERVICE CENTER COMMAND
              </p>
              <p className="font-mono text-[10px] tracking-widest text-slate-500 mt-1 flex items-center gap-1">
                <Building2 size={10} /> TripShield Authorized · Cyber City, Gurugram
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {openCount > 0 && (
              <span className="hidden sm:flex items-center gap-2 rounded-full bg-[#ef4444]/15 border border-[#ef4444]/40 px-4 py-1.5 font-mono text-xs text-red-300 uppercase tracking-widest">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-400" />
                </span>
                {openCount} Open
              </span>
            )}
            <div className="hidden md:flex items-center gap-2">
              {user?.picture && <img src={user.picture} alt="" className="w-8 h-8 rounded-full border border-white/20" />}
              <span className="text-sm text-slate-300">{user?.name}</span>
            </div>
            <button data-testid="dealer-logout-button" onClick={logout} className="text-slate-400 hover:text-white p-2">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="font-display font-extrabold text-white text-3xl sm:text-4xl uppercase tracking-tight">
          Incident Command Center
        </h1>
        <p className="text-slate-400 mt-2 font-body">
          Live feed of connected vehicle safety events across the network.
        </p>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mt-8">
          <DStat icon={Car} label="Vehicles" value={stats?.vehicles ?? "—"} color="#3b82f6" testid="dealer-stat-vehicles" />
          <DStat icon={Activity} label="Journeys" value={stats?.total_journeys ?? "—"} color="#10b981" testid="dealer-stat-journeys" />
          <DStat icon={Radio} label="Active" value={stats?.active_journeys ?? "—"} color="#e60012" testid="dealer-stat-active" />
          <DStat icon={ShieldAlert} label="Open" value={stats?.open_incidents ?? "—"} color="#ef4444" testid="dealer-stat-open" />
          <DStat icon={Clock} label="Total Inc." value={stats?.total_incidents ?? "—"} color="#f59e0b" testid="dealer-stat-total" />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mt-8">
          {["all", "open", "sos", "accident", "deviation", "delay"].map((f) => (
            <button
              key={f}
              data-testid={`dealer-filter-${f}`}
              onClick={() => setFilter(f)}
              className={`rounded-lg px-4 py-2 font-mono text-xs uppercase tracking-wide transition-colors ${
                filter === f ? "bg-[#e60012] text-white" : "bg-[#0f141f] border border-white/10 text-slate-400 hover:text-white"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Incident table */}
        <div className="rounded-xl border border-white/10 bg-[#0f141f] mt-5 overflow-hidden">
          {filtered.length === 0 ? (
            <div className="p-12 text-center">
              <ShieldCheck className="text-emerald-400/60 mx-auto" size={40} />
              <p className="text-slate-400 mt-4 font-body">No incidents in this view. Network is safe.</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {filtered.map((i) => {
                const m = TYPE_META[i.type] || TYPE_META.deviation;
                return (
                  <div key={i.incident_id} data-testid="dealer-incident-row" className="flex items-center gap-4 p-4 hover:bg-white/5 transition-colors">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${m.color}22`, color: m.color }}>
                      <m.icon size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-display font-bold text-white">{m.label}</span>
                        <span className="font-mono text-[10px] rounded-full px-2 py-0.5 uppercase" style={{ background: `${m.color}22`, color: m.color }}>
                          {i.severity}
                        </span>
                      </div>
                      <p className="text-sm text-slate-400 truncate">{i.message}</p>
                      <p className="font-mono text-[11px] text-slate-600 mt-0.5">
                        {i.user_name} · {i.vehicle_label} · {new Date(i.created_at).toLocaleString()}
                      </p>
                    </div>
                    <span className={`hidden sm:inline rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-wide ${
                      i.status === "open" ? "bg-[#ef4444]/15 text-red-300" :
                      i.status === "acknowledged" ? "bg-amber-500/15 text-amber-300" : "bg-emerald-500/15 text-emerald-300"
                    }`}>
                      {i.status}
                    </span>
                    <button
                      data-testid="dealer-incident-view-button"
                      onClick={() => openDetail(i.incident_id)}
                      className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 flex items-center gap-1.5 text-sm shrink-0"
                    >
                      <Eye size={15} /> <span className="hidden sm:inline">View</span>
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
        <DialogContent className="bg-[#0f141f] border-white/10 text-white backdrop-blur-md max-w-2xl max-h-[90vh] overflow-y-auto">
          {detail && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display uppercase tracking-wide flex items-center gap-2">
                  {(() => { const m = TYPE_META[detail.type] || TYPE_META.deviation; const I = m.icon; return <I style={{ color: m.color }} size={20} />; })()}
                  {(TYPE_META[detail.type] || {}).label} · {detail.user_name}
                </DialogTitle>
              </DialogHeader>

              {detail.location && (
                <div className="rounded-lg overflow-hidden border border-white/10 h-48 mt-2">
                  <LeafletMap className="w-full h-full" incident={detail.location} position={detail.location} />
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-3 mt-3">
                <Info label="Vehicle" value={detail.vehicle_label} />
                <Info label="Route" value={detail.route_name} />
                <Info label="Rider" value={detail.user_name} />
                <Info label="Contact Email" value={detail.user_email} />
              </div>

              <div className="rounded-lg bg-[#0b0f17] border border-white/10 p-4 mt-3">
                <p className="font-mono text-[10px] tracking-widest text-slate-500 uppercase mb-2">Shared Emergency Data</p>
                <Info label="Rider Phone" value={detail.shared_data?.phone || "Not shared"} icon={Phone} />
                <Info label="Location" value={detail.location ? `${detail.location[0].toFixed(4)}, ${detail.location[1].toFixed(4)}` : "—"} icon={MapPin} />
                <div className="mt-2">
                  <p className="text-slate-500 font-mono text-xs flex items-center gap-1.5 mb-1"><Users size={12} /> Family Contacts</p>
                  {(detail.shared_data?.contacts || []).length === 0 && <p className="text-xs text-slate-600">None</p>}
                  {(detail.shared_data?.contacts || []).map((c) => (
                    <p key={c.phone} className="text-sm text-white font-mono flex items-center gap-2"><Phone size={12} className="text-slate-500" /> {c.name} · {c.phone}</p>
                  ))}
                </div>
              </div>

              <div className="rounded-lg bg-[#0b0f17] border border-white/10 p-4 mt-3">
                <p className="font-mono text-[10px] tracking-widest text-slate-500 uppercase mb-2">Notified Channels</p>
                {(detail.shared_with || []).map((s) => (
                  <div key={s} className="flex items-center gap-2 text-sm text-emerald-300"><CheckCircle2 size={14} /> {s}</div>
                ))}
              </div>

              {/* Journey activity timeline */}
              {detail.journey?.events?.length > 0 && (
                <div className="rounded-lg bg-[#0b0f17] border border-white/10 p-4 mt-3">
                  <p className="font-mono text-[10px] tracking-widest text-slate-500 uppercase mb-2 flex items-center gap-2"><Activity size={12} /> Journey Activity</p>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {[...detail.journey.events].reverse().map((e) => (
                      <div key={e.event_id} className="flex items-start gap-2 text-xs">
                        <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: sev(e.severity) }} />
                        <span className="text-slate-400">{e.message}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 mt-4">
                <button
                  data-testid="dealer-acknowledge-button"
                  onClick={() => updateStatus(detail.incident_id, "acknowledged")}
                  className="flex-1 py-3 rounded-lg bg-amber-500/90 hover:bg-amber-500 text-black font-display font-bold uppercase tracking-wide text-sm flex items-center justify-center gap-2"
                >
                  <Radio size={16} /> Acknowledge & Dispatch
                </button>
                <button
                  data-testid="dealer-resolve-button"
                  onClick={() => updateStatus(detail.incident_id, "resolved")}
                  className="flex-1 py-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-display font-bold uppercase tracking-wide text-sm flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={16} /> Resolve
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

function DStat({ icon: Icon, label, value, color, testid }) {
  return (
    <div data-testid={testid} className="rounded-xl border border-white/10 bg-[#0f141f] p-5">
      <Icon size={20} style={{ color }} />
      <p className="font-mono font-bold text-2xl sm:text-3xl text-white mt-3">{value}</p>
      <p className="font-mono text-[10px] text-slate-500 uppercase tracking-wide mt-1">{label}</p>
    </div>
  );
}

function Info({ label, value, icon: Icon }) {
  return (
    <div className="flex items-center gap-2 py-1">
      {Icon && <Icon size={13} className="text-slate-500" />}
      <span className="font-mono text-xs text-slate-500 uppercase w-28 shrink-0">{label}</span>
      <span className="font-mono text-sm text-white truncate">{value}</span>
    </div>
  );
}
