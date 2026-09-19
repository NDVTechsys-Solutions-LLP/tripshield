import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { toast } from "sonner";
import { Bike, Car, ArrowRight, CheckCircle2, Zap, Fuel } from "lucide-react";

const MODELS = {
  "2w": ["Activa 6G", "Shine 125", "SP 125", "CB350", "Hornet 2.0", "Transalp", "EM1 e: (EV)"],
  "4w": ["City", "Elevate", "Amaze", "City e:HEV", "Civic", "WR-V"],
};

export default function Onboarding() {
  const navigate = useNavigate();
  const [type, setType] = useState("2w");
  const [form, setForm] = useState({
    model: "", reg_no: "", vin: "", color: "", year: "", fuel_type: "petrol",
  });
  const [saving, setSaving] = useState(false);
  const [existing, setExisting] = useState(false);

  useEffect(() => {
    api.get("/vehicle").then((r) => {
      if (r.data) {
        setType(r.data.type);
        setForm({
          model: r.data.model, reg_no: r.data.reg_no, vin: r.data.vin || "",
          color: r.data.color || "", year: r.data.year || "", fuel_type: r.data.fuel_type || "petrol",
        });
        setExisting(true);
      }
    });
  }, []);

  const upd = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
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
          { key: "2w", icon: Bike, label: "Two-Wheeler", sub: "Activa · CB · Hornet" },
          { key: "4w", icon: Car, label: "Four-Wheeler", sub: "City · Elevate · Amaze" },
        ].map((t) => (
          <button
            key={t.key}
            data-testid={`vehicle-type-${t.key === "2w" ? "2wheeler" : "4wheeler"}-card`}
            onClick={() => { setType(t.key); upd("model", ""); }}
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
        <Field label="Model">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {MODELS[type].map((m) => (
              <button
                key={m}
                data-testid={`model-option`}
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
              { k: "petrol", icon: Fuel, label: "Petrol" },
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
