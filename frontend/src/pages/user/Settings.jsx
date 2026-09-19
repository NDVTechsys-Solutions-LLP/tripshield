import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import {
  Settings as SettingsIcon, Phone, MessageSquare, Mail, Send, Users, Plus,
  Trash2, Heart, Save, Radio, Bluetooth, Bike, Wallet, ChevronRight, ShieldCheck, LayoutDashboard,
} from "lucide-react";

const CHANNELS = [
  { key: "sms", label: "SMS", icon: MessageSquare },
  { key: "whatsapp", label: "WhatsApp", icon: Send },
  { key: "email", label: "Email", icon: Mail },
];

export default function Settings() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({ phone: "", channel: "sms", auto_share: true });
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
      toast.success("Preferences saved");
    } catch { toast.error("Save failed"); }
    finally { setSaving(false); }
  };

  const addContact = async () => {
    if (!form.name || !form.phone) { toast.error("Name and phone required"); return; }
    await api.post("/contacts", form);
    toast.success("Contact added");
    setForm({ name: "", phone: "", relation: "Family", priority: "primary" });
    loadContacts();
  };
  const removeContact = async (id) => { await api.delete(`/contacts/${id}`); loadContacts(); };

  const tools = [
    {
      to: "/app", icon: LayoutDashboard, testid: "settings-tool-hub",
      title: "Command Hub", desc: "Overview, safety setup & quick actions",
      status: "Dashboard", ok: true,
    },
    {
      to: "/app/onboarding", icon: Bike, testid: "settings-tool-vehicle",
      title: "My Vehicle", desc: "Honda 2W/4W profile, specs & service history",
      status: vehicle ? `${vehicle.model} · ${vehicle.reg_no}` : "Not registered",
      ok: !!vehicle,
    },
    {
      to: "/app/wallet", icon: Wallet, testid: "settings-tool-wallet",
      title: "Document Wallet", desc: "Insurance, license, RC book & PUC certificate",
      status: docs.length ? `${docs.length} document(s)` : "Empty",
      ok: docs.length > 0,
    },
    {
      to: "/app/contacts", icon: Users, testid: "settings-tool-family",
      title: "Family Network", desc: "Emergency contacts, trusted circle & permissions",
      status: contacts.length ? `${contacts.length} contact(s)` : "None added",
      ok: contacts.length > 0,
    },
  ];

  return (
    <div className="hsj-fade-up max-w-4xl">
      <p className="font-mono text-xs tracking-widest text-red-400/90 uppercase mb-2">Control Center</p>
      <h1 className="font-display font-extrabold text-white text-3xl sm:text-4xl uppercase tracking-tight flex items-center gap-3">
        <SettingsIcon className="text-[#e60012]" size={30} /> Safe Journey Settings
      </h1>
      <p className="text-slate-400 mt-2 font-body">
        All configuration &amp; vehicle management tools, organized in one place.
      </p>

      {/* Management tool hub */}
      <div className="grid sm:grid-cols-2 gap-4 mt-8">
        {tools.map((t) => (
          <button
            key={t.to}
            data-testid={t.testid}
            onClick={() => navigate(t.to)}
            className="group text-left rounded-xl border border-white/10 bg-[#0f141f] hover:border-[#e60012]/50 hover:bg-[#161d2c] transition-all p-5 flex items-start gap-4"
          >
            <div className="w-11 h-11 rounded-lg bg-[#e60012]/15 flex items-center justify-center text-[#e60012] shrink-0">
              <t.icon size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-display font-bold text-white">{t.title}</p>
              <p className="text-xs text-slate-500 mt-0.5">{t.desc}</p>
              <span className={`inline-flex items-center gap-1 mt-2 font-mono text-[10px] uppercase tracking-wide ${t.ok ? "text-emerald-400" : "text-slate-500"}`}>
                <ShieldCheck size={11} /> {t.status}
              </span>
            </div>
            <ChevronRight className="text-slate-600 group-hover:text-[#e60012] transition-colors" size={18} />
          </button>
        ))}
      </div>

      {/* Preferences */}
      <h2 className="font-display font-bold text-white text-xl uppercase tracking-wide mt-10 mb-4">
        Preferences
      </h2>
      <div className="rounded-xl border border-white/10 bg-[#0f141f] p-6 sm:p-7 space-y-6">
        <div>
          <label className="font-mono text-xs tracking-widest text-slate-500 uppercase block mb-2 flex items-center gap-2">
            <Phone size={13} /> Your Phone Number (used for SOS identification)
          </label>
          <input
            data-testid="settings-phone-input"
            value={settings.phone}
            onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
            placeholder="+91 98XXXXXXXX"
            className="w-full max-w-sm rounded-lg bg-[#0b0f17] border border-white/10 px-4 py-3 text-white placeholder:text-slate-600 focus:border-[#e60012] focus:outline-none"
          />
        </div>

        <div>
          <label className="font-mono text-xs tracking-widest text-slate-500 uppercase block mb-2">
            Preferred Communication Channel
          </label>
          <div className="grid grid-cols-3 gap-2 max-w-md">
            {CHANNELS.map((c) => (
              <button
                key={c.key}
                data-testid={`settings-channel-${c.key}`}
                onClick={() => setSettings({ ...settings, channel: c.key })}
                className={`flex items-center justify-center gap-2 rounded-lg border py-3 text-sm transition-colors ${
                  settings.channel === c.key ? "border-[#e60012] bg-[#e60012]/10 text-white" : "border-white/10 text-slate-400 hover:border-white/25"
                }`}
              >
                <c.icon size={15} /> {c.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg bg-[#0b0f17] border border-white/5 px-4 py-3 max-w-md">
          <span className="flex items-center gap-2 text-sm text-slate-300">
            <Radio size={15} className="text-slate-500" /> Auto-share tracking link at journey start
          </span>
          <Switch
            data-testid="settings-autoshare-toggle"
            checked={!!settings.auto_share}
            onCheckedChange={(v) => setSettings({ ...settings, auto_share: v })}
            className="data-[state=checked]:bg-[#e60012]"
          />
        </div>

        <button
          data-testid="settings-save-button"
          onClick={save}
          disabled={saving}
          className="px-6 py-3 rounded-lg bg-[#e60012] hover:bg-[#cc0010] disabled:opacity-60 text-white font-display font-bold uppercase tracking-wide text-sm transition-colors flex items-center gap-2"
        >
          <Save size={16} /> {saving ? "Saving…" : "Save Preferences"}
        </button>
      </div>

      {/* Emergency contacts */}
      <div className="rounded-xl border border-white/10 bg-[#0f141f] p-6 sm:p-7 mt-6">
        <h2 className="font-display font-bold text-white uppercase tracking-wide mb-4 flex items-center gap-2">
          <Users size={18} className="text-[#e60012]" /> Emergency Contact List
        </h2>
        <div className="grid sm:grid-cols-4 gap-2 mb-4">
          <input data-testid="settings-contact-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name"
            className="rounded-lg bg-[#0b0f17] border border-white/10 px-3 py-2.5 text-white placeholder:text-slate-600 focus:border-[#e60012] focus:outline-none text-sm" />
          <input data-testid="settings-contact-phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone"
            className="rounded-lg bg-[#0b0f17] border border-white/10 px-3 py-2.5 text-white placeholder:text-slate-600 focus:border-[#e60012] focus:outline-none text-sm" />
          <input value={form.relation} onChange={(e) => setForm({ ...form, relation: e.target.value })} placeholder="Relation"
            className="rounded-lg bg-[#0b0f17] border border-white/10 px-3 py-2.5 text-white placeholder:text-slate-600 focus:border-[#e60012] focus:outline-none text-sm" />
          <button data-testid="settings-contact-add" onClick={addContact}
            className="rounded-lg bg-[#e60012] hover:bg-[#cc0010] text-white font-display font-bold uppercase tracking-wide text-sm flex items-center justify-center gap-2">
            <Plus size={16} /> Add
          </button>
        </div>
        <div className="space-y-2">
          {contacts.length === 0 && <p className="text-sm text-slate-500 font-mono">No contacts yet.</p>}
          {contacts.map((c) => (
            <div key={c.contact_id} className="flex items-center gap-3 rounded-lg bg-[#0b0f17] border border-white/5 px-4 py-3">
              <Heart size={16} className="text-[#e60012]" />
              <span className="font-display font-bold text-white text-sm">{c.name}</span>
              <span className="font-mono text-xs text-slate-500 flex-1">{c.phone} · {c.relation}</span>
              <button data-testid="settings-contact-delete" onClick={() => removeContact(c.contact_id)} className="text-slate-600 hover:text-[#e60012]">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
