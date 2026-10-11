import React, { useEffect, useRef, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { toast } from "sonner";
import LeafletMap from "@/components/LeafletMap";
import { speak, initSpeech, stopSpeaking } from "@/lib/speech";
import {
  Dialog, DialogContent,
} from "@/components/ui/dialog";
import {
  Gauge, Clock, Route as RouteIcon, Zap, Siren, GitBranch, TrafficCone,
  Car, ShieldCheck, ShieldAlert, Phone, MapPin, X, CheckCircle2, Radio,
  Activity, FileText, Home, Play, Pause, Mic, MicOff, Share2, Copy, Square,
  MessageSquare, Send, Mail, Heart, ShieldPlus, AudioLines, PhoneCall,
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
  const startSpokenRef = useRef(false);
  const micStreamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recChunksRef = useRef([]);
  const recTimerRef = useRef(null);
  const [micReady, setMicReady] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recSecs, setRecSecs] = useState(0);

  useEffect(() => {
    initSpeech();
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

  // Hands-free voice SOS — listens for "TripShield, help me"
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
      if ((t.includes("shield") || t.includes("trip")) && t.includes("help") && !sos) {
        pushEvent("sos", "Hands-free voice command detected: 'TripShield, help me'", "danger");
        escalateSOS("sos", "Hands-free voice SOS activated ('TripShield, help me')");
      }
    };
    r.onerror = () => {};
    r.onend = () => { if (voiceOn) { try { r.start(); } catch {} } };
    try { r.start(); } catch {}
    toast.success("Voice SOS armed — say 'TripShield, help me'");
    return () => { r.onend = null; try { r.stop(); } catch {} };
  }, [voiceOn, sos]); // eslint-disable-line

  // Spoken narration
  useEffect(() => {
    if (journey && !startSpokenRef.current) {
      startSpokenRef.current = true;
      speak("Safe journey activated. Live safety monitoring is on. Ride safe.");
    }
  }, [journey]);

  useEffect(() => {
    if (checkin) speak("Safety check in. Are you safe? Please confirm that you are okay.");
  }, [checkin]);

  useEffect(() => {
    if (sos) {
      speak(
        "S O S activated. Emergency services, your family, and TripShield service center have been notified. Help is on the way. Stay calm."
      );
    }
  }, [sos]);

  useEffect(() => {
    if (arrived) speak("You have safely arrived at your destination. Your family has been notified.");
  }, [arrived]);

  useEffect(() => () => stopSpeaking(), []);

  // Request mic access once when the live journey starts
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!navigator.mediaDevices?.getUserMedia) return;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }
        micStreamRef.current = stream;
        setMicReady(true);
      } catch {
        setMicReady(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Cleanup recorder + mic on unmount
  useEffect(() => () => {
    try { mediaRecorderRef.current?.stop(); } catch {}
    clearInterval(recTimerRef.current);
    micStreamRef.current?.getTracks().forEach((t) => t.stop());
  }, []);

  const uploadEmergencyAudio = useCallback(async (blob, jid) => {
    try {
      const fd = new FormData();
      const ext = blob.type.includes("ogg") ? "ogg" : blob.type.includes("mp4") ? "mp4" : "webm";
      fd.append("file", blob, `sos.${ext}`);
      await api.post(`/journeys/${jid}/sos-audio`, fd, { headers: { "Content-Type": "multipart/form-data" } });
      pushEvent("sos", "Emergency audio clip shared with family", "danger");
    } catch { /* silent */ }
  }, [pushEvent]);

  const stopEmergencyRecording = useCallback(() => {
    try { mediaRecorderRef.current?.stop(); } catch {}
  }, []);

  const startEmergencyRecording = useCallback((jid) => {
    const stream = micStreamRef.current;
    if (!stream || mediaRecorderRef.current) return;
    let mr;
    try { mr = new MediaRecorder(stream); } catch { return; }
    recChunksRef.current = [];
    mr.ondataavailable = (e) => { if (e.data && e.data.size) recChunksRef.current.push(e.data); };
    mr.onstop = () => {
      const blob = new Blob(recChunksRef.current, { type: mr.mimeType || "audio/webm" });
      mediaRecorderRef.current = null;
      setRecording(false);
      clearInterval(recTimerRef.current);
      setRecSecs(0);
      if (blob.size) uploadEmergencyAudio(blob, jid);
    };
    mediaRecorderRef.current = mr;
    mr.start();
    setRecording(true);
    setRecSecs(0);
    recTimerRef.current = setInterval(() => {
      setRecSecs((s) => {
        if (s + 1 >= 60) { stopEmergencyRecording(); return 60; }
        return s + 1;
      });
    }, 1000);
  }, [uploadEmergencyAudio, stopEmergencyRecording]);

  const frac = total ? idx / (total - 1) : 0;
  const position = total ? route[Math.min(idx, total - 1)] : null;
  const distanceRemaining = journey ? (journey.distance_km * (1 - frac)).toFixed(1) : 0;
  const etaRemaining = journey ? Math.max(0, Math.round(journey.eta_min * (1 - frac)) + delayMin) : 0;
  const energy = vehicle?.energy_level || 72;
  const shareUrl = journey ? `${window.location.origin}/track/${journey.share_token}` : "";

  // Broadcast live position
  useEffect(() => {
    if (!journey || !position) return;
    api.post(`/journeys/${journey.journey_id}/position`, { position, progress: frac }).catch(() => {});
  }, [idx]); // eslint-disable-line

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
        message: "Route deviation — incident raised to TripShield Service Center",
        location: position,
      }).catch(() => {});
    }
    toast.warning("Route deviation reported to TripShield Service Center");
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
      startEmergencyRecording(journey.journey_id);
      pushEvent("sos", "SOS broadcast: Family + TripShield dealer notified", "danger");
    } catch { toast.error("SOS dispatch failed"); }
  };

  const manualSOS = () => escalateSOS("sos", "Manual SOS activated by rider");

  const confirmSafe = () => {
    setCheckin(null);
    setDeviationPath(null);
    speak("Thank you. Glad you are safe. Resuming your journey.");
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
    return <div className="min-h-[60vh] flex items-center justify-center text-slate-400 font-medium">Loading cockpit…</div>;
  }

  return (
    <div className="hsj-fade-up max-w-6xl space-y-8">
      {/* Top Cockpit Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="text-xs font-bold tracking-wider text-[#e60012] uppercase mb-1">
            {sos ? "Emergency Broadcast Active" : arrived ? "Journey Complete" : "Live Safety Cockpit"}
          </p>
          <h1 className="font-display font-extrabold text-white text-2xl sm:text-3xl uppercase tracking-tight">
            {journey.from_name.split(",")[0]} → {journey.to_name.split(",")[0]}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            data-testid="voice-sos-toggle"
            onClick={() => setVoiceOn((v) => {
              const nv = !v;
              if (nv) speak("Voice S O S armed. Say, TripShield, help me, to trigger an emergency.");
              return nv;
            })}
            disabled={!!sos}
            title="Hands-free voice SOS"
            className={`px-5 py-2.5 rounded-xl font-display font-bold uppercase tracking-wider text-xs transition-all flex items-center gap-2 border cursor-pointer ${
              voiceOn
                ? "bg-[#e60012]/15 border-[#e60012]/50 text-red-200 ring-1 ring-[#e60012]/40"
                : "bg-white/5 border-white/10 text-slate-300 hover:text-white hover:border-white/20"
            }`}
          >
            {voiceOn ? <Mic size={16} className="text-[#e60012]" /> : <MicOff size={16} />}
            <span>{voiceOn ? "Voice Armed" : "Voice SOS"}</span>
          </button>

          <button
            data-testid="emergency-sos-trigger-button"
            onClick={manualSOS}
            disabled={!!sos}
            className="px-6 py-2.5 rounded-xl bg-[#e60012] hover:bg-[#ff1a2e] disabled:opacity-40 text-white font-display font-bold uppercase tracking-wider text-xs transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(230,0,18,0.4)] cursor-pointer"
          >
            <Siren size={16} />
            <span>SOS</span>
          </button>
        </div>
      </div>

      {/* Live cluster tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Tele icon={Gauge} label="Speed" value={sos || arrived ? "0" : speed} unit="km/h" color="#e60012" />
        <Tele icon={Zap} label="Vehicle Energy" value={energy} unit="%" color={energy > 30 ? "#10b981" : "#ef4444"} />
        <Tele icon={RouteIcon} label="Distance Left" value={distanceRemaining} unit="km" color="#3b82f6" />
        <Tele icon={Clock} label="Estimated Arrival" value={etaRemaining} unit="min" color={delayMin ? "#f59e0b" : "#94a3b8"} />
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Map Container */}
        <div className="lg:col-span-8 rounded-2xl border border-white/10 bg-[#0c111d] overflow-hidden shadow-2xl h-[460px] lg:h-[600px]">
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

        {/* Side Panel: Progress, Sharing, Scenarios & Event Feed */}
        <div className="lg:col-span-4 space-y-5">
          {/* Progress Card */}
          <div className="rounded-2xl border border-white/10 bg-[#0c111d] p-6 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-slate-400 uppercase tracking-wide font-semibold">Route Progress</span>
              <span className="font-display text-sm text-white font-bold">{Math.round(frac * 100)}%</span>
            </div>
            <div className="h-2 rounded-full bg-[#090d16] border border-white/5 overflow-hidden">
              <div className="h-full bg-[#e60012] transition-all duration-500 rounded-full" style={{ width: `${frac * 100}%` }} />
            </div>

            {!sos && !arrived && (
              <div className="grid grid-cols-2 gap-2 mt-5">
                <button
                  data-testid="journey-pause-toggle"
                  onClick={() => setRunning((r) => !r)}
                  className="py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-display font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  {running ? <><Pause size={14} /> Pause</> : <><Play size={14} /> Resume</>}
                </button>
                <button
                  data-testid="end-journey-button"
                  onClick={handleArrive}
                  className="py-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs font-display font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Square size={13} /> End Ride
                </button>
              </div>
            )}
          </div>

          {/* Share live tracking link */}
          {journey?.share_token && (
            <div className="rounded-2xl border border-white/10 bg-[#0c111d] p-6 shadow-xl" data-testid="share-panel">
              <p className="text-xs text-slate-300 uppercase mb-3 flex items-center gap-2 font-bold tracking-wider">
                <Share2 size={14} className="text-[#e60012]" /> Zero-App Family Link
              </p>
              <div className="flex items-center gap-2 rounded-xl bg-[#090d16] border border-white/10 px-3.5 py-2.5 mb-3">
                <span className="text-xs text-slate-300 truncate flex-1 font-medium">{shareUrl}</span>
                <button
                  data-testid="copy-share-link"
                  onClick={() => { navigator.clipboard?.writeText(shareUrl); toast.success("Live link copied"); }}
                  className="text-slate-400 hover:text-white p-1 rounded hover:bg-white/10 transition-colors cursor-pointer shrink-0"
                >
                  <Copy size={15} />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <ShareBtn testid="share-whatsapp" icon={Send} label="WhatsApp"
                  onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent("Track my TripShield ride live: " + shareUrl)}`, "_blank")} />
                <ShareBtn testid="share-sms" icon={MessageSquare} label="SMS"
                  onClick={() => { window.location.href = `sms:?body=${encodeURIComponent("Track my TripShield ride live: " + shareUrl)}`; }} />
                <ShareBtn testid="share-email" icon={Mail} label="Email"
                  onClick={() => { window.location.href = `mailto:?subject=${encodeURIComponent("TripShield Safe Journey Live Tracking")}&body=${encodeURIComponent("Track my ride live: " + shareUrl)}`; }} />
              </div>
            </div>
          )}

          {/* Simulation controls */}
          {!sos && !arrived && (
            <div className="rounded-2xl border border-white/10 bg-[#0c111d] p-6 shadow-xl space-y-3">
              <p className="text-xs text-slate-300 uppercase font-bold tracking-wider">
                Safety Scenario Simulation
              </p>
              <div className="space-y-2">
                <SimBtn testid="simulate-deviation-button" icon={GitBranch} label="Route Deviation Trigger" color="#f59e0b" onClick={simDeviation} />
                <SimBtn testid="simulate-delay-button" icon={TrafficCone} label="Traffic / ETA Delay Trigger" color="#f59e0b" onClick={simDelay} />
                <SimBtn testid="simulate-accident-button" icon={Car} label="Impact / Crash Detection" color="#ef4444" onClick={simAccident} />
              </div>
            </div>
          )}

          {/* Event feed */}
          <div className="rounded-2xl border border-white/10 bg-[#0c111d] p-6 shadow-xl">
            <p className="text-xs text-slate-300 uppercase mb-3 flex items-center gap-2 font-bold tracking-wider">
              <Activity size={14} className="text-[#e60012]" /> Cockpit Telemetry Log
            </p>
            <div className="space-y-2.5 max-h-52 overflow-y-auto hsj-scroll" data-testid="event-feed">
              {events.length === 0 && (
                <p className="text-xs text-slate-400 py-2 font-medium">All telemetry channels nominal…</p>
              )}
              {events.map((e, i) => (
                <div key={i} className="flex items-start gap-2.5 text-xs">
                  <span className="w-2 h-2 rounded-full mt-1 shrink-0" style={{ background: sevColor(e.severity) }} />
                  <div className="min-w-0 flex-1">
                    <p className="text-slate-200 font-body">{e.message}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5 font-medium">{e.at.toLocaleTimeString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Check-in modal */}
      <Dialog open={!!checkin} onOpenChange={() => {}}>
        <DialogContent className="bg-[#0c111d]/95 border-amber-500/30 text-white backdrop-blur-2xl rounded-3xl p-6 sm:p-8 max-w-md shadow-2xl [&>button]:hidden">
          <div className="text-center py-2">
            <div className="relative w-24 h-24 mx-auto mb-4">
              <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="44" fill="none" stroke="#161d2c" strokeWidth="6" />
                <circle cx="50" cy="50" r="44" fill="none" stroke="#f59e0b" strokeWidth="6"
                  strokeDasharray={276} strokeDashoffset={276 - (276 * countdown) / 15}
                  strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s linear" }} />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center font-display font-extrabold text-3xl text-amber-400">
                {countdown}
              </span>
            </div>
            <ShieldAlert className="text-amber-400 mx-auto mb-2" size={28} />
            <h3 className="font-display font-bold text-xl uppercase tracking-wide">{checkin?.title}</h3>
            <p className="text-sm text-slate-400 mt-2 font-body">{checkin?.body}</p>
            <div className="flex gap-3 mt-6">
              <button
                data-testid="safety-checkin-yes-safe-button"
                onClick={confirmSafe}
                className="flex-1 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-display font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <CheckCircle2 size={16} /> I'm Safe
              </button>
              <button
                data-testid="safety-checkin-sos-button"
                onClick={() => escalateSOS(checkin?.reason === "delay" ? "delay" : "deviation", "Rider requested assistance during check-in")}
                className="flex-1 py-3.5 rounded-xl bg-[#e60012] hover:bg-[#ff1a2e] text-white font-display font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-[0_0_20px_rgba(230,0,18,0.35)]"
              >
                <Siren size={16} /> Need Help
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* SOS Dialog */}
      <Dialog open={!!sos} onOpenChange={() => {}}>
        <DialogContent className="bg-[#0c111d]/95 border-[#ef4444]/40 text-white backdrop-blur-2xl rounded-3xl p-6 sm:p-8 max-w-lg shadow-2xl [&>button]:hidden">
          <div className="flex items-center gap-3.5 mb-5">
            <div className="w-12 h-12 rounded-2xl bg-[#ef4444]/20 border border-[#ef4444]/40 flex items-center justify-center text-[#ef4444] shrink-0">
              <Siren size={24} />
            </div>
            <div>
              <p className="font-display font-extrabold text-xl uppercase tracking-wide text-white">Emergency Broadcast Active</p>
              <p className="text-xs text-red-300 capitalize mt-0.5 font-medium">{sos?.type} incident · {sos?.route_name}</p>
            </div>
          </div>

          <div className="rounded-2xl bg-[#090d16] border border-white/10 p-5 space-y-2.5">
            <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Dispatched To</p>
            {(sos?.shared_with || []).map((s) => (
              <div key={s} className="flex items-center gap-2 text-sm text-emerald-400 font-medium">
                <CheckCircle2 size={15} /> {s}
              </div>
            ))}
          </div>

          <div className="rounded-2xl bg-[#090d16] border border-white/10 p-5 mt-3 space-y-2.5">
            <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Emergency Payload</p>
            <PayRow icon={Phone} label="Rider Phone" value={sos?.shared_data?.phone || "Set in Preferences"} />
            <PayRow icon={Heart} label="Blood Group" value={sos?.shared_data?.blood_group || "Not set"} />
            <PayRow icon={ShieldPlus} label="Allergies" value={sos?.shared_data?.allergies || "None noted"} />
            <PayRow icon={MapPin} label="Location" value={position ? `${position[0].toFixed(4)}, ${position[1].toFixed(4)}` : "—"} />
            <PayRow icon={Phone} label="Contacts" value={`${sos?.shared_data?.contacts?.length || 0} family notified`} />
          </div>

          {/* Emergency Audio Recording */}
          {sos && (
            <div data-testid="sos-audio-recorder" className="rounded-2xl bg-[#090d16] border border-[#ef4444]/30 p-4 mt-3">
              {recording ? (
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0 animate-ping" />
                    <AudioLines size={16} className="text-red-300 shrink-0" />
                    <span className="text-xs text-red-200 font-body truncate">
                      Recording audio for family… <span className="font-semibold text-white">{recSecs}s / 60s</span>
                    </span>
                  </div>
                  <button
                    data-testid="sos-audio-stop-button"
                    onClick={stopEmergencyRecording}
                    className="shrink-0 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                  >
                    <Square size={11} /> Stop &amp; Send
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs">
                  {micReady ? (
                    <><CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                    <span className="text-emerald-300 font-body">Emergency audio captured &amp; shared with family</span></>
                  ) : (
                    <><MicOff size={15} className="text-slate-500 shrink-0" />
                    <span className="text-slate-400 font-body">Microphone unavailable — audio capture skipped</span></>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Dispatcher report to 112 / ERSS */}
          {sos?.erss_report && (
            <div data-testid="sos-erss-report" className="rounded-2xl bg-[#090d16] border border-[#3b82f6]/30 p-4 mt-3 space-y-2">
              <p className="text-xs text-blue-400 uppercase flex items-center gap-2 font-bold tracking-wider">
                <ShieldCheck size={14} className="text-blue-400" /> Emergency Dispatcher · 112 / ERSS
              </p>
              <div className="flex items-start gap-2 text-xs text-slate-300">
                <PhoneCall size={14} className="text-blue-400 mt-0.5 shrink-0" />
                <span>{sos.erss_report.call_status}</span>
              </div>
              <div className="flex items-start gap-2 text-xs text-slate-300">
                <Mail size={14} className="text-blue-400 mt-0.5 shrink-0" />
                <span>{sos.erss_report.email_status}</span>
              </div>
              {sos.erss_report.ai_narrative && (
                <p className="text-xs text-slate-400 italic leading-relaxed border-l-2 border-blue-500/40 pl-2.5 mt-1 font-body">
                  "{sos.erss_report.ai_narrative}"
                </p>
              )}
            </div>
          )}

          <div className="flex gap-3 mt-5">
            {(sos?.type === "accident" || sos?.type === "sos") && (
              <button
                data-testid="sos-file-claim-button"
                onClick={() => navigate("/app/claim")}
                className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-display font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <FileText size={16} /> File Claim
              </button>
            )}
            <button
              data-testid="sos-cancel-button"
              onClick={cancelSOS}
              className="flex-1 py-3 rounded-xl border border-white/20 hover:bg-white/5 text-slate-300 font-display font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <X size={16} /> Cancel SOS
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Arrival Dialog */}
      <Dialog open={!!arrived} onOpenChange={() => {}}>
        <DialogContent className="bg-[#0c111d]/95 border-emerald-500/30 text-white backdrop-blur-2xl rounded-3xl p-6 sm:p-8 max-w-md shadow-2xl [&>button]:hidden">
          <div className="text-center py-2">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4 text-emerald-400">
              <CheckCircle2 size={36} />
            </div>
            <h3 className="font-display font-extrabold text-2xl uppercase tracking-wide">Safely Arrived</h3>
            <p className="text-sm text-slate-400 mt-2 font-body">{journey.to_name}</p>

            <div className="grid grid-cols-3 gap-3 mt-5">
              <TripStat label="Distance" value={`${journey.distance_km}km`} />
              <TripStat label="Safety" value="100%" />
              <TripStat label="Alerts" value={events.filter((e) => e.severity === "danger").length} />
            </div>

            <div className="rounded-2xl bg-[#090d16] border border-white/10 p-4 mt-4 text-left">
              <p className="text-xs text-slate-300 uppercase mb-2.5 flex items-center gap-2 font-bold tracking-wider">
                <Radio size={12} className="text-emerald-400" /> Auto-Notified Family
              </p>
              {(arrived?.notified || []).length === 0 && <p className="text-xs text-slate-400">No contacts configured</p>}
              {(arrived?.notified || []).map((c, ci) => (
                <div key={`${c.phone}-${ci}`} className="flex items-center gap-2 text-xs text-emerald-300 font-medium">
                  <CheckCircle2 size={14} /> {c.name} · {c.phone}
                </div>
              ))}
            </div>

            <button
              data-testid="close-journey-button"
              onClick={() => navigate("/app")}
              className="mt-5 w-full py-3.5 rounded-xl bg-[#e60012] hover:bg-[#ff1a2e] text-white font-display font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(230,0,18,0.35)] cursor-pointer"
            >
              <Home size={16} /> Close Safe Journey
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
    <div className="rounded-2xl border border-white/10 bg-[#0c111d] p-5 shadow-xl">
      <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center" style={{ color }}>
        <Icon size={16} />
      </div>
      <p className="font-display font-bold text-2xl text-white mt-3">
        {value}<span className="text-xs text-slate-400 ml-1.5 font-normal">{unit}</span>
      </p>
      <p className="text-xs text-slate-400 uppercase tracking-wide mt-0.5 font-semibold">{label}</p>
    </div>
  );
}

function SimBtn({ icon: Icon, label, color, onClick, testid }) {
  return (
    <button
      data-testid={testid}
      onClick={onClick}
      className="w-full flex items-center gap-3 rounded-xl border border-white/10 bg-[#090d16] hover:bg-[#121929] hover:border-white/20 px-4 py-3 text-left transition-all cursor-pointer"
    >
      <Icon size={16} style={{ color }} className="shrink-0" />
      <span className="text-xs text-white font-medium flex-1">{label}</span>
    </button>
  );
}

function ShareBtn({ icon: Icon, label, onClick, testid }) {
  return (
    <button
      data-testid={testid}
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 rounded-xl border border-white/10 bg-[#090d16] hover:bg-[#121929] hover:border-[#e60012]/40 py-3 transition-all cursor-pointer"
    >
      <Icon size={16} className="text-slate-300" />
      <span className="text-xs text-slate-300 font-medium">{label}</span>
    </button>
  );
}

function PayRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <Icon size={14} className="text-slate-500 shrink-0" />
      <span className="text-slate-400 text-xs w-24 font-medium">{label}</span>
      <span className="text-white text-xs truncate flex-1 font-semibold">{value}</span>
    </div>
  );
}

function TripStat({ label, value }) {
  return (
    <div className="rounded-xl bg-[#090d16] border border-white/10 p-3">
      <p className="font-display font-bold text-base text-white">{value}</p>
      <p className="text-[10px] text-slate-400 uppercase tracking-wide mt-0.5 font-semibold">{label}</p>
    </div>
  );
}
