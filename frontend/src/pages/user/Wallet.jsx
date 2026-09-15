import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import {
  Wallet as WalletIcon, Plus, ShieldCheck, Trash2, FileText, Shield, Users, Building2, Landmark, Upload,
} from "lucide-react";

const DOC_TYPES = [
  "Aadhaar Card", "Driving License", "Vehicle RC", "Vehicle Insurance",
  "PUC Certificate", "Medical Insurance",
];

const SHARE_TARGETS = [
  { key: "share_police", label: "Police / 112", icon: Shield, testid: "police" },
  { key: "share_family", label: "Family", icon: Users, testid: "family" },
  { key: "share_dealer", label: "Honda Dealer", icon: Building2, testid: "dealer" },
  { key: "share_insurer", label: "Insurer", icon: Landmark, testid: "insurer" },
];

export default function Wallet() {
  const [docs, setDocs] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    doc_type: "Aadhaar Card", doc_number: "", holder_name: "", expiry: "", file_data: "",
    share_police: false, share_family: false, share_dealer: false, share_insurer: false,
  });

  const load = () => api.get("/documents").then((r) => setDocs(r.data));
  useEffect(() => { load(); }, []);

  const upd = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const onFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1_500_000) { toast.error("File too large (max 1.5MB)"); return; }
    const reader = new FileReader();
    reader.onload = () => upd("file_data", reader.result);
    reader.readAsDataURL(file);
  };

  const add = async () => {
    if (!form.doc_number) { toast.error("Document number required"); return; }
    try {
      await api.post("/documents", form);
      toast.success("Document added to vault");
      setOpen(false);
      setForm({
        doc_type: "Aadhaar Card", doc_number: "", holder_name: "", expiry: "", file_data: "",
        share_police: false, share_family: false, share_dealer: false, share_insurer: false,
      });
      load();
    } catch { toast.error("Failed to add"); }
  };

  const toggleShare = async (doc, key) => {
    const val = !doc[key];
    setDocs((ds) => ds.map((d) => d.document_id === doc.document_id ? { ...d, [key]: val } : d));
    try { await api.patch(`/documents/${doc.document_id}`, { [key]: val }); }
    catch { toast.error("Update failed"); load(); }
  };

  const remove = async (id) => {
    await api.delete(`/documents/${id}`);
    toast.success("Removed");
    load();
  };

  return (
    <div className="hsj-fade-up">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <p className="font-mono text-xs tracking-widest text-red-400/90 uppercase mb-2">
            Step 3 · Encrypted Vault
          </p>
          <h1 className="font-display font-extrabold text-white text-3xl sm:text-4xl uppercase tracking-tight">
            Document Wallet
          </h1>
          <p className="text-slate-400 mt-2 font-body max-w-xl">
            Store critical documents. Control exactly who receives each one during an emergency.
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button
              data-testid="document-wallet-add-button"
              className="px-5 py-3 rounded-lg bg-[#e60012] hover:bg-[#cc0010] text-white font-display font-bold uppercase tracking-wide text-sm transition-colors flex items-center gap-2"
            >
              <Plus size={18} /> Add Document
            </button>
          </DialogTrigger>
          <DialogContent className="bg-[#0f141f] border-white/10 text-white backdrop-blur-md max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-display uppercase tracking-wide">Add Document</DialogTitle>
              <DialogDescription className="text-slate-500 text-sm">
                Stored encrypted in your wallet. You control who it's shared with.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div>
                <label className="font-mono text-xs text-slate-500 uppercase block mb-2">Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {DOC_TYPES.map((t) => (
                    <button
                      key={t}
                      data-testid="doc-type-option"
                      onClick={() => upd("doc_type", t)}
                      className={`rounded-lg border px-3 py-2 text-xs transition-colors ${
                        form.doc_type === t ? "border-[#e60012] bg-[#e60012]/10 text-white" : "border-white/10 text-slate-400"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <WInput label="Document Number" testid="doc-number-input" value={form.doc_number} onChange={(v) => upd("doc_number", v)} placeholder="XXXX XXXX XXXX" />
              <WInput label="Holder Name" testid="doc-holder-input" value={form.holder_name} onChange={(v) => upd("holder_name", v)} placeholder="As printed" />
              <WInput label="Expiry (optional)" testid="doc-expiry-input" value={form.expiry} onChange={(v) => upd("expiry", v)} placeholder="2028-05" />
              <div>
                <label className="font-mono text-xs text-slate-500 uppercase block mb-2">Upload Scan (optional)</label>
                <label className="flex items-center gap-2 rounded-lg border border-dashed border-white/20 px-4 py-3 text-sm text-slate-400 cursor-pointer hover:border-[#e60012]/50">
                  <Upload size={16} /> {form.file_data ? "File attached ✓" : "Choose image (max 1.5MB)"}
                  <input data-testid="doc-file-input" type="file" accept="image/*" className="hidden" onChange={onFile} />
                </label>
              </div>
              <button
                data-testid="document-save-button"
                onClick={add}
                className="w-full py-3 rounded-lg bg-[#e60012] hover:bg-[#cc0010] text-white font-display font-bold uppercase tracking-wide transition-colors"
              >
                Save to Vault
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {docs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/15 bg-[#0f141f] p-12 mt-8 text-center">
          <WalletIcon className="text-slate-600 mx-auto" size={40} />
          <p className="text-slate-400 mt-4 font-body">Your vault is empty. Add Aadhaar, RC, Insurance, PUC &amp; more.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-5 mt-8">
          {docs.map((d) => (
            <div key={d.document_id} data-testid="document-card" className="rounded-xl border border-white/10 bg-[#0f141f] p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-lg bg-[#e60012]/15 flex items-center justify-center text-[#e60012]">
                    <FileText size={20} />
                  </div>
                  <div>
                    <p className="font-display font-bold text-white">{d.doc_type}</p>
                    <p className="font-mono text-xs text-slate-500">{d.doc_number}</p>
                  </div>
                </div>
                <button data-testid="document-delete-button" onClick={() => remove(d.document_id)} className="text-slate-600 hover:text-[#e60012]">
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 text-emerald-400 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wide">
                  <ShieldCheck size={11} /> Verified
                </span>
                {d.holder_name && <span className="text-xs text-slate-500 font-mono">{d.holder_name}</span>}
              </div>

              <p className="font-mono text-[10px] tracking-widest text-slate-500 uppercase mt-5 mb-3">
                Sharing Permissions
              </p>
              <div className="space-y-2">
                {SHARE_TARGETS.map((t) => (
                  <div key={t.key} className="flex items-center justify-between rounded-lg bg-[#0b0f17] border border-white/5 px-3 py-2">
                    <span className="flex items-center gap-2 text-sm text-slate-300">
                      <t.icon size={15} className="text-slate-500" /> {t.label}
                    </span>
                    <Switch
                      data-testid={`document-sharing-toggle-${t.testid}`}
                      checked={!!d[t.key]}
                      onCheckedChange={() => toggleShare(d, t.key)}
                      className="data-[state=checked]:bg-[#e60012]"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function WInput({ label, value, onChange, placeholder, testid }) {
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
