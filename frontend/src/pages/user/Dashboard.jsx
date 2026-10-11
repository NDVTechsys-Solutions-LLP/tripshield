import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import {
  Bike,
  Users,
  Navigation,
  CheckCircle2,
  Circle,
  ArrowRight,
  Activity,
  ShieldAlert,
  Clock,
  ShieldCheck,
} from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [journeys, setJourneys] = useState([]);
  const [incidents, setIncidents] = useState([]);

  useEffect(() => {
    Promise.all([
      api.get("/vehicle"),
      api.get("/contacts"),
      api.get("/journeys"),
      api.get("/incidents"),
    ]).then(([v, c, j, i]) => {
      setVehicle(v.data);
      setContacts(c.data);
      setJourneys(j.data);
      setIncidents(i.data);
    });
  }, []);

  const steps = [
    { done: !!vehicle, label: "Register your vehicle", icon: Bike, to: "/app/onboarding", hint: vehicle ? `${vehicle.make} ${vehicle.model} (${vehicle.reg_no})` : "Link your 2-wheeler or 4-wheeler" },
    { done: contacts.length > 0, label: "Set emergency family contacts", icon: Users, to: "/app/contacts", hint: contacts.length > 0 ? `${contacts.length} trusted contacts active` : "Zero-app live tracking recipient" },
  ];
  const ready = steps.every((s) => s.done);

  return (
    <div className="hsj-fade-up space-y-8">
      {/* Header */}
      <div>
        <p className="text-xs font-bold tracking-wider text-[#e60012] uppercase mb-2">
          Command Hub
        </p>
        <h1 className="font-display font-extrabold text-white text-3xl sm:text-4xl uppercase tracking-tight">
          Welcome back, {user?.name?.split(" ")[0] || "Rider"}
        </h1>
        <p className="text-slate-400 mt-2 font-body text-sm sm:text-base">
          Your connected safety cockpit. Plan a safe journey or manage your vehicle network.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Activity} label="Total Journeys" value={journeys.length} testid="stat-journeys" />
        <StatCard icon={ShieldCheck} label="Safe Arrivals" value={journeys.filter((j) => j.status === "completed").length} />
        <StatCard icon={ShieldAlert} label="Active Incidents" value={incidents.filter((i) => i.status === "open").length} testid="stat-incidents" />
        <StatCard icon={Users} label="Trusted Contacts" value={contacts.length} />
      </div>

      {/* Main Action & Setup Grid */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Setup checklist */}
        <div className="lg:col-span-7 rounded-2xl border border-white/10 bg-[#0c111d] p-6 sm:p-7 shadow-xl">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-display font-bold text-white text-xl uppercase tracking-wide">
                Safety Readiness
              </h2>
              <p className="text-xs text-slate-400 mt-1 font-body">
                Essential setup to enable automated escalation and zero-app family link
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-300 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
              {steps.filter((s) => s.done).length} / {steps.length} Ready
            </span>
          </div>

          <div className="space-y-3">
            {steps.map((s) => (
              <button
                key={s.label}
                data-testid={`setup-${s.to.split("/").pop()}`}
                onClick={() => navigate(s.to)}
                className="w-full flex items-center gap-4 rounded-xl border border-white/10 bg-[#090d16] hover:bg-[#121929] hover:border-white/20 transition-all p-4 text-left cursor-pointer group"
              >
                {s.done ? (
                  <CheckCircle2 className="text-emerald-400 shrink-0" size={20} />
                ) : (
                  <Circle className="text-slate-600 shrink-0" size={20} />
                )}
                <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-slate-300 group-hover:text-white shrink-0">
                  <s.icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-body text-sm font-medium ${s.done ? "text-slate-200" : "text-white"}`}>
                    {s.label}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5 truncate font-normal">{s.hint}</p>
                </div>
                <ArrowRight className="text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all" size={16} />
              </button>
            ))}
          </div>
        </div>

        {/* Quick Launch Card */}
        <div className="lg:col-span-5 rounded-2xl border border-white/10 bg-[#0c111d] p-6 sm:p-7 shadow-xl flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#e60012] mb-5">
              <Navigation size={24} />
            </div>
            <h3 className="font-display font-bold text-white text-xl uppercase tracking-wide">
              Start Safe Journey
            </h3>
            <p className="text-sm text-slate-400 mt-2 font-body leading-relaxed">
              {ready
                ? "Vehicle and contacts are locked. Launch your live GPS safety net with turn-by-turn routing and instant family sharing."
                : "Complete your setup checklist on the left to activate full incident sensing and hands-free safety."}
            </p>
          </div>

          <button
            data-testid="dashboard-start-journey"
            onClick={() => navigate("/app/journey/new")}
            className="mt-6 w-full py-3.5 rounded-xl bg-[#e60012] hover:bg-[#ff1a2e] text-white font-display font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(230,0,18,0.35)] flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Plan Route &amp; Ignite</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Incidents Section */}
      {incidents.length > 0 && (
        <div className="rounded-2xl border border-white/10 bg-[#0c111d] p-6 sm:p-7 shadow-xl">
          <h2 className="font-display font-bold text-white text-xl uppercase tracking-wide mb-4">
            Recent Incident Records
          </h2>
          <div className="space-y-2">
            {incidents.slice(0, 4).map((i) => (
              <div key={i.incident_id} className="flex items-center gap-3 text-sm py-3 border-b border-white/5 last:border-0">
                <ShieldAlert className="text-amber-400 shrink-0" size={18} />
                <span className="text-white capitalize font-medium">{i.type}</span>
                <span className="text-slate-400 flex-1 truncate font-body">{i.message}</span>
                <span className="text-xs text-slate-400 font-medium">
                  {new Date(i.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, testid }) {
  return (
    <div data-testid={testid} className="rounded-2xl border border-white/10 bg-[#0c111d] p-5 shadow-xl hover:border-white/20 transition-all">
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-400 tracking-wide uppercase font-semibold">{label}</span>
        <Icon size={16} className="text-slate-400" />
      </div>
      <p className="font-display font-bold text-3xl text-white mt-2 tracking-tight">{value}</p>
    </div>
  );
}
