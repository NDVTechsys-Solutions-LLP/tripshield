import React, { useEffect, useRef, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { toast } from "sonner";
import LeafletMap from "@/components/LeafletMap";
import {
  Dialog, DialogContent,
} from "@/components/ui/dialog";
import {
  Gauge, Clock, Route as RouteIcon, Zap, Siren, GitBranch, TrafficCone,
  Car, ShieldCheck, ShieldAlert, Phone, MapPin, X, CheckCircle2, Radio,
  Activity, FileText, Home, Play, Pause, Mic, MicOff,
} from "lucide-react";

export default function LiveJourney() {
  const location = useLocation();
  const navigate = useNavigate();
  const [journey, setJourney] = useState(location.state?.journey || null);
  const [vehicle, setVehicle] = useState(null);
  const [idx, setIdx] = useState(0);
  const [running, setRunning] = useState(true);
  const [speed, setSpeed] = useState(48);
  const [delayMin, setDelayMin] = useState(0);
  const [events, setEvents] = useState([]);
  const [deviationPath, setDeviationPath] = useState(null);
  const [incidentMark, setIncidentMark] = useState(null);

  const [checkin, setCheckin] = useState(null); // {reason}
  const [countdown, setCountdown] = useState(15);
  const [sos, setSos] = useState(null); // incident object
  const [arrived, setArrived] = useState(null); // {notified}
  const [voiceOn, setVoiceOn] = useState(false);

  const timerRef = useRef(null);

  useEffect(() => {
    api.get("/vehicle").then((r) => setVehicle(r.data));
    if (!journey) {
      api.get("/journeys/active").then((r) => {
        if (r.data) setJourney(r.data);
        else { toast.error("No active journey"); navigate("/app/journey/new"); }
      });
    }
  }, []); // eslint-disable-line

  const route = journey?.route || [];
  const total = route.length;
  const step = Math.max(1, Math.floor(total / 130));

  const pushEvent = useCallback((type, message, severity) => {
    setEvents((e) => [{ type, message, severity, at: new Date() }, ...e]);
    if (journey) api.post(`/journeys/${journey.journey_id}/events`, { type, message, severity }).catch(() => {});
  }, [journey]);

  // Movement loop
  useEffect(() => {
    if (!running || !total || sos || arrived) return;
    timerRef.current = setInterval(() => {
      setIdx((i) => {
        const next = i + step;
        if (next >= total - 1) {
          clearInterval(timerRef.current);
          handleArrive();
          return total - 1;
        }
        return next;
      });
      setSpeed(40 + Math.round(Math.random() * 22));
    }, 650);
    return () => clearInterval(timerRef.current);
  }, [running, total, step, sos, arrived]); // eslint-disable-line

  // Check-in countdown
  useEffect(() => {
    if (!checkin) return;
    setCountdown(15);
    const iv = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(iv);
          escalateSOS(checkin.reason === "delay" ? "delay" : "deviation", "No response to safety check-in — auto-escalated");
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [checkin]); // eslint-disable-line

  // Periodic voluntary safety check-in (records rider response)
  useEffect(() => {
    if (!running || sos || arrived || checkin) return;
    const iv = setInterval(() => {
      setCheckin({
        reason: "periodic",
        title: "Safety Check-In",
        body: "Routine check-in — please confirm you're okay to continue.",
      });
    }, 42000);
    return () => clearInterval(iv);
  }, [running, sos, arrived, checkin]);

  // Hands-free voice SOS — listens for "Honda, help me"
  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!voiceOn) return;
    if (!SR) {
      toast.error("Voice recognition not supported in this browser");
      setVoiceOn(false);
      return;
    }
    const r = new SR();
    r.continuous = true;
    r.interimResults = true;
    r.lang = "en-IN";
    r.onresult = (e) => {
      const t = Array.from(e.results).map((x) => x[0].transcript).join(" ").toLowerCase();
      if (t.includes("honda") && t.includes("help") && !sos) {
        pushEvent("sos", "Hands-free voice command detected: 'Honda, help me'", "danger");
        escalateSOS("sos", "Hands-free voice SOS activated ('Honda, help me')");
      }
    };
    r.onerror = () => {};
    r.onend = () => { if (voiceOn) { try { r.start(); } catch {} } };
    try { r.start(); } catch {}
    toast.success("Voice SOS armed — say 'Honda, help me'");
    return () => { r.onend = null; try { r.stop(); } catch {} };
  }, [voiceOn, sos]); // eslint-disable-line

  const frac = total ? idx / (total - 1) : 0;
  const position = total ? route[Math.min(idx, total - 1)] : null;
  const distanceRemaining = journey ? (journey.distance_km * (1 - frac)).toFixed(1) : 0;
  const etaRemaining = journey ? Math.max(0, Math.round(journey.eta_min * (1 - frac)) + delayMin) : 0;
  const energy = vehicle?.energy_level || 72;

  // ---- Simulations ----
  const simDeviation = async () => {
    if (!position) return;
    const dev = [];
    for (let k = 1; k <= 6; k++) {
      dev.push([position[0] + 0.004 * k, position[1] + 0.006 * k]);
    }
    setDeviationPath([position, ...dev]);
    pushEvent("deviation", "Route deviation detected — vehicle off planned path", "warning");
    if (journey) {
      await api.post("/incidents", {
        journey_id: journey.journey_id, type: "deviation", severity: "medium",
        message: "Route deviation — incident raised to Honda Service Center",
        location: position,
      }).catch(() => {});
    }
    toast.warning("Route deviation reported to Honda Service Center");
    setCheckin({ reason: "deviation", title: "Route Deviation Detected", body: "Your vehicle has left the planned route. Are you safe?" });
  };

  const simDelay = () => {
    if (!position) return;
    setDelayMin((d) => d + 18);
    pushEvent("delay", "Traffic delay — ETA increased by 18 min", "warning");
    toast.warning("ETA delayed — safety check-in triggered");
    setCheckin({ reason: "delay", title: "ETA Delay Detected", body: "You're significantly behind schedule. Are you safe?" });
  };

  const simAccident = async () => {
    if (!position) return;
    setRunning(false);
    setIncidentMark(position);
    pushEvent("accident", "Sudden impact detected (4.2G) — vehicle stopped", "danger");
    await escalateSOS("accident", "Crash impact detected — full SOS sequence activated");
  };

  const escalateSOS = async (type, message) => {
    setCheckin(null);
    setRunning(false);
    if (!journey) return;
    try {
      const r = await api.post("/incidents", {
        journey_id: journey.journey_id, type, severity: "high", message,
        location: position,
      });
      setSos(r.data);
      setIncidentMark(position);
      pushEvent("sos", "SOS broadcast: 112 ERSS + Family + Honda dealer notified", "danger");
    } catch { toast.error("SOS dispatch failed"); }
  };

  const manualSOS = () => escalateSOS("sos", "Manual SOS activated by rider");

  const confirmSafe = () => {
    setCheckin(null);
    setDeviationPath(null);
    pushEvent("checkin", "Rider confirmed safe — resuming journey", "success");
    toast.success("Marked safe. Journey resumed.");
    setRunning(true);
  };

  const cancelSOS = () => {
    setSos(null);
    setIncidentMark(null);
    pushEvent("checkin", "SOS cancelled by rider (false alarm)", "info");
    toast.success("SOS cancelled");
    setRunning(true);
  };

  const handleArrive = async () => {
    if (!journey) return;
    try {
      const r = await api.post(`/journeys/${journey.journey_id}/complete`);
      setArrived({ notified: r.data.notified });
      pushEvent("arrived", "Destination reached — family notified of safe arrival", "success");
    } catch {}
  };

  if (!journey) {
    return <div className="min-h-[60vh] flex items-center justify-center text-slate-400 font-mono">Loading journey…</div>;
  }

  return (
    <div className="hsj-fade-up">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <p className="font-mono text-xs tracking-widest text-red-400/90 uppercase mb-1">
            {sos ? "Emergency Active" : arrived ? "Journey Complete" : "Live Cockpit"}
          </p>
          <h1 className="font-display font-extrabold text-white text-2xl sm:text-3xl uppercase tracking-tight">
            {journey.from_name.split(",")[0]} → {journey.to_name.split(",")[0]}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            data-testid="voice-sos-toggle"
            onClick={() => setVoiceOn((v) => !v)}
            disabled={!!sos}
            title="Hands-free voice SOS"
            className={`px-4 py-3 rounded-lg font-display font-bold uppercase tracking-wide text-sm transition-colors flex items-center gap-2 border ${
              voiceOn
                ? "bg-[#e60012]/15 border-[#e60012]/50 text-red-300"
                : "bg-[#0f141f] border-white/10 text-slate-400 hover:text-white"
            }`}
          >
            {voiceOn ? <Mic size={18} /> : <MicOff size={18} />}
            <span className="hidden sm:inline">{voiceOn ? "Listening" : "Voice SOS"}</span>
          </button>
          <button
            data-testid="emergency-sos-trigger-button"
            onClick={manualSOS}
            disabled={!!sos}
            className="px-5 py-3 rounded-lg bg-[#ef4444] hover:bg-red-600 disabled:opacity-40 text-white font-display font-bold uppercase tracking-wide text-sm transition-colors flex items-center gap-2 shadow-lg shadow-red-500/25"
          >
            <Siren size={18} /> SOS
          </button>
        </div>
      </div>

      {/* Telemetry cluster */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
        <Tele icon={Gauge} label="Speed" value={sos || arrived ? "0" : speed} unit="km/h" color="#e60012" />
        <Tele icon={Zap} label="Energy" value={energy} unit="%" color={energy > 30 ? "#10b981" : "#ef4444"} />
        <Tele icon={RouteIcon} label="Remaining" value={distanceRemaining} unit="km" color="#3b82f6" />
        <Tele icon={Clock} label="ETA" value={etaRemaining} unit="min" color={delayMin ? "#f59e0b" : "#94a3b8"} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mt-6">
        {/* Map */}
        <div className="lg:col-span-2 rounded-xl border border-white/10 overflow-hidden h-[420px]">
          <LeafletMap
            className="w-full h-full"
            route={route}
            position={position}
            from={journey.from_coords}
            to={journey.to_coords}
            deviationPath={deviationPath}
            incident={incidentMark}
          />
        </div>

        {/* Side: controls + feed */}
        <div className="space-y-4">
          {/* progress */}
          <div className="rounded-xl border border-white/10 bg-[#0f141f] p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs text-slate-500 uppercase tracking-wide">Progress</span>
              <span className="font-mono text-sm text-white">{Math.round(frac * 100)}%</span>
            </div>
            <div className="h-2 rounded-full bg-[#0b0f17] overflow-hidden">
              <div className="h-full bg-[#e60012] transition-all duration-500" style={{ width: `${frac * 100}%` }} />
            </div>
            {!sos && !arrived && (
              <button
                data-testid="journey-pause-toggle"
                onClick={() => setRunning((r) => !r)}
                className="mt-4 w-full py-2.5 rounded-lg border border-white/10 hover:border-white/25 text-slate-300 text-sm font-body flex items-center justify-center gap-2"
              >
                {running ? <><Pause size={15} /> Pause</> : <><Play size={15} /> Resume</>}
              </button>
            )}
          </div>

          {/* Simulation controls */}
          {!sos && !arrived && (
            <div className="rounded-xl border border-white/10 bg-[#0f141f] p-5">
              <p className="font-mono text-[10px] tracking-widest text-slate-500 uppercase mb-3">
                Scenario Simulation
              </p>
              <div className="space-y-2">
                <SimBtn testid="simulate-deviation-button" icon={GitBranch} label="Route Deviation" color="#f59e0b" onClick={simDeviation} />
                <SimBtn testid="simulate-delay-button" icon={TrafficCone} label="Traffic / ETA Delay" color="#f59e0b" onClick={simDelay} />
                <SimBtn testid="simulate-accident-button" icon={Car} label="Sudden Impact / Crash" color="#ef4444" onClick={simAccident} />
              </div>
            </div>
          )}

          {/* Event feed */}
          <div className="rounded-xl border border-white/10 bg-[#0f141f] p-5">
            <p className="font-mono text-[10px] tracking-widest text-slate-500 uppercase mb-3 flex items-center gap-2">
              <Activity size={12} /> Event Feed
            </p>
            <div className="space-y-2 max-h-52 overflow-y-auto" data-testid="event-feed">
              {events.length === 0 && <p className="text-xs text-slate-600 font-mono">Journey nominal…</p>}
              {events.map((e, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: sevColor(e.severity) }} />
                  <div>
                    <p className="text-slate-300">{e.message}</p>
                    <p className="font-mono text-[10px] text-slate-600">{e.at.toLocaleTimeString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Check-in modal */}
      <Dialog open={!!checkin} onOpenChange={() => {}}>
        <DialogContent className="bg-[#0f141f] border-amber-500/40 text-white backdrop-blur-md [&>button]:hidden max-w-md">
          <div className="text-center py-2">
            <div className="relative w-24 h-24 mx-auto mb-4">
              <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="44" fill="none" stroke="#26304a" strokeWidth="6" />
                <circle cx="50" cy="50" r="44" fill="none" stroke="#f59e0b" strokeWidth="6"
                  strokeDasharray={276} strokeDashoffset={276 - (276 * countdown) / 15}
                  strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s linear" }} />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center font-mono font-bold text-2xl text-amber-400">
                {countdown}
              </span>
            </div>
            <ShieldAlert className="text-amber-400 mx-auto mb-2" size={28} />
            <h3 className="font-display font-bold text-xl uppercase tracking-wide">{checkin?.title}</h3>
            <p className="text-sm text-slate-400 mt-2">{checkin?.body}</p>
            <div className="flex gap-3 mt-6">
              <button
                data-testid="safety-checkin-yes-safe-button"
                onClick={confirmSafe}
                className="flex-1 py-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-display font-bold uppercase tracking-wide text-sm flex items-center justify-center gap-2"
              >
                <CheckCircle2 size={17} /> I'm Safe
              </button>
              <button
                data-testid="safety-checkin-sos-button"
                onClick={() => escalateSOS(checkin?.reason === "delay" ? "delay" : "deviation", "Rider requested assistance during check-in")}
                className="flex-1 py-3 rounded-lg bg-[#ef4444] hover:bg-red-600 text-white font-display font-bold uppercase tracking-wide text-sm flex items-center justify-center gap-2"
              >
                <Siren size={17} /> Need Help
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* SOS panel */}
      <Dialog open={!!sos} onOpenChange={() => {}}>
        <DialogContent className="bg-[#12060a] border-[#ef4444]/50 text-white backdrop-blur-md [&>button]:hidden max-w-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative w-11 h-11 rounded-full bg-[#ef4444]/20 flex items-center justify-center hsj-pulse">
              <Siren className="text-[#ef4444]" size={22} />
            </div>
            <div>
              <p className="font-display font-extrabold text-xl uppercase tracking-wide text-white">SOS Active</p>
              <p className="font-mono text-xs text-red-300 capitalize">{sos?.type} · {sos?.route_name}</p>
            </div>
          </div>

          <div className="rounded-lg bg-black/40 border border-white/10 p-4 space-y-2">
            <p className="font-mono text-[10px] tracking-widest text-slate-500 uppercase">Dispatched To</p>
            {(sos?.shared_with || []).map((s) => (
              <div key={s} className="flex items-center gap-2 text-sm text-emerald-300">
                <CheckCircle2 size={15} /> {s}
              </div>
            ))}
          </div>

          <div className="rounded-lg bg-black/40 border border-white/10 p-4 mt-3 space-y-2">
            <p className="font-mono text-[10px] tracking-widest text-slate-500 uppercase">Broadcast Payload</p>
            <PayRow icon={FileText} label="Aadhaar" value={sos?.shared_data?.aadhaar || "Not shared (check wallet)"} />
            <PayRow icon={ShieldCheck} label="Medical" value={sos?.shared_data?.medical_policy || "Not in wallet"} />
            <PayRow icon={MapPin} label="Location" value={position ? `${position[0].toFixed(4)}, ${position[1].toFixed(4)}` : "—"} />
            <PayRow icon={Phone} label="Contacts" value={`${sos?.shared_data?.contacts?.length || 0} family notified`} />
          </div>

          <div className="flex gap-3 mt-5">
            {(sos?.type === "accident" || sos?.type === "sos") && (
              <button
                data-testid="sos-file-claim-button"
                onClick={() => navigate("/app/claim")}
                className="flex-1 py-3 rounded-lg bg-white/10 hover:bg-white/20 text-white font-display font-bold uppercase tracking-wide text-sm flex items-center justify-center gap-2"
              >
                <FileText size={16} /> File Claim
              </button>
            )}
            <button
              data-testid="sos-cancel-button"
              onClick={cancelSOS}
              className="flex-1 py-3 rounded-lg border border-white/20 hover:bg-white/5 text-slate-300 font-display font-bold uppercase tracking-wide text-sm flex items-center justify-center gap-2"
            >
              <X size={16} /> Cancel SOS
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Arrival */}
      <Dialog open={!!arrived} onOpenChange={() => {}}>
        <DialogContent className="bg-[#0f141f] border-emerald-500/40 text-white backdrop-blur-md [&>button]:hidden max-w-md">
          <div className="text-center py-2">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="text-emerald-400" size={36} />
            </div>
            <h3 className="font-display font-extrabold text-2xl uppercase tracking-wide">Safely Arrived</h3>
            <p className="text-sm text-slate-400 mt-2">{journey.to_name}</p>

            <div className="grid grid-cols-3 gap-3 mt-5">
              <TripStat label="Distance" value={`${journey.distance_km}km`} />
              <TripStat label="Safety" value="100%" />
              <TripStat label="Alerts" value={events.filter((e) => e.severity === "danger").length} />
            </div>

            <div className="rounded-lg bg-[#0b0f17] border border-white/10 p-4 mt-4 text-left">
              <p className="font-mono text-[10px] tracking-widest text-slate-500 uppercase mb-2 flex items-center gap-2">
                <Radio size={12} /> Auto-Notified Family
              </p>
              {(arrived?.notified || []).length === 0 && <p className="text-xs text-slate-600 font-mono">No contacts configured</p>}
              {(arrived?.notified || []).map((c) => (
                <div key={c.phone} className="flex items-center gap-2 text-sm text-emerald-300">
                  <CheckCircle2 size={14} /> {c.name} · {c.phone}
                </div>
              ))}
            </div>

            <button
              data-testid="close-journey-button"
              onClick={() => navigate("/app")}
              className="mt-5 w-full py-3 rounded-lg bg-[#e60012] hover:bg-[#cc0010] text-white font-display font-bold uppercase tracking-wide flex items-center justify-center gap-2"
            >
              <Home size={17} /> Close Safe Journey
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function sevColor(s) {
  return { danger: "#ef4444", warning: "#f59e0b", success: "#10b981", info: "#3b82f6" }[s] || "#64748b";
}

function Tele({ icon: Icon, label, value, unit, color }) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#0f141f] p-4">
      <Icon size={16} style={{ color }} />
      <p className="font-mono font-bold text-2xl text-white mt-2">
        {value}<span className="text-sm text-slate-500 ml-1">{unit}</span>
      </p>
      <p className="font-mono text-[10px] text-slate-600 uppercase tracking-wide">{label}</p>
    </div>
  );
}

function SimBtn({ icon: Icon, label, color, onClick, testid }) {
  return (
    <button
      data-testid={testid}
      onClick={onClick}
      className="w-full flex items-center gap-3 rounded-lg border border-white/10 bg-[#0b0f17] hover:bg-[#161d2c] px-4 py-3 text-left transition-colors"
    >
      <Icon size={18} style={{ color }} />
      <span className="text-sm text-white flex-1">{label}</span>
    </button>
  );
}

function PayRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <Icon size={14} className="text-slate-500" />
      <span className="text-slate-500 font-mono text-xs w-20">{label}</span>
      <span className="text-white font-mono text-xs truncate">{value}</span>
    </div>
  );
}

function TripStat({ label, value }) {
  return (
    <div className="rounded-lg bg-[#0b0f17] border border-white/10 p-3">
      <p className="font-mono font-bold text-lg text-white">{value}</p>
      <p className="font-mono text-[9px] text-slate-600 uppercase tracking-wide">{label}</p>
    </div>
  );
}
