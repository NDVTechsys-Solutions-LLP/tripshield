import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import {
  Settings as SettingsIcon, Phone, MessageSquare, Mail, Send, Users, Plus,
  Trash2, Heart, Save, Radio, Bike, ChevronRight, ShieldCheck, LayoutDashboard,
} from "lucide-react";

const CHANNELS = [
  { key: "sms", label: "SMS", icon: MessageSquare },
  { key: "whatsapp", label: "WhatsApp", icon: Send },
  { key: "email", label: "Email", icon: Mail },
];

export default function Settings() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({ phone: "", channel: "sms", auto_share: true, blood_group: "", allergies: "" });
  const [contacts, setContacts] = useState([]);
  const [vehicle, setVehicle] = useState(null);
  const [docs, setDocs] = useState([]);
  const [form, setForm] = useState({ name: "", phone: "", relation: "Family", priority: "primary" });
  const [saving, setSaving] = useState(false);

  const loadContacts = () => api.get("/contacts").then((r) => setContacts(r.data));
  useEffect(() => {
    api.get("/settings").then((r) => setSettings(r.data));
    api.get("/vehicle").then((r) => setVehicle(r.data));
    api.get("/documents").then((r) => setDocs(r.data));
    loadContacts();
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const r = await api.put("/settings", settings);
      setSettings(r.data);
      toast.success("Preferences saved successfully");
    } catch {
      toast.error("Save failed");
    } finally {
      setSaving(false);
    }
  };

  const addContact = async () => {
    if (!form.name || !form.phone) { toast.error("Name and phone required"); return; }
    await api.post("/contacts", form);
    toast.success("Contact added");
    setForm({ name: "", phone: "", relation: "Family", priority: "primary" });
    loadContacts();
  };
  const removeContact = async (id) => { await api.delete(`/contacts/${id}`); toast.info("Contact removed"); loadContacts(); };

  const tools = [
    {
      to: "/app", icon: LayoutDashboard, testid: "settings-tool-hub",
      title: "Command Hub", desc: "Overview, safety setup & quick actions",
      status: "Dashboard", ok: true,
    },
    {
      to: "/app/onboarding", icon: Bike, testid: "settings-tool-vehicle",
      title: "My Vehicle", desc: "2W/4W profile, specs & service records",
      status: vehicle ? `${vehicle.model} · ${vehicle.reg_no}` : "Not registered",
      ok: !!vehicle,
    },
    {
      to: "/app/contacts", icon: Users, testid: "settings-tool-family",
      title: "Family Network", desc: "Emergency contacts & live sharing circle",
      status: contacts.length ? `${contacts.length} active contact(s)` : "None added",
      ok: contacts.length > 0,
    },
  ];

  return (
    <div className="hsj-fade-up max-w-5xl space-y-8">
      {/* Header */}
      <div>
        <p className="text-xs font-bold tracking-wider text-[#e60012] uppercase mb-2">
          Control Center &amp; Profiles
        </p>
        <h1 className="font-display font-extrabold text-white text-3xl sm:text-4xl uppercase tracking-tight flex items-center gap-3">
          Safe Journey Settings
        </h1>
        <p className="text-slate-400 mt-2 font-body text-sm sm:text-base">
          Manage your safety parameters, medical responder profile, and automated dispatch preferences.
        </p>
      </div>

      {/* Navigation Tool Cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        {tools.map((t) => (
          <button
            key={t.to}
            data-testid={t.testid}
            onClick={() => navigate(t.to)}
            className="group text-left rounded-2xl border border-white/10 bg-[#0c111d] hover:border-white/25 hover:bg-[#111726] transition-all p-5 sm:p-6 flex flex-col justify-between shadow-xl cursor-pointer"
          >
            <div>
              <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#e60012] mb-4 group-hover:scale-105 transition-transform">
                <t.icon size={20} />
              </div>
              <p className="font-display font-bold text-white text-lg">{t.title}</p>
              <p className="text-xs text-slate-400 mt-1 font-body">{t.desc}</p>
            </div>
            <div className="flex items-center justify-between mt-5 pt-3 border-t border-white/5">
              <span className={`inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider ${t.ok ? "text-emerald-400" : "text-slate-500"}`}>
                <ShieldCheck size={13} /> {t.status}
              </span>
              <ChevronRight className="text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all" size={16} />
            </div>
          </button>
        ))}
      </div>

      {/* Preferences Section */}
      <div className="rounded-2xl border border-white/10 bg-[#0c111d] p-6 sm:p-8 space-y-7 shadow-xl">
        <h2 className="font-display font-bold text-white text-xl uppercase tracking-wide">
          Emergency Escalation Preferences
        </h2>

        <div>
          <label className="text-xs font-bold tracking-wider text-slate-400 uppercase block mb-2 flex items-center gap-2">
            <Phone size={13} /> Rider Phone Number (Used for 112 Caller ID)
          </label>
          <input
            data-testid="settings-phone-input"
            value={settings.phone}
            onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
            placeholder="+91 98XXXXXXXX"
            className="w-full max-w-sm rounded-xl bg-[#090d16] border border-white/10 px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-[#e60012] focus:outline-none transition-all font-body"
          />
        </div>

        <div>
          <label className="text-xs font-bold tracking-wider text-slate-400 uppercase block mb-2">
            Preferred Communication Channel
          </label>
          <div className="grid grid-cols-3 gap-3 max-w-md">
            {CHANNELS.map((c) => (
              <button
                key={c.key}
                type="button"
                data-testid={`settings-channel-${c.key}`}
                onClick={() => setSettings({ ...settings, channel: c.key })}
                className={`flex items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                  settings.channel === c.key
                    ? "border-[#e60012] bg-[#e60012]/15 text-white font-semibold shadow-[0_0_12px_rgba(230,0,18,0.2)]"
                    : "border-white/10 bg-[#090d16] text-slate-400 hover:text-white hover:border-white/25"
                }`}
              >
                <c.icon size={14} /> {c.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl bg-[#090d16] border border-white/10 px-5 py-3.5 max-w-xl">
          <span className="flex items-center gap-2.5 text-sm text-slate-300 font-body">
            <Radio size={16} className="text-[#e60012]" /> Auto-share live tracking link at ignition
          </span>
          <Switch
            data-testid="settings-autoshare-toggle"
            checked={!!settings.auto_share}
            onCheckedChange={(v) => setSettings({ ...settings, auto_share: v })}
            className="data-[state=checked]:bg-[#e60012]"
          />
        </div>

        {/* Medical Profile */}
        <div className="border-t border-white/10 pt-6">
          <p className="text-xs font-bold tracking-wider text-[#e60012] uppercase mb-1 flex items-center gap-2">
            <Heart size={14} /> First-Responder Medical Dossier
          </p>
          <p className="text-xs text-slate-400 mb-4 font-body">
            Securely attached to 112 emergency dispatches for immediate lifesaving context.
          </p>
          <div className="grid sm:grid-cols-2 gap-5 max-w-3xl">
            <div>
              <label className="text-xs font-bold tracking-wider text-slate-400 uppercase block mb-2">Blood Group</label>
              <div className="grid grid-cols-4 gap-2">
                {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((bg) => (
                  <button
                    key={bg}
                    type="button"
                    data-testid={`settings-blood-${bg}`}
                    onClick={() => setSettings({ ...settings, blood_group: settings.blood_group === bg ? "" : bg })}
                    className={`rounded-xl border py-2 text-xs font-semibold transition-all cursor-pointer ${
                      settings.blood_group === bg
                        ? "border-[#e60012] bg-[#e60012]/15 text-white font-semibold"
                        : "border-white/10 bg-[#090d16] text-slate-400 hover:text-white hover:border-white/25"
                    }`}
                  >
                    {bg}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-bold tracking-wider text-slate-400 uppercase block mb-2">Allergies / Critical Notes</label>
              <textarea
                data-testid="settings-allergies-input"
                value={settings.allergies}
                onChange={(e) => setSettings({ ...settings, allergies: e.target.value })}
                placeholder="e.g. Penicillin allergy, asthma, diabetic…"
                rows={3}
                className="w-full rounded-xl bg-[#090d16] border border-white/10 px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-[#e60012] focus:outline-none resize-none transition-all font-body"
              />
            </div>
          </div>
        </div>

        <div>
          <button
            data-testid="settings-save-button"
            onClick={save}
            disabled={saving}
            className="px-8 py-3 rounded-xl bg-[#e60012] hover:bg-[#cc0010] disabled:opacity-60 text-white font-display font-bold uppercase tracking-wider text-xs transition-all shadow-[0_0_20px_rgba(230,0,18,0.35)] flex items-center gap-2 cursor-pointer"
          >
            <Save size={15} /> {saving ? "Saving…" : "Save Preferences"}
          </button>
        </div>
      </div>
    </div>
  );
}
