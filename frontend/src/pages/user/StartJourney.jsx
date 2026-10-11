import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { toast } from "sonner";
import LeafletMap from "@/components/LeafletMap";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  MapPin, Navigation, Search, Route as RouteIcon, Clock, ShieldCheck,
  CheckCircle2, XCircle, ArrowRight, Loader2, Rocket, FileCheck,
  Radio, Crosshair, Share2, MessageSquare, Send, Mail, Sparkles,
} from "lucide-react";

const CHANNELS = [
  { key: "sms", label: "SMS", icon: MessageSquare },
  { key: "whatsapp", label: "WhatsApp", icon: Send },
  { key: "email", label: "Email", icon: Mail },
];

const PRESETS = [
  { name: "Connaught Place, New Delhi", lat: 28.6315, lng: 77.2167 },
  { name: "Cyber City, Gurugram", lat: 28.4949, lng: 77.0895 },
  { name: "Noida Sector 18", lat: 28.5706, lng: 77.3211 },
  { name: "Bandra, Mumbai", lat: 19.0596, lng: 72.8295 },
  { name: "Koramangala, Bengaluru", lat: 12.9352, lng: 77.6245 },
  { name: "HITEC City, Hyderabad", lat: 17.4435, lng: 78.3772 },
  { name: "Jaipur City Center", lat: 26.9124, lng: 75.7873 },
  { name: "Chandigarh Sector 17", lat: 30.7415, lng: 76.7681 },
];

export default function StartJourney() {
  const navigate = useNavigate();
  const [from, setFrom] = useState(null);
  const [to, setTo] = useState(null);
  const [routeData, setRouteData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [vehicle, setVehicle] = useState(null);
  const [docs, setDocs] = useState([]);
  const [precheckOpen, setPrecheckOpen] = useState(false);
  const [precheck, setPrecheck] = useState(null);
  const [starting, setStarting] = useState(false);
  const [mode, setMode] = useState("live");
  const [simKm, setSimKm] = useState(18);
  const [channel, setChannel] = useState("sms");
  const [gpsBusy, setGpsBusy] = useState(false);

  useEffect(() => {
    api.get("/vehicle").then((r) => setVehicle(r.data));
    api.get("/documents").then((r) => setDocs(r.data));
    api.get("/settings").then((r) => setChannel(r.data.channel || "sms")).catch(() => {});
  }, []);

  const detectLocation = () => {
    if (!navigator.geolocation) { toast.error("Geolocation not supported"); return; }
    setGpsBusy(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFrom({ name: "Current location", lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGpsBusy(false);
        toast.success("Live location captured");
      },
      () => {
        setGpsBusy(false);
        setFrom({ name: "Current location (approx)", lat: 28.6139, lng: 77.209 });
        toast.info("Using approximate location (New Delhi)");
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const generateSim = () => {
    if (!from) return;
    const dLat = (simKm / 111) * 0.72;
    const dLng = (simKm / (111 * Math.cos((from.lat * Math.PI) / 180))) * 0.72;
    setTo({ name: `Simulation destination (~${simKm} km)`, lat: from.lat + dLat, lng: from.lng + dLng });
  };

  useEffect(() => {
    if (from && to) computeRoute();
    // eslint-disable-next-line
  }, [from, to]);

  const computeRoute = async () => {
    setLoading(true);
    try {
      const r = await api.post("/geo/route", {
        from_lat: from.lat, from_lng: from.lng, to_lat: to.lat, to_lng: to.lng,
      });
      setRouteData(r.data);
    } catch { toast.error("Route calc failed"); }
    finally { setLoading(false); }
  };

  const runPrecheck = () => {
    const checks = [
      { label: "Vehicle registered", ok: !!vehicle },
      { label: "Emergency contacts set", ok: true },
      { label: "Route & ETA locked", ok: !!routeData },
    ];
    setPrecheck({ checks, pass: checks.every((c) => c.ok) });
    setPrecheckOpen(true);
  };

  const launch = async () => {
    if (!routeData) { toast.error("Set both points first"); return; }
    setStarting(true);
    try {
      const r = await api.post("/journeys", {
        from_name: from.name, from_coords: [from.lat, from.lng],
        to_name: to.name, to_coords: [to.lat, to.lng],
        distance_km: routeData.distance_km, eta_min: routeData.duration_min,
        route: routeData.coordinates, precheck: precheck || null,
        mode, channel,
      });
      toast.success("Safe Journey launched");
      navigate("/app/journey/live", { state: { journey: r.data } });
    } catch { toast.error("Could not start journey"); setStarting(false); }
  };

  return (
    <div className="hsj-fade-up max-w-6xl space-y-8">
      {/* Header */}
      <div>
        <p className="text-xs font-bold tracking-wider text-[#e60012] uppercase mb-2">
          Route Planner &amp; Telematics
        </p>
        <h1 className="font-display font-extrabold text-white text-3xl sm:text-4xl uppercase tracking-tight">
          Start Safe Journey
        </h1>
        <p className="text-slate-400 mt-2 font-body text-sm sm:text-base max-w-2xl">
          Set your origin and destination to activate live route tracking, family link sharing, and instant emergency response.
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Form Column */}
        <div className="lg:col-span-6 space-y-5">
          {/* Mode selector */}
          <div className="grid grid-cols-2 gap-3">
            <button
              data-testid="journey-mode-live"
              onClick={() => { setMode("live"); setFrom(null); setTo(null); setRouteData(null); }}
              className={`rounded-2xl border p-4 text-left transition-all cursor-pointer shadow-lg ${
                mode === "live"
                  ? "border-[#e60012] bg-[#0c111d] ring-1 ring-[#e60012]/40 shadow-[0_0_20px_rgba(230,0,18,0.15)]"
                  : "border-white/10 bg-[#0c111d] hover:border-white/20"
              }`}
            >
              <div className="flex items-center gap-2 text-white font-display font-bold text-sm">
                <Radio size={16} className="text-[#e60012]" />
                <span>Live GPS Tracking</span>
              </div>
              <p className="text-xs text-slate-400 font-medium mt-1">Current location + auto simulation</p>
            </button>

            <button
              data-testid="journey-mode-manual"
              onClick={() => { setMode("manual"); setFrom(null); setTo(null); setRouteData(null); }}
              className={`rounded-2xl border p-4 text-left transition-all cursor-pointer shadow-lg ${
                mode === "manual"
                  ? "border-[#e60012] bg-[#0c111d] ring-1 ring-[#e60012]/40 shadow-[0_0_20px_rgba(230,0,18,0.15)]"
                  : "border-white/10 bg-[#0c111d] hover:border-white/20"
              }`}
            >
              <div className="flex items-center gap-2 text-white font-display font-bold text-sm">
                <RouteIcon size={16} className="text-[#3b82f6]" />
                <span>Point A → Point B</span>
              </div>
              <p className="text-xs text-slate-400 font-medium mt-1">Manual start &amp; destination picker</p>
            </button>
          </div>

          {mode === "manual" ? (
            <div className="space-y-4">
              <LocationPicker label="Point A · Origin" color="#e60012" value={from} onChange={setFrom} testid="point-a" />
              <LocationPicker label="Point B · Destination" color="#3b82f6" value={to} onChange={setTo} testid="point-b" />
            </div>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-[#0c111d] p-6 shadow-xl space-y-5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold tracking-wider uppercase text-slate-300">
                  Live Origin Detection
                </p>
                {from && (
                  <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                    Location Locked
                  </span>
                )}
              </div>

              {from ? (
                <div className="flex items-center gap-3 rounded-xl bg-[#090d16] border border-white/10 px-4 py-3.5">
                  <Crosshair size={18} className="text-[#e60012] shrink-0" />
                  <span className="flex-1 text-sm text-white truncate font-medium">{from.name}</span>
                  <button
                    data-testid="live-reset"
                    onClick={() => { setFrom(null); setTo(null); setRouteData(null); }}
                    className="text-slate-400 hover:text-white text-xs font-medium px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    Reset
                  </button>
                </div>
              ) : (
                <button
                  data-testid="detect-location-button"
                  onClick={detectLocation}
                  disabled={gpsBusy}
                  className="w-full flex items-center justify-center gap-2.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 px-4 py-3.5 text-sm text-white font-medium transition-all cursor-pointer"
                >
                  {gpsBusy ? <Loader2 className="animate-spin text-[#e60012]" size={18} /> : <Crosshair size={18} className="text-[#e60012]" />}
                  <span>Detect my current location</span>
                </button>
              )}

              <div className="pt-2 border-t border-white/5">
                <p className="text-xs font-bold tracking-wider text-slate-400 uppercase mb-2.5">
                  Simulation distance
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {[15, 18, 20].map((km) => (
                    <button
                      key={km}
                      data-testid={`sim-km-${km}`}
                      onClick={() => setSimKm(km)}
                      className={`rounded-xl border py-2.5 text-xs font-semibold transition-all cursor-pointer ${
                        simKm === km
                          ? "border-[#e60012] bg-[#e60012]/15 text-white shadow-sm"
                          : "border-white/10 bg-[#090d16] text-slate-400 hover:text-white hover:border-white/20"
                      }`}
                    >
                      {km} km
                    </button>
                  ))}
                </div>

                {from && (
                  <button
                    data-testid="generate-sim-route"
                    onClick={generateSim}
                    className="mt-4 w-full rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white py-3 text-sm font-medium flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Navigation size={16} className="text-[#e60012]" />
                    <span>Generate ~{simKm} km route simulation</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {loading && (
            <div className="flex items-center gap-2.5 text-slate-300 text-xs font-medium p-3 rounded-xl bg-white/5 border border-white/10">
              <Loader2 className="animate-spin text-[#e60012]" size={16} />
              <span>Calculating optimal route telematics…</span>
            </div>
          )}

          {routeData && (
            <div className="grid grid-cols-2 gap-3" data-testid="route-summary">
              <Metric icon={RouteIcon} label="Total Distance" value={`${routeData.distance_km} km`} />
              <Metric icon={Clock} label="Estimated Time" value={`${routeData.duration_min} min`} />
            </div>
          )}

          {/* Share channel */}
          <div className="rounded-2xl border border-white/10 bg-[#0c111d] p-6 shadow-xl">
            <p className="text-xs font-bold tracking-wider text-slate-400 uppercase mb-3 flex items-center gap-2">
              <Share2 size={14} className="text-[#e60012]" /> Auto-share live link via
            </p>
            <div className="grid grid-cols-3 gap-2.5">
              {CHANNELS.map((c) => (
                <button
                  key={c.key}
                  data-testid={`share-channel-${c.key}`}
                  onClick={() => setChannel(c.key)}
                  className={`flex items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                    channel === c.key
                      ? "border-[#e60012] bg-[#e60012]/15 text-white font-semibold"
                      : "border-white/10 bg-[#090d16] text-slate-400 hover:text-white hover:border-white/20"
                  }`}
                >
                  <c.icon size={14} />
                  <span>{c.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              data-testid="run-precheck-button"
              onClick={runPrecheck}
              disabled={!routeData}
              className="flex-1 py-3.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 hover:border-white/25 disabled:opacity-40 text-white font-display font-bold uppercase tracking-wider text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShieldCheck size={16} />
              <span>Run Pre-Check</span>
            </button>
            <button
              data-testid="journey-start-button"
              onClick={launch}
              disabled={!routeData || starting}
              className="flex-1 py-3.5 rounded-xl bg-[#e60012] hover:bg-[#cc0010] disabled:opacity-40 text-white font-display font-bold uppercase tracking-wider text-xs transition-all shadow-[0_0_20px_rgba(230,0,18,0.35)] flex items-center justify-center gap-2 cursor-pointer"
            >
              {starting ? <Loader2 className="animate-spin" size={16} /> : <Rocket size={16} />}
              <span>{starting ? "Launching…" : "Start Journey"}</span>
            </button>
          </div>
          <p className="text-xs text-slate-500 text-center font-medium">
            Pre-check is optional — you can launch the journey directly.
          </p>
        </div>

        {/* Right Map Column */}
        <div className="lg:col-span-6 rounded-2xl border border-white/10 bg-[#0c111d] overflow-hidden shadow-2xl h-[460px] lg:h-[620px] min-h-[460px]">
          <LeafletMap
            className="w-full h-full min-h-[460px]"
            route={routeData?.coordinates || []}
            from={from ? [from.lat, from.lng] : null}
            to={to ? [to.lat, to.lng] : null}
          />
        </div>
      </div>

      {/* Precheck Dialog */}
      <Dialog open={precheckOpen} onOpenChange={setPrecheckOpen}>
        <DialogContent className="bg-[#0c111d]/95 border-white/10 text-white backdrop-blur-2xl rounded-3xl p-6 sm:p-8 max-w-md shadow-2xl">
          <DialogHeader>
            <DialogTitle className="font-display uppercase tracking-wide flex items-center gap-2 text-lg">
              <FileCheck className="text-[#e60012]" size={20} /> Readiness Pre-Check
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-sm font-body mt-1">
              Safety verification of registered devices and contacts before ignition.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2.5 mt-4">
            {precheck?.checks.map((c) => (
              <div key={c.label} className="flex items-center gap-3 rounded-xl bg-[#090d16] border border-white/10 px-4 py-3">
                {c.ok ? <CheckCircle2 className="text-emerald-400 shrink-0" size={18} /> : <XCircle className="text-[#ef4444] shrink-0" size={18} />}
                <span className={`text-sm font-body ${c.ok ? "text-slate-200" : "text-white"}`}>{c.label}</span>
              </div>
            ))}
          </div>

          <div className={`rounded-xl px-4 py-3 mt-3 text-xs font-medium border ${
            precheck?.pass
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
              : "bg-amber-500/10 border-amber-500/20 text-amber-300"
          }`}>
            {precheck?.pass ? "All safety parameters nominal. Safe to ride." : "Some parameters incomplete — you can proceed with caution."}
          </div>

          <button
            data-testid="precheck-proceed-button"
            onClick={() => { setPrecheckOpen(false); launch(); }}
            className="w-full mt-4 py-3.5 rounded-xl bg-[#e60012] hover:bg-[#cc0010] text-white font-display font-bold uppercase tracking-wider text-xs transition-all shadow-[0_0_20px_rgba(230,0,18,0.35)] flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Proceed &amp; Start</span>
            <ArrowRight size={16} />
          </button>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function LocationPicker({ label, color, value, onChange, testid }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const search = async () => {
    if (!q.trim()) return;
    setSearching(true);
    try {
      const r = await api.post("/geo/geocode", { query: q });
      setResults(r.data);
      if (r.data.length === 0) toast.info("No results — try a preset");
    } catch { toast.error("Search failed"); }
    finally { setSearching(false); }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0c111d] p-6 shadow-xl space-y-3.5">
      <p className="text-xs font-bold tracking-wider uppercase text-slate-300">
        {label}
      </p>
      {value ? (
        <div className="flex items-center gap-3 rounded-xl bg-[#090d16] border border-white/10 px-4 py-3.5">
          <MapPin size={18} style={{ color }} className="shrink-0" />
          <span className="flex-1 text-sm text-white truncate font-medium">{value.name}</span>
          <button
            data-testid={`${testid}-clear`}
            onClick={() => onChange(null)}
            className="text-slate-400 hover:text-white text-xs font-medium px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
          >
            Change
          </button>
        </div>
      ) : (
        <>
          <div className="flex gap-2">
            <input
              data-testid={`${testid}-search-input`}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && search()}
              placeholder="Search address or area…"
              className="flex-1 rounded-xl bg-[#090d16] border border-white/10 px-4 py-3 text-white placeholder:text-slate-500 focus:border-[#e60012] focus:outline-none text-sm font-body transition-colors"
            />
            <button
              data-testid={`${testid}-search-button`}
              onClick={search}
              className="px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 transition-colors cursor-pointer flex items-center justify-center"
            >
              {searching ? <Loader2 className="animate-spin text-[#e60012]" size={16} /> : <Search size={16} />}
            </button>
          </div>
          {results.length > 0 && (
            <div className="mt-2 space-y-1 max-h-40 overflow-y-auto hsj-scroll">
              {results.map((r, i) => (
                <button
                  key={i}
                  onClick={() => { onChange(r); setResults([]); setQ(""); }}
                  className="w-full text-left text-xs text-slate-300 hover:text-white hover:bg-white/5 rounded-lg px-3 py-2 truncate transition-colors cursor-pointer"
                >
                  {r.name}
                </button>
              ))}
            </div>
          )}
          <p className="text-[11px] font-bold tracking-wider text-slate-400 uppercase mt-2 mb-1.5">
            Quick presets
          </p>
          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map((p) => (
              <button
                key={p.name}
                data-testid={`${testid}-preset`}
                onClick={() => onChange(p)}
                className="rounded-lg border border-white/10 bg-[#090d16] px-2.5 py-1 text-xs font-medium text-slate-300 hover:border-white/25 hover:text-white transition-all cursor-pointer"
              >
                {p.name.split(",")[0]}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function Metric({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0c111d] p-5 shadow-xl">
      <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[#e60012]">
        <Icon size={16} />
      </div>
      <p className="font-display font-black text-2xl text-white mt-3 tracking-tight">{value}</p>
      <p className="text-xs font-bold tracking-wider text-slate-400 uppercase mt-0.5">{label}</p>
    </div>
  );
}
