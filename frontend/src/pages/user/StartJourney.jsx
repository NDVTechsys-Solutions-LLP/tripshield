import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { toast } from "sonner";
import LeafletMap from "@/components/LeafletMap";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  MapPin, Navigation, Search, Route as RouteIcon, Clock, Gauge, ShieldCheck,
  CheckCircle2, XCircle, ArrowRight, Loader2, Rocket, FileCheck,
  Radio, Crosshair, Share2, MessageSquare, Send, Mail,
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
    const energyOk = (vehicle?.energy_level || 0) >= 20 && vehicle?.bt_connected;
    const rc = docs.find((d) => d.doc_type === "Vehicle RC");
    const ins = docs.find((d) => d.doc_type === "Vehicle Insurance");
    const checks = [
      { label: "Bluetooth telemetry connected", ok: !!vehicle?.bt_connected },
      { label: `Energy level ≥ 20% (${vehicle?.energy_level || 0}%)`, ok: energyOk },
      { label: "Vehicle RC in wallet", ok: !!rc },
      { label: "Insurance active", ok: !!ins },
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
    <div className="hsj-fade-up">
      <p className="font-mono text-xs tracking-widest text-red-400/90 uppercase mb-2">
        Journey Planner
      </p>
      <h1 className="font-display font-extrabold text-white text-3xl sm:text-4xl uppercase tracking-tight">
        Start Safe Journey
      </h1>

      <div className="grid lg:grid-cols-2 gap-6 mt-8">
        <div className="space-y-5">
          {/* Mode selector */}
          <div className="grid grid-cols-2 gap-2">
            <button data-testid="journey-mode-live" onClick={() => setMode("live")}
              className={`rounded-lg border px-3 py-3 text-left transition-colors ${mode === "live" ? "border-[#e60012] bg-[#e60012]/10" : "border-white/10 hover:border-white/25"}`}>
              <span className="flex items-center gap-2 text-white font-display font-bold text-sm"><Radio size={15} className="text-[#e60012]" /> Live Tracking</span>
              <span className="text-[11px] text-slate-500 font-mono">Current location + simulation</span>
            </button>
            <button data-testid="journey-mode-manual" onClick={() => setMode("manual")}
              className={`rounded-lg border px-3 py-3 text-left transition-colors ${mode === "manual" ? "border-[#e60012] bg-[#e60012]/10" : "border-white/10 hover:border-white/25"}`}>
              <span className="flex items-center gap-2 text-white font-display font-bold text-sm"><RouteIcon size={15} className="text-[#3b82f6]" /> Point A → B</span>
              <span className="text-[11px] text-slate-500 font-mono">Enter start &amp; destination</span>
            </button>
          </div>

          {mode === "manual" ? (
            <>
              <LocationPicker label="Point A · Origin" color="#10b981" value={from} onChange={setFrom} testid="point-a" />
              <LocationPicker label="Point B · Destination" color="#3b82f6" value={to} onChange={setTo} testid="point-b" />
            </>
          ) : (
            <div className="rounded-xl border border-white/10 bg-[#0f141f] p-5 space-y-4">
              <p className="font-mono text-xs tracking-widest uppercase text-[#10b981]">Live Origin</p>
              {from ? (
                <div className="flex items-center gap-3 rounded-lg bg-[#0b0f17] border border-white/10 px-4 py-3">
                  <Crosshair size={16} className="text-[#10b981]" />
                  <span className="flex-1 text-sm text-white truncate">{from.name}</span>
                  <button data-testid="live-reset" onClick={() => { setFrom(null); setTo(null); setRouteData(null); }} className="text-slate-500 text-xs hover:text-white">Reset</button>
                </div>
              ) : (
                <button data-testid="detect-location-button" onClick={detectLocation} disabled={gpsBusy}
                  className="w-full flex items-center justify-center gap-2 rounded-lg border border-[#10b981]/40 bg-[#10b981]/10 px-4 py-3 text-sm text-emerald-300 hover:bg-[#10b981]/20">
                  {gpsBusy ? <Loader2 className="animate-spin" size={16} /> : <Crosshair size={16} />} Detect my current location
                </button>
              )}
              <div>
                <p className="font-mono text-[10px] text-slate-500 uppercase mb-2">Simulation distance</p>
                <div className="flex gap-2">
                  {[15, 18, 20].map((km) => (
                    <button key={km} data-testid={`sim-km-${km}`} onClick={() => setSimKm(km)}
                      className={`flex-1 rounded-lg border py-2 text-sm transition-colors ${simKm === km ? "border-[#e60012] bg-[#e60012]/10 text-white" : "border-white/10 text-slate-400"}`}>
                      {km} km
                    </button>
                  ))}
                </div>
                {from && (
                  <button data-testid="generate-sim-route" onClick={generateSim}
                    className="mt-3 w-full rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 py-2.5 text-sm flex items-center justify-center gap-2">
                    <Navigation size={15} /> Generate ~{simKm} km simulated route
                  </button>
                )}
              </div>
            </div>
          )}

          {loading && (
            <div className="flex items-center gap-2 text-slate-400 font-mono text-sm">
              <Loader2 className="animate-spin" size={16} /> Calculating optimal route…
            </div>
          )}

          {routeData && (
            <div className="grid grid-cols-2 gap-3" data-testid="route-summary">
              <Metric icon={RouteIcon} label="Distance" value={`${routeData.distance_km} km`} />
              <Metric icon={Clock} label="ETA" value={`${routeData.duration_min} min`} />
            </div>
          )}

          {/* Share channel */}
          <div className="rounded-xl border border-white/10 bg-[#0f141f] p-4">
            <p className="font-mono text-[10px] text-slate-500 uppercase mb-2 flex items-center gap-2">
              <Share2 size={12} /> Auto-share live link via
            </p>
            <div className="grid grid-cols-3 gap-2">
              {CHANNELS.map((c) => (
                <button key={c.key} data-testid={`share-channel-${c.key}`} onClick={() => setChannel(c.key)}
                  className={`flex items-center justify-center gap-1.5 rounded-lg border py-2 text-xs transition-colors ${channel === c.key ? "border-[#e60012] bg-[#e60012]/10 text-white" : "border-white/10 text-slate-400"}`}>
                  <c.icon size={13} /> {c.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              data-testid="run-precheck-button"
              onClick={runPrecheck}
              disabled={!routeData}
              className="flex-1 py-3.5 rounded-lg border border-white/15 hover:border-[#e60012]/50 disabled:opacity-40 text-white font-display font-bold uppercase tracking-wide text-sm transition-colors flex items-center justify-center gap-2"
            >
              <ShieldCheck size={18} /> Run Pre-Check
            </button>
            <button
              data-testid="journey-start-button"
              onClick={launch}
              disabled={!routeData || starting}
              className="flex-1 py-3.5 rounded-lg bg-[#e60012] hover:bg-[#cc0010] disabled:opacity-40 text-white font-display font-bold uppercase tracking-wide text-sm transition-colors flex items-center justify-center gap-2"
            >
              {starting ? <Loader2 className="animate-spin" size={18} /> : <Rocket size={18} />}
              {starting ? "Launching…" : "Start Journey"}
            </button>
          </div>
          <p className="font-mono text-[11px] text-slate-600">
            Pre-check is optional — you can start directly.
          </p>
        </div>

        <div className="rounded-xl border border-white/10 overflow-hidden h-[380px] lg:h-auto min-h-[380px]">
          <LeafletMap
            className="w-full h-full min-h-[380px]"
            route={routeData?.coordinates || []}
            from={from ? [from.lat, from.lng] : null}
            to={to ? [to.lat, to.lng] : null}
          />
        </div>
      </div>

      <Dialog open={precheckOpen} onOpenChange={setPrecheckOpen}>
        <DialogContent className="bg-[#0f141f] border-white/10 text-white backdrop-blur-md">
          <DialogHeader>
            <DialogTitle className="font-display uppercase tracking-wide flex items-center gap-2">
              <FileCheck className="text-[#e60012]" size={20} /> Readiness Pre-Check
            </DialogTitle>
            <DialogDescription className="text-slate-500 text-sm">
              Optional safety verification before you start the journey.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 mt-2">
            {precheck?.checks.map((c) => (
              <div key={c.label} className="flex items-center gap-3 rounded-lg bg-[#0b0f17] border border-white/5 px-4 py-3">
                {c.ok ? <CheckCircle2 className="text-emerald-400" size={18} /> : <XCircle className="text-[#ef4444]" size={18} />}
                <span className={`text-sm ${c.ok ? "text-slate-300" : "text-white"}`}>{c.label}</span>
              </div>
            ))}
          </div>
          <div className={`rounded-lg px-4 py-3 mt-2 font-mono text-sm ${
            precheck?.pass ? "bg-emerald-500/15 text-emerald-300" : "bg-amber-500/15 text-amber-300"
          }`}>
            {precheck?.pass ? "All systems go. Safe to ride." : "Some checks failed — you may still proceed with caution."}
          </div>
          <button
            data-testid="precheck-proceed-button"
            onClick={() => { setPrecheckOpen(false); launch(); }}
            className="w-full py-3 rounded-lg bg-[#e60012] hover:bg-[#cc0010] text-white font-display font-bold uppercase tracking-wide transition-colors flex items-center justify-center gap-2"
          >
            Proceed & Start <ArrowRight size={18} />
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
    <div className="rounded-xl border border-white/10 bg-[#0f141f] p-5">
      <p className="font-mono text-xs tracking-widest uppercase mb-3" style={{ color }}>{label}</p>
      {value ? (
        <div className="flex items-center gap-3 rounded-lg bg-[#0b0f17] border border-white/10 px-4 py-3">
          <MapPin size={16} style={{ color }} />
          <span className="flex-1 text-sm text-white truncate">{value.name}</span>
          <button data-testid={`${testid}-clear`} onClick={() => onChange(null)} className="text-slate-500 text-xs hover:text-white">Change</button>
        </div>
      ) : (
        <>
          <div className="flex gap-2">
            <input
              data-testid={`${testid}-search-input`}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && search()}
              placeholder="Search location…"
              className="flex-1 rounded-lg bg-[#0b0f17] border border-white/10 px-4 py-2.5 text-white placeholder:text-slate-600 focus:border-[#e60012] focus:outline-none text-sm"
            />
            <button data-testid={`${testid}-search-button`} onClick={search} className="px-4 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300">
              {searching ? <Loader2 className="animate-spin" size={16} /> : <Search size={16} />}
            </button>
          </div>
          {results.length > 0 && (
            <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
              {results.map((r, i) => (
                <button key={i} onClick={() => { onChange(r); setResults([]); setQ(""); }}
                  className="w-full text-left text-xs text-slate-400 hover:text-white hover:bg-white/5 rounded px-3 py-2 truncate">
                  {r.name}
                </button>
              ))}
            </div>
          )}
          <p className="font-mono text-[10px] text-slate-600 uppercase mt-3 mb-2">Quick presets</p>
          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map((p) => (
              <button key={p.name} data-testid={`${testid}-preset`} onClick={() => onChange(p)}
                className="rounded-md border border-white/10 px-2.5 py-1 text-[11px] text-slate-400 hover:border-[#e60012]/50 hover:text-white transition-colors">
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
    <div className="rounded-lg border border-white/10 bg-[#0b0f17] p-4">
      <Icon className="text-[#e60012]" size={16} />
      <p className="font-mono font-bold text-xl text-white mt-2">{value}</p>
      <p className="font-mono text-[10px] text-slate-600 uppercase tracking-wide">{label}</p>
    </div>
  );
}
