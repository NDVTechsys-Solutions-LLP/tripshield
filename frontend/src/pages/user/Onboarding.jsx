import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { toast } from "sonner";
import { Bike, Car, ArrowRight, CheckCircle2, Zap, Fuel, Search, ChevronDown } from "lucide-react";
import { OEM_NAMES, modelsFor } from "@/lib/vehicleData";

export default function Onboarding() {
  const navigate = useNavigate();
  const [type, setType] = useState("2w");
  const [form, setForm] = useState({
    make: "", model: "", reg_no: "", vin: "", color: "", year: "", fuel_type: "petrol",
  });
  const [saving, setSaving] = useState(false);
  const [existing, setExisting] = useState(false);
  const [oemOpen, setOemOpen] = useState(false);
  const [oemQuery, setOemQuery] = useState("");
  const [modelQuery, setModelQuery] = useState("");

  useEffect(() => {
    api.get("/vehicle").then((r) => {
      if (r.data) {
        setType(r.data.type);
        setForm({
          make: r.data.make || "", model: r.data.model, reg_no: r.data.reg_no, vin: r.data.vin || "",
          color: r.data.color || "", year: r.data.year || "", fuel_type: r.data.fuel_type || "petrol",
        });
        setExisting(true);
      }
    });
  }, []);

  const upd = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const oemList = useMemo(() => {
    const all = OEM_NAMES[type] || [];
    if (!oemQuery.trim()) return all;
    return all.filter((o) => o.toLowerCase().includes(oemQuery.toLowerCase()));
  }, [type, oemQuery]);

  const models = useMemo(() => {
    const all = modelsFor(type, form.make);
    if (!modelQuery.trim()) return all;
    return all.filter((m) => m.toLowerCase().includes(modelQuery.toLowerCase()));
  }, [type, form.make, modelQuery]);

  const changeType = (t) => {
    setType(t);
    upd("make", "");
    upd("model", "");
    setOemQuery("");
    setModelQuery("");
  };

  const pickOem = (make) => {
    setForm((f) => ({ ...f, make, model: "" }));
    setOemOpen(false);
    setOemQuery("");
    setModelQuery("");
  };

  const save = async () => {
    if (!form.make) {
      toast.error("Please select a manufacturer (OEM)");
      return;
    }
    if (!form.model || !form.reg_no) {
      toast.error("Model and registration number are required");
      return;
    }
    setSaving(true);
    try {
      await api.post("/vehicle", { ...form, type });
      toast.success("Vehicle registered successfully");
      navigate("/app/contacts");
    } catch {
      toast.error("Could not save vehicle");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="hsj-fade-up max-w-4xl space-y-8">
      {/* Header */}
      <div>
        <p className="text-xs font-bold tracking-wider text-[#e60012] uppercase mb-2">
          Vehicle Telematics Setup
        </p>
        <h1 className="font-display font-extrabold text-white text-3xl sm:text-4xl uppercase tracking-tight">
          {existing ? "My Connected Vehicle" : "Register Your Vehicle"}
        </h1>
        <p className="text-slate-400 mt-2 font-body text-sm sm:text-base">
          Connect your 2-wheeler or 4-wheeler to unlock live telemetry, turn-by-turn routing, and autonomous emergency escalation.
        </p>
      </div>

      {/* Vehicle Type Switcher */}
      <div className="grid sm:grid-cols-2 gap-4">
        {[
          { key: "2w", icon: Bike, label: "Two-Wheeler", sub: "Motorcycles · Scooters · Electric Bikes" },
          { key: "4w", icon: Car, label: "Four-Wheeler", sub: "Sedans · SUVs · Passenger Cars" },
        ].map((t) => (
          <button
            key={t.key}
            type="button"
            data-testid={`vehicle-type-${t.key === "2w" ? "2wheeler" : "4wheeler"}-card`}
            onClick={() => changeType(t.key)}
            className={`rounded-2xl border p-6 text-left transition-all cursor-pointer shadow-xl ${
              type === t.key
                ? "border-[#e60012] bg-[#0c111d] shadow-[0_0_25px_rgba(230,0,18,0.15)] ring-1 ring-[#e60012]/40"
                : "border-white/10 bg-[#0c111d] hover:border-white/20"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                <t.icon className={type === t.key ? "text-[#e60012]" : "text-slate-400"} size={26} />
              </div>
              {type === t.key && <CheckCircle2 className="text-[#e60012]" size={20} />}
            </div>
            <p className="font-display font-bold text-white text-lg mt-4">{t.label}</p>
            <p className="text-xs text-slate-400 font-medium mt-1">{t.sub}</p>
          </button>
        ))}
      </div>

      {/* Form Container */}
      <div className="rounded-2xl border border-white/10 bg-[#0c111d] p-6 sm:p-8 space-y-6 shadow-xl">
        {/* OEM / Manufacturer */}
        <Field label="Vehicle Manufacturer">
          <div className="relative">
            <button
              type="button"
              data-testid="oem-select-trigger"
              onClick={() => setOemOpen((o) => !o)}
              className={`w-full flex items-center justify-between rounded-xl bg-[#090d16] border px-4 py-3 text-left transition-all cursor-pointer ${
                oemOpen ? "border-[#e60012] ring-1 ring-[#e60012]/40" : "border-white/10 hover:border-white/25"
              }`}
            >
              <span className={form.make ? "text-white font-medium" : "text-slate-500 font-body text-sm"}>
                {form.make || "Select brand (e.g. Honda, Tata, TVS, Hyundai…)"}
              </span>
              <ChevronDown size={18} className={`text-slate-400 transition-transform ${oemOpen ? "rotate-180" : ""}`} />
            </button>

            {oemOpen && (
              <div
                data-testid="oem-dropdown"
                className="absolute z-20 mt-2 w-full rounded-2xl border border-white/15 bg-[#090d16] shadow-2xl shadow-black/80 overflow-hidden backdrop-blur-xl"
              >
                <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3 bg-black/30">
                  <Search size={16} className="text-slate-500" />
                  <input
                    autoFocus
                    data-testid="oem-search-input"
                    value={oemQuery}
                    onChange={(e) => setOemQuery(e.target.value)}
                    placeholder="Search brand…"
                    className="w-full bg-transparent text-sm text-white placeholder:text-slate-600 focus:outline-none font-body"
                  />
                </div>
                <div className="max-h-60 overflow-y-auto py-1 hsj-scroll">
                  {oemList.length === 0 && (
                    <p className="px-4 py-3 text-sm text-slate-500">No manufacturers found</p>
                  )}
                  {oemList.map((o) => (
                    <button
                      key={o}
                      type="button"
                      data-testid="oem-option"
                      onClick={() => pickOem(o)}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors cursor-pointer ${
                        form.make === o
                          ? "bg-[#e60012]/15 text-white font-semibold"
                          : "text-slate-300 hover:bg-white/5"
                      }`}
                    >
                      {o}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Field>

        {/* Model — filtered by OEM */}
        <Field label="Vehicle Model">
          {!form.make ? (
            <p className="text-xs text-slate-400 rounded-xl border border-dashed border-white/10 px-4 py-3 font-medium">
              Select a brand above to load supported OEM models
            </p>
          ) : (
            <>
              <div className="relative mb-3">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  data-testid="model-search-input"
                  value={modelQuery}
                  onChange={(e) => setModelQuery(e.target.value)}
                  placeholder="Filter models…"
                  className="w-full rounded-xl bg-[#090d16] border border-white/10 pl-9 pr-4 py-2 text-sm text-white placeholder:text-slate-600 focus:border-[#e60012] focus:outline-none transition-all font-body"
                />
              </div>
              {models.length === 0 ? (
                <p className="text-xs text-slate-400 px-1 font-medium">No models match "{modelQuery}"</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {models.map((m) => (
                    <button
                      key={m}
                      type="button"
                      data-testid="model-option"
                      onClick={() => upd("model", m)}
                      className={`rounded-xl border px-3 py-2 text-xs font-medium transition-all cursor-pointer ${
                        form.model === m
                          ? "border-[#e60012] bg-[#e60012]/15 text-white font-semibold shadow-[0_0_12px_rgba(230,0,18,0.2)]"
                          : "border-white/10 bg-[#090d16] text-slate-400 hover:text-white hover:border-white/25"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </Field>

        <div className="grid sm:grid-cols-2 gap-5">
          <Field label="Registration Number">
            <Input testid="input-reg-no" value={form.reg_no} onChange={(v) => upd("reg_no", v.toUpperCase())} placeholder="DL 3C AB 1234" />
          </Field>
          <Field label="Chassis / VIN">
            <Input testid="input-vin" value={form.vin} onChange={(v) => upd("vin", v)} placeholder="ME4JC..." />
          </Field>
          <Field label="Color">
            <Input testid="input-color" value={form.color} onChange={(v) => upd("color", v)} placeholder="Metallic Obsidian Black" />
          </Field>
          <Field label="Year of Manufacture">
            <Input testid="input-year" value={form.year} onChange={(v) => upd("year", v)} placeholder="2024" />
          </Field>
        </div>

        <Field label="Powertrain Type">
          <div className="flex gap-3">
            {[
              { k: "petrol", icon: Fuel, label: "Petrol / Diesel (ICE)" },
              { k: "electric", icon: Zap, label: "Electric (EV)" },
            ].map((p) => (
              <button
                key={p.k}
                type="button"
                data-testid={`fuel-${p.k}`}
                onClick={() => upd("fuel_type", p.k)}
                className={`flex-1 flex items-center justify-center gap-2 rounded-xl border py-3 text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                  form.fuel_type === p.k
                    ? "border-[#e60012] bg-[#e60012]/15 text-white font-semibold shadow-[0_0_12px_rgba(230,0,18,0.2)]"
                    : "border-white/10 bg-[#090d16] text-slate-400 hover:text-white hover:border-white/25"
                }`}
              >
                <p.icon size={16} /> {p.label}
              </button>
            ))}
          </div>
        </Field>
      </div>

      <div className="flex items-center gap-4">
        <button
          data-testid="vehicle-save-button"
          onClick={save}
          disabled={saving}
          className="px-8 py-3.5 rounded-xl bg-[#e60012] hover:bg-[#cc0010] disabled:opacity-60 text-white font-display font-bold uppercase tracking-wider text-xs transition-all shadow-[0_0_20px_rgba(230,0,18,0.35)] flex items-center justify-center gap-2 cursor-pointer"
        >
          {saving ? "Saving…" : "Save Vehicle & Continue"} <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="text-xs font-bold tracking-wider text-slate-400 uppercase block mb-2">
        {label}
      </label>
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder, testid }) {
  return (
    <input
      data-testid={testid}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-xl bg-[#090d16] border border-white/10 px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-[#e60012] focus:outline-none transition-all font-body"
    />
  );
}
