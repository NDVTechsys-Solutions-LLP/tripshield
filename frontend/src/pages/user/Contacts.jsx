import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { toast } from "sonner";
import { Users, Plus, Trash2, Phone, ArrowRight, Send, Heart, ShieldCheck } from "lucide-react";

export default function Contacts() {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [form, setForm] = useState({ name: "", phone: "", relation: "Family", priority: "primary" });

  const load = () => api.get("/contacts").then((r) => setContacts(r.data));
  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!form.name || !form.phone) { toast.error("Name and phone required"); return; }
    await api.post("/contacts", form);
    toast.success("Contact added to safety network");
    setForm({ name: "", phone: "", relation: "Family", priority: "primary" });
    load();
  };

  const remove = async (id) => {
    await api.delete(`/contacts/${id}`);
    toast.info("Contact removed");
    load();
  };

  const testAlert = (c) => toast.success(`Test SOS preview sent to ${c.name} (${c.phone})`);

  return (
    <div className="hsj-fade-up max-w-5xl space-y-8">
      {/* Header */}
      <div>
        <p className="text-xs font-bold tracking-wider text-[#e60012] uppercase mb-2">
          Family Network &amp; Emergency Circle
        </p>
        <h1 className="font-display font-extrabold text-white text-3xl sm:text-4xl uppercase tracking-tight">
          Trusted Contacts
        </h1>
        <p className="text-slate-400 mt-2 font-body text-sm sm:text-base max-w-2xl">
          These trusted contacts receive your private zero-app web tracking link and automatic incident alerts during any emergency.
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Add Form Card */}
        <div className="lg:col-span-5 rounded-2xl border border-white/10 bg-[#0c111d] p-6 sm:p-7 shadow-xl">
          <h2 className="font-display font-bold text-white text-lg uppercase tracking-wide mb-5 flex items-center gap-2">
            <Plus size={18} className="text-[#e60012]" /> Add Trusted Contact
          </h2>
          <div className="space-y-4">
            <CInput label="Full Name" testid="contact-name-input" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="e.g. Priya Sharma" />
            <CInput label="Phone Number" testid="contact-phone-input" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} placeholder="+91 98XXXXXXXX" />
            
            <div>
              <label className="text-xs text-slate-400 uppercase tracking-wide block mb-2 font-semibold">Relation</label>
              <div className="grid grid-cols-2 gap-2">
                {["Family", "Spouse", "Parent", "Doctor"].map((r) => (
                  <button
                    key={r}
                    type="button"
                    data-testid="relation-option"
                    onClick={() => setForm({ ...form, relation: r })}
                    className={`rounded-xl border px-3 py-2.5 text-xs font-medium transition-all cursor-pointer ${
                      form.relation === r
                        ? "border-[#e60012] bg-[#e60012]/15 text-white font-semibold shadow-[0_0_12px_rgba(230,0,18,0.2)]"
                        : "border-white/10 bg-[#090d16] text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 uppercase tracking-wide block mb-2 font-semibold">Alert Priority</label>
              <div className="flex gap-2">
                {["primary", "secondary"].map((p) => (
                  <button
                    key={p}
                    type="button"
                    data-testid="priority-option"
                    onClick={() => setForm({ ...form, priority: p })}
                    className={`flex-1 rounded-xl border px-3 py-2.5 text-xs capitalize font-medium transition-all cursor-pointer ${
                      form.priority === p
                        ? "border-[#e60012] bg-[#e60012]/15 text-white font-semibold shadow-[0_0_12px_rgba(230,0,18,0.2)]"
                        : "border-white/10 bg-[#090d16] text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {p} Contact
                  </button>
                ))}
              </div>
            </div>

            <button
              data-testid="contact-save-button"
              onClick={add}
              className="mt-2 w-full py-3.5 rounded-xl bg-[#e60012] hover:bg-[#ff1a2e] text-white font-display font-bold uppercase tracking-wider text-xs transition-all shadow-[0_0_20px_rgba(230,0,18,0.35)] cursor-pointer"
            >
              Add to Network
            </button>
          </div>
        </div>

        {/* Contacts List */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-white text-lg uppercase tracking-wide">
              Active Network ({contacts.length})
            </h2>
            <span className="text-xs text-slate-400 font-medium">
              Zero-install WhatsApp / SMS link
            </span>
          </div>

          {contacts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/15 bg-[#0c111d] p-12 text-center shadow-xl">
              <Users className="text-slate-600 mx-auto" size={40} />
              <p className="text-slate-300 mt-4 font-body font-medium">No emergency contacts registered yet.</p>
              <p className="text-xs text-slate-500 font-body mt-1 max-w-sm mx-auto">
                Add trusted family members or friends above to enable one-tap live journey sharing.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {contacts.map((c) => (
                <div
                  key={c.contact_id}
                  data-testid="contact-card"
                  className="rounded-2xl border border-white/10 bg-[#0c111d] p-5 flex items-center gap-4 hover:border-white/20 transition-all shadow-xl"
                >
                  <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#e60012] shrink-0">
                    <Heart size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-bold text-white text-base">{c.name}</p>
                    <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5 font-normal">
                      <Phone size={12} className="text-slate-500" /> {c.phone} · <span className="text-slate-500">{c.relation}</span>
                    </p>
                  </div>
                  <span className={`hidden sm:inline rounded-lg px-2.5 py-1 text-xs font-semibold uppercase tracking-wider border ${
                    c.priority === "primary" ? "border-red-500/30 bg-red-500/10 text-red-300" : "border-white/10 bg-white/5 text-slate-400"
                  }`}>
                    {c.priority}
                  </span>
                  <button
                    data-testid="contact-test-alert"
                    onClick={() => testAlert(c)}
                    className="p-2 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors cursor-pointer"
                    title="Send test alert"
                  >
                    <Send size={16} />
                  </button>
                  <button
                    data-testid="contact-delete-button"
                    onClick={() => remove(c.contact_id)}
                    className="p-2 rounded-lg text-slate-500 hover:text-[#e60012] hover:bg-red-500/10 transition-colors cursor-pointer"
                    title="Delete contact"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="pt-2">
            <button
              data-testid="contacts-continue-button"
              onClick={() => navigate("/app/journey/new")}
              className="px-6 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/25 text-white font-display font-bold uppercase tracking-wider text-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Continue to Journey Setup</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CInput({ label, value, onChange, placeholder, testid }) {
  return (
    <div>
      <label className="text-xs text-slate-400 uppercase tracking-wide block mb-2 font-semibold">{label}</label>
      <input
        data-testid={testid}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl bg-[#090d16] border border-white/10 px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-[#e60012] focus:outline-none transition-all font-body"
      />
    </div>
  );
}
