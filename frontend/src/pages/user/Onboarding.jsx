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
      toast.success("Vehicle registered");
      navigate("/app/contacts");
    } catch {
      toast.error("Could not save vehicle");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="hsj-fade-up max-w-3xl">
      <p className="font-mono text-xs tracking-widest text-red-400/90 uppercase mb-2">
        Step 1 · Vehicle Onboarding
      </p>
      <h1 className="font-display font-extrabold text-white text-3xl sm:text-4xl uppercase tracking-tight">
        {existing ? "My Vehicle" : "Register your vehicle"}
      </h1>

      {/* Type switch */}
      <div className="grid grid-cols-2 gap-4 mt-8">
        {[
          { key: "2w", icon: Bike, label: "Two-Wheeler", sub: "Bikes · Scooters · EVs" },
          { key: "4w", icon: Car, label: "Four-Wheeler", sub: "Hatchback · Sedan · SUV" },
        ].map((t) => (
          <button
            key={t.key}
            data-testid={`vehicle-type-${t.key === "2w" ? "2wheeler" : "4wheeler"}-card`}
            onClick={() => changeType(t.key)}
            className={`rounded-xl border p-6 text-left transition-all ${
              type === t.key
                ? "border-[#e60012] bg-[#e60012]/10 shadow-lg shadow-[#e60012]/10"
                : "border-white/10 bg-[#0f141f] hover:border-white/25"
            }`}
          >
            <t.icon className={type === t.key ? "text-[#e60012]" : "text-slate-400"} size={34} />
            <p className="font-display font-bold text-white text-lg mt-3">{t.label}</p>
            <p className="text-xs text-slate-500 font-mono mt-1">{t.sub}</p>
            {type === t.key && <CheckCircle2 className="text-[#e60012] mt-3" size={18} />}
          </button>
        ))}
      </div>

      {/* Form */}
      <div className="rounded-xl border border-white/10 bg-[#0f141f] p-6 sm:p-7 mt-6 space-y-5">
        {/* OEM / Manufacturer */}
        <Field label="Manufacturer (OEM)">
          <div className="relative">
            <button
              type="button"
              data-testid="oem-select-trigger"
              onClick={() => setOemOpen((o) => !o)}
              className={`w-full flex items-center justify-between rounded-lg bg-[#0b0f17] border px-4 py-3 text-left transition-colors ${
                oemOpen ? "border-[#e60012]" : "border-white/10 hover:border-white/25"
              }`}
            >
              <span className={form.make ? "text-white" : "text-slate-600"}>
                {form.make || "Select manufacturer"}
              </span>
              <ChevronDown size={18} className={`text-slate-500 transition-transform ${oemOpen ? "rotate-180" : ""}`} />
            </button>

            {oemOpen && (
              <div
                data-testid="oem-dropdown"
                className="absolute z-20 mt-2 w-full rounded-lg border border-white/10 bg-[#111826] shadow-2xl shadow-black/50 overflow-hidden"
              >
                <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2">
                  <Search size={16} className="text-slate-500" />
                  <input
                    autoFocus
                    data-testid="oem-search-input"
                    value={oemQuery}
                    onChange={(e) => setOemQuery(e.target.value)}
                    placeholder="Search brand…"
                    className="w-full bg-transparent text-sm text-white placeholder:text-slate-600 focus:outline-none"
                  />
                </div>
                <div className="max-h-60 overflow-y-auto py-1">
                  {oemList.length === 0 && (
                    <p className="px-4 py-3 text-sm text-slate-500">No manufacturers found</p>
                  )}
                  {oemList.map((o) => (
                    <button
                      key={o}
                      type="button"
                      data-testid="oem-option"
                      onClick={() => pickOem(o)}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                        form.make === o
                          ? "bg-[#e60012]/15 text-white"
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
        <Field label="Model">
          {!form.make ? (
            <p className="text-sm text-slate-600 rounded-lg border border-dashed border-white/10 px-4 py-3">
              Select a manufacturer first to see available models
            </p>
          ) : (
            <>
              <div className="relative mb-3">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  data-testid="model-search-input"
                  value={modelQuery}
                  onChange={(e) => setModelQuery(e.target.value)}
                  placeholder="Search models…"
                  className="w-full rounded-lg bg-[#0b0f17] border border-white/10 pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-[#e60012] focus:outline-none transition-colors"
                />
              </div>
              {models.length === 0 ? (
                <p className="text-sm text-slate-600 px-1">No models match "{modelQuery}"</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {models.map((m) => (
                    <button
                      key={m}
                      data-testid="model-option"
                      onClick={() => upd("model", m)}
                      className={`rounded-lg border px-3 py-2.5 text-sm transition-colors ${
                        form.model === m
                          ? "border-[#e60012] bg-[#e60012]/10 text-white"
                          : "border-white/10 text-slate-400 hover:border-white/25"
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
          <Field label="Registration No.">
            <Input testid="input-reg-no" value={form.reg_no} onChange={(v) => upd("reg_no", v.toUpperCase())} placeholder="DL 3C AB 1234" />
          </Field>
          <Field label="Chassis / VIN">
            <Input testid="input-vin" value={form.vin} onChange={(v) => upd("vin", v)} placeholder="ME4JC..." />
          </Field>
          <Field label="Color">
            <Input testid="input-color" value={form.color} onChange={(v) => upd("color", v)} placeholder="Pearl Igneous Black" />
          </Field>
          <Field label="Year">
            <Input testid="input-year" value={form.year} onChange={(v) => upd("year", v)} placeholder="2024" />
          </Field>
        </div>

        <Field label="Powertrain">
          <div className="flex gap-3">
            {[
              { k: "petrol", icon: Fuel, label: "Petrol / Diesel" },
              { k: "electric", icon: Zap, label: "Electric" },
            ].map((p) => (
              <button
                key={p.k}
                data-testid={`fuel-${p.k}`}
                onClick={() => upd("fuel_type", p.k)}
                className={`flex-1 flex items-center justify-center gap-2 rounded-lg border py-3 text-sm transition-colors ${
                  form.fuel_type === p.k
                    ? "border-[#e60012] bg-[#e60012]/10 text-white"
                    : "border-white/10 text-slate-400 hover:border-white/25"
                }`}
              >
                <p.icon size={16} /> {p.label}
              </button>
            ))}
          </div>
        </Field>
      </div>

      <button
        data-testid="vehicle-save-button"
        onClick={save}
        disabled={saving}
        className="mt-6 w-full sm:w-auto px-8 py-3.5 rounded-lg bg-[#e60012] hover:bg-[#cc0010] disabled:opacity-60 text-white font-display font-bold uppercase tracking-wide transition-colors flex items-center justify-center gap-2"
      >
        {saving ? "Saving…" : "Save & Continue"} <ArrowRight size={18} />
      </button>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="font-mono text-xs tracking-widest text-slate-500 uppercase block mb-2">
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
      className="w-full rounded-lg bg-[#0b0f17] border border-white/10 px-4 py-3 text-white placeholder:text-slate-600 focus:border-[#e60012] focus:outline-none transition-colors font-body"
    />
  );
}
