import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { toast } from "sonner";
import { Bluetooth, Zap, Fuel, ArrowRight, Radio, Thermometer, Gauge, CircleCheck } from "lucide-react";

export default function BluetoothSync() {
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState(null);
  const [state, setState] = useState("idle"); // idle | scanning | connected
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    api.get("/vehicle").then((r) => {
      if (!r.data) {
        toast.error("Register a vehicle first");
        navigate("/app/onboarding");
        return;
      }
      setVehicle(r.data);
      if (r.data.bt_connected) setState("connected");
    });
  }, [navigate]);

  const connect = async () => {
    setState("scanning");
    setProgress(0);
    const iv = setInterval(() => setProgress((p) => Math.min(p + 8, 95)), 120);
    try {
      const r = await api.post("/vehicle/bluetooth");
      setTimeout(() => {
        clearInterval(iv);
        setProgress(100);
        setVehicle(r.data);
        setState("connected");
        toast.success("Vehicle ECU paired");
      }, 1800);
    } catch {
      clearInterval(iv);
      setState("idle");
      toast.error("Pairing failed");
    }
  };

  const isEV = vehicle?.fuel_type === "electric";
  const energy = vehicle?.energy_level || 0;
  const energyColor = energy > 60 ? "#10b981" : energy > 30 ? "#f59e0b" : "#ef4444";

  return (
    <div className="hsj-fade-up max-w-3xl">
      <p className="font-mono text-xs tracking-widest text-red-400/90 uppercase mb-2">
        Step 2 · Telemetry Sync
      </p>
      <h1 className="font-display font-extrabold text-white text-3xl sm:text-4xl uppercase tracking-tight">
        Bluetooth Pairing
      </h1>
      <p className="text-slate-400 mt-2 font-body">
        {vehicle?.model} · {vehicle?.reg_no} — connect to read live energy &amp; diagnostics.
      </p>

      <div className="rounded-xl border border-white/10 bg-[#0f141f] p-8 mt-8 flex flex-col items-center">
        {/* Radar */}
        <div className="relative w-40 h-40 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-white/10" />
          <div className="absolute inset-4 rounded-full border border-white/10" />
          <div className="absolute inset-8 rounded-full border border-white/10" />
          {state === "scanning" && (
            <div className="absolute inset-0 rounded-full hsj-radar-sweep"
              style={{ background: "conic-gradient(from 0deg, transparent 0deg, rgba(230,0,18,0.35) 60deg, transparent 90deg)" }} />
          )}
          <div className={`relative w-20 h-20 rounded-full flex items-center justify-center ${state === "connected" ? "bg-emerald-500/20" : "bg-[#e60012]/15"} ${state === "scanning" ? "hsj-pulse" : ""}`}>
            {state === "connected" ? (
              <CircleCheck className="text-emerald-400" size={40} />
            ) : (
              <Bluetooth className="text-[#e60012]" size={40} />
            )}
          </div>
        </div>

        <p className="font-mono text-sm tracking-widest uppercase mt-6 mb-1"
          style={{ color: state === "connected" ? "#10b981" : "#94a3b8" }}>
          {state === "idle" && "Ready to pair"}
          {state === "scanning" && `Scanning ECU… ${progress}%`}
          {state === "connected" && `Connected · ${vehicle?.diagnostics?.signal_dbm} dBm`}
        </p>

        {state !== "connected" ? (
          <button
            data-testid="bluetooth-connect-button"
            onClick={connect}
            disabled={state === "scanning"}
            className="mt-4 px-8 py-3.5 rounded-lg bg-[#e60012] hover:bg-[#cc0010] disabled:opacity-60 text-white font-display font-bold uppercase tracking-wide transition-colors flex items-center gap-2"
          >
            <Radio size={18} /> {state === "scanning" ? "Pairing…" : "Connect Bluetooth"}
          </button>
        ) : (
          <span className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-500/15 border border-emerald-500/40 px-4 py-1.5 text-emerald-300 font-mono text-xs tracking-widest uppercase">
            <span className="w-2 h-2 rounded-full bg-emerald-400" /> ECU Live
          </span>
        )}
      </div>

      {state === "connected" && (
        <div className="hsj-fade-up space-y-6 mt-6">
          {/* Energy gauge */}
          <div className="rounded-xl border border-white/10 bg-[#0f141f] p-6" data-testid="energy-readout">
            <div className="flex items-center justify-between mb-3">
              <span className="flex items-center gap-2 font-mono text-xs tracking-widest text-slate-500 uppercase">
                {isEV ? <Zap size={14} /> : <Fuel size={14} />}
                {isEV ? "Battery Charge" : "Fuel Level"}
              </span>
              <span className="font-mono font-bold text-2xl" style={{ color: energyColor }}>
                {energy}%
              </span>
            </div>
            <div className="h-3 rounded-full bg-[#0b0f17] overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: `${energy}%`, background: energyColor }} />
            </div>
            <p className="font-mono text-xs text-slate-500 mt-3">
              Est. range: <span className="text-white">{vehicle?.range_km} km</span> · Health:{" "}
              <span className="text-white capitalize">{vehicle?.health}</span>
            </p>
          </div>

          {/* Diagnostics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Diag icon={Gauge} label="Odometer" value={`${vehicle?.diagnostics?.odometer_km} km`} />
            <Diag icon={Thermometer} label="Temp" value={`${vehicle?.diagnostics?.temperature_c}°C`} />
            <Diag icon={CircleCheck} label="Tyres" value={vehicle?.diagnostics?.tire_pressure} />
            <Diag icon={Radio} label="ECU" value={vehicle?.diagnostics?.ecu_health} />
          </div>

          <button
            data-testid="bluetooth-continue-button"
            onClick={() => navigate("/app/wallet")}
            className="w-full sm:w-auto px-8 py-3.5 rounded-lg bg-[#e60012] hover:bg-[#cc0010] text-white font-display font-bold uppercase tracking-wide transition-colors flex items-center justify-center gap-2"
          >
            Continue to Document Wallet <ArrowRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}

function Diag({ icon: Icon, label, value }) {
  return (
    <div className="rounded-lg border border-white/10 bg-[#0b0f17] p-4">
      <Icon className="text-slate-500" size={16} />
      <p className="font-mono text-xs text-white mt-2 truncate">{value}</p>
      <p className="font-mono text-[10px] text-slate-600 uppercase tracking-wide mt-0.5">{label}</p>
    </div>
  );
}
