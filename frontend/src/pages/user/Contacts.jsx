import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { toast } from "sonner";
import { Users, Plus, Trash2, Phone, ArrowRight, Send, Heart } from "lucide-react";

export default function Contacts() {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [form, setForm] = useState({ name: "", phone: "", relation: "Family", priority: "primary" });

  const load = () => api.get("/contacts").then((r) => setContacts(r.data));
  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!form.name || !form.phone) { toast.error("Name and phone required"); return; }
    await api.post("/contacts", form);
    toast.success("Contact added");
    setForm({ name: "", phone: "", relation: "Family", priority: "primary" });
    load();
  };

  const remove = async (id) => {
    await api.delete(`/contacts/${id}`);
    load();
  };

  const testAlert = (c) => toast.success(`Test SOS preview sent to ${c.name} (${c.phone})`);

  return (
    <div className="hsj-fade-up max-w-4xl">
      <p className="font-mono text-xs tracking-widest text-red-400/90 uppercase mb-2">
        Step 4 · Family Network
      </p>
      <h1 className="font-display font-extrabold text-white text-3xl sm:text-4xl uppercase tracking-tight">
        Emergency Contacts
      </h1>
      <p className="text-slate-400 mt-2 font-body max-w-xl">
        These trusted contacts receive instant alerts with your live location during any incident.
      </p>

      <div className="grid lg:grid-cols-3 gap-6 mt-8">
        {/* Add form */}
        <div className="rounded-xl border border-white/10 bg-[#0f141f] p-6 h-fit">
          <h2 className="font-display font-bold text-white uppercase tracking-wide mb-4 flex items-center gap-2">
            <Plus size={18} className="text-[#e60012]" /> Add Contact
          </h2>
          <div className="space-y-4">
            <CInput label="Name" testid="contact-name-input" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="Full name" />
            <CInput label="Phone" testid="contact-phone-input" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} placeholder="+91 98XXXXXXXX" />
            <div>
              <label className="font-mono text-xs text-slate-500 uppercase block mb-2">Relation</label>
              <div className="grid grid-cols-2 gap-2">
                {["Family", "Spouse", "Parent", "Doctor"].map((r) => (
                  <button key={r} data-testid="relation-option" onClick={() => setForm({ ...form, relation: r })}
                    className={`rounded-lg border px-3 py-2 text-xs transition-colors ${
                      form.relation === r ? "border-[#e60012] bg-[#e60012]/10 text-white" : "border-white/10 text-slate-400"
                    }`}>
                    {r}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="font-mono text-xs text-slate-500 uppercase block mb-2">Priority</label>
              <div className="flex gap-2">
                {["primary", "secondary"].map((p) => (
                  <button key={p} data-testid="priority-option" onClick={() => setForm({ ...form, priority: p })}
                    className={`flex-1 rounded-lg border px-3 py-2 text-xs capitalize transition-colors ${
                      form.priority === p ? "border-[#e60012] bg-[#e60012]/10 text-white" : "border-white/10 text-slate-400"
                    }`}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <button
              data-testid="contact-save-button"
              onClick={add}
              className="w-full py-3 rounded-lg bg-[#e60012] hover:bg-[#cc0010] text-white font-display font-bold uppercase tracking-wide transition-colors"
            >
              Add to Network
            </button>
          </div>
        </div>

        {/* List */}
        <div className="lg:col-span-2 space-y-3">
          {contacts.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/15 bg-[#0f141f] p-12 text-center">
              <Users className="text-slate-600 mx-auto" size={40} />
              <p className="text-slate-400 mt-4">No contacts yet. Add family members to keep them informed.</p>
            </div>
          ) : (
            contacts.map((c) => (
              <div key={c.contact_id} data-testid="contact-card" className="rounded-xl border border-white/10 bg-[#0f141f] p-5 flex items-center gap-4">
                <div className="w-11 h-11 rounded-full bg-[#e60012]/15 flex items-center justify-center text-[#e60012] shrink-0">
                  <Heart size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display font-bold text-white">{c.name}</p>
                  <p className="font-mono text-xs text-slate-500 flex items-center gap-2">
                    <Phone size={11} /> {c.phone} · {c.relation}
                  </p>
                </div>
                <span className={`hidden sm:inline rounded-full px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wide ${
                  c.priority === "primary" ? "bg-[#e60012]/15 text-red-400" : "bg-white/5 text-slate-400"
                }`}>
                  {c.priority}
                </span>
                <button data-testid="contact-test-alert" onClick={() => testAlert(c)} className="text-slate-500 hover:text-emerald-400 p-2" title="Test alert">
                  <Send size={16} />
                </button>
                <button data-testid="contact-delete-button" onClick={() => remove(c.contact_id)} className="text-slate-600 hover:text-[#e60012] p-2">
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}

          <button
            data-testid="contacts-continue-button"
            onClick={() => navigate("/app/journey/new")}
            className="mt-2 px-8 py-3.5 rounded-lg bg-[#0f141f] border border-white/10 hover:border-[#e60012]/50 text-white font-display font-bold uppercase tracking-wide transition-colors flex items-center gap-2"
          >
            Continue to Journey <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

function CInput({ label, value, onChange, placeholder, testid }) {
  return (
    <div>
      <label className="font-mono text-xs text-slate-500 uppercase block mb-2">{label}</label>
      <input
        data-testid={testid}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg bg-[#0b0f17] border border-white/10 px-4 py-2.5 text-white placeholder:text-slate-600 focus:border-[#e60012] focus:outline-none transition-colors"
      />
    </div>
  );
}
