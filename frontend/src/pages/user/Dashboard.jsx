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
  Gauge,
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
    { done: !!vehicle, label: "Register your vehicle", icon: Bike, to: "/app/onboarding" },
    { done: contacts.length > 0, label: "Set emergency family contacts", icon: Users, to: "/app/contacts" },
  ];
  const ready = steps.every((s) => s.done);

  return (
    <div className="hsj-fade-up">
      <p className="font-mono text-xs tracking-widest text-red-400/90 uppercase mb-2">
        Command Hub
      </p>
      <h1 className="font-display font-extrabold text-white text-3xl sm:text-4xl uppercase tracking-tight">
        Welcome, {user?.name?.split(" ")[0] || "Rider"}
      </h1>
      <p className="text-slate-400 mt-2 font-body">
        Your connected safety cockpit. Complete setup, then start a safe journey.
      </p>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mt-8">
        <StatCard icon={Activity} label="Journeys" value={journeys.length} tint="#10b981" testid="stat-journeys" />
        <StatCard icon={ShieldAlert} label="Incidents" value={incidents.length} tint="#f59e0b" testid="stat-incidents" />
      </div>

      {/* Setup checklist */}
      <div className="grid lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-2 rounded-xl border border-white/10 bg-[#0f141f] p-6 sm:p-7">
          <h2 className="font-display font-bold text-white text-xl uppercase tracking-wide mb-5">
            Safety Setup
          </h2>
          <div className="space-y-3">
            {steps.map((s) => (
              <button
                key={s.label}
                data-testid={`setup-${s.to.split("/").pop()}`}
                onClick={() => navigate(s.to)}
                className="w-full flex items-center gap-4 rounded-lg border border-white/10 bg-[#0b0f17] hover:bg-[#161d2c] hover:border-white/20 transition-colors p-4 text-left"
              >
                {s.done ? (
                  <CheckCircle2 className="text-emerald-400 shrink-0" size={22} />
                ) : (
                  <Circle className="text-slate-600 shrink-0" size={22} />
                )}
                <s.icon className="text-slate-400 shrink-0" size={18} />
                <span className={`flex-1 font-body ${s.done ? "text-slate-300" : "text-white"}`}>
                  {s.label}
                </span>
                <ArrowRight className="text-slate-600" size={18} />
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-[#e60012]/30 bg-gradient-to-b from-[#1a1012] to-[#0f141f] p-6 sm:p-7 flex flex-col">
          <Navigation className="text-[#e60012]" size={30} />
          <h3 className="font-display font-bold text-white text-lg uppercase tracking-wide mt-4">
            Start Safe Journey
          </h3>
          <p className="text-sm text-slate-400 mt-2 flex-1">
            {ready
              ? "You're all set. Plan a route and launch the live safety cockpit."
              : "Finish the setup steps to unlock the full safety experience."}
          </p>
          <button
            data-testid="dashboard-start-journey"
            onClick={() => navigate("/app/journey/new")}
            className="mt-5 w-full py-3 rounded-lg bg-[#e60012] hover:bg-[#cc0010] text-white font-display font-bold uppercase tracking-wide transition-colors flex items-center justify-center gap-2"
          >
            Plan Journey <ArrowRight size={18} />
          </button>
        </div>
      </div>

      {incidents.length > 0 && (
        <div className="rounded-xl border border-white/10 bg-[#0f141f] p-6 mt-6">
          <h2 className="font-display font-bold text-white text-lg uppercase tracking-wide mb-4">
            Recent Incidents
          </h2>
          <div className="space-y-2">
            {incidents.slice(0, 4).map((i) => (
              <div key={i.incident_id} className="flex items-center gap-3 text-sm py-2 border-b border-white/5 last:border-0">
                <ShieldAlert className="text-[#f59e0b]" size={16} />
                <span className="text-white capitalize">{i.type}</span>
                <span className="text-slate-500 flex-1 truncate">{i.message}</span>
                <span className="font-mono text-xs text-slate-600">
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

function StatCard({ icon: Icon, label, value, tint, testid }) {
  return (
    <div data-testid={testid} className="rounded-xl border border-white/10 bg-[#0f141f] p-5">
      <Icon size={20} style={{ color: tint }} />
      <p className="font-mono font-bold text-2xl sm:text-3xl text-white mt-3">{value}</p>
      <p className="font-mono text-[11px] text-slate-500 tracking-wide uppercase mt-1">{label}</p>
    </div>
  );
}
