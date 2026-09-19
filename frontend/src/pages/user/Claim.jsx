import React, { useEffect, useState, useRef } from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  FileText, Landmark, CheckCircle2, Loader2, ShieldCheck, Sparkles, Copy,
  Camera, Clock, ChevronRight, Circle, Upload, ArrowRight,
} from "lucide-react";

const INSURERS = ["TripShield Assure", "ICICI Lombard", "Bajaj Allianz", "HDFC ERGO"];

const CLAIM_STAGES = [
  { key: "submitted", label: "Submitted" },
  { key: "under_review", label: "Under Review" },
  { key: "surveyor_assigned", label: "Surveyor Assigned" },
  { key: "approved", label: "Approved" },
  { key: "settled", label: "Settled" },
];
const STAGE_KEYS = CLAIM_STAGES.map((s) => s.key);
const statusColor = (s) =>
  ({ submitted: "#3b82f6", under_review: "#f59e0b", surveyor_assigned: "#f59e0b", approved: "#10b981", settled: "#10b981" }[s] || "#94a3b8");

export default function Claim() {
  const [docs, setDocs] = useState([]);
  const [vehicle, setVehicle] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [journeys, setJourneys] = useState([]);
  const [insurer, setInsurer] = useState("TripShield Assure");
  const [submitting, setSubmitting] = useState(false);
  const [claim, setClaim] = useState(null);
  const [claims, setClaims] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    api.get("/documents").then((r) => setDocs(r.data));
    api.get("/vehicle").then((r) => setVehicle(r.data));
    api.get("/incidents").then((r) => setIncidents(r.data));
    api.get("/journeys").then((r) => setJourneys(r.data));
    api.get("/claims").then((r) => setClaims(r.data));
  }, []);

  const find = (t) => docs.find((d) => d.doc_type === t);
  const lastAccident = incidents.find((i) => i.type === "accident") || incidents[0];
  const lastJourney = journeys[0];

  const pkg = {
    "Policy Holder": find("Vehicle Insurance")?.holder_name || "—",
    "Policy Number": find("Vehicle Insurance")?.doc_number || "Not in wallet",
    "Registration": find("Vehicle RC")?.doc_number || vehicle?.reg_no || "—",
    "Vehicle": vehicle?.model || "—",
    "Aadhaar": find("Aadhaar Card")?.doc_number || "Not in wallet",
    "Driving License": find("Driving License")?.doc_number || "Not in wallet",
    "Incident Location": lastAccident?.route_name || lastJourney?.to_name || "—",
    "Impact G-Force": "4.2 G",
    "Telematics Speed": "54 km/h",
  };

  const submit = async () => {
    setSubmitting(true);
    try {
      const r = await api.post("/claims", {
        journey_id: lastJourney?.journey_id,
        incident_id: lastAccident?.incident_id,
        insurer, impact_g: 4.2,
      });
      setTimeout(() => {
        setClaim(r.data);
        setSelected(r.data);
        setSubmitting(false);
        toast.success("Claim submitted to insurer");
        api.get("/claims").then((res) => setClaims(res.data));
      }, 1600);
    } catch { setSubmitting(false); toast.error("Submission failed"); }
  };

  return (
    <div className="hsj-fade-up max-w-4xl">
      <p className="font-mono text-xs tracking-widest text-red-400/90 uppercase mb-2">
        Recover · FNOL
      </p>
      <h1 className="font-display font-extrabold text-white text-3xl sm:text-4xl uppercase tracking-tight">
        One-Tap Insurance Claim
      </h1>
      <p className="text-slate-400 mt-2 font-body max-w-xl">
        Auto-assembles your claim from the Document Wallet &amp; telematics, then transmits to your insurer via API.
      </p>

      <div className="grid lg:grid-cols-5 gap-6 mt-8">
        {/* Data package */}
        <div className="lg:col-span-3 rounded-xl border border-white/10 bg-[#0f141f] p-6">
          <h2 className="font-display font-bold text-white uppercase tracking-wide mb-4 flex items-center gap-2">
            <FileText size={18} className="text-[#e60012]" /> Claim Data Package
          </h2>
          <div className="space-y-2">
            {Object.entries(pkg).map(([k, v]) => (
              <div key={k} className="flex items-center justify-between rounded-lg bg-[#0b0f17] border border-white/5 px-4 py-2.5">
                <span className="font-mono text-xs text-slate-500 uppercase tracking-wide">{k}</span>
                <span className={`font-mono text-sm ${String(v).includes("Not in") ? "text-amber-400" : "text-white"}`}>{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="lg:col-span-2 space-y-5">
          <div className="rounded-xl border border-white/10 bg-[#0f141f] p-6">
            <h3 className="font-display font-bold text-white uppercase tracking-wide mb-3 flex items-center gap-2">
              <Landmark size={18} className="text-[#3b82f6]" /> Insurer
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {INSURERS.map((ins) => (
                <button key={ins} data-testid="insurer-option" onClick={() => setInsurer(ins)}
                  className={`rounded-lg border px-3 py-2.5 text-xs transition-colors ${
                    insurer === ins ? "border-[#e60012] bg-[#e60012]/10 text-white" : "border-white/10 text-slate-400"
                  }`}>
                  {ins}
                </button>
              ))}
            </div>
          </div>

          {!claim ? (
            <button
              data-testid="one-tap-claim-submit-button"
              onClick={submit}
              disabled={submitting}
              className="w-full py-4 rounded-xl bg-[#e60012] hover:bg-[#cc0010] disabled:opacity-60 text-white font-display font-bold uppercase tracking-wide transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#e60012]/20"
            >
              {submitting ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
              {submitting ? "Transmitting to insurer…" : "Submit Claim · One Tap"}
            </button>
          ) : (
            <div data-testid="claim-success" className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-6 text-center hsj-fade-up">
              <CheckCircle2 className="text-emerald-400 mx-auto" size={40} />
              <p className="font-display font-bold text-white text-lg mt-3 uppercase">Claim Filed</p>
              <p className="font-mono text-xs text-slate-400 mt-1">{claim.insurer}</p>
              <div className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-[#0b0f17] border border-white/10 px-4 py-2.5">
                <span className="font-mono text-sm text-emerald-300">{claim.claim_ref}</span>
                <button onClick={() => { navigator.clipboard?.writeText(claim.claim_ref); toast.success("Copied"); }} className="text-slate-500 hover:text-white">
                  <Copy size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {claims.length > 0 && (
        <div className="rounded-xl border border-white/10 bg-[#0f141f] p-6 mt-6">
          <h2 className="font-display font-bold text-white uppercase tracking-wide mb-4 flex items-center gap-2">
            <Clock size={18} className="text-[#e60012]" /> Claim Tracking
          </h2>
          <div className="space-y-2">
            {claims.map((c) => (
              <button
                key={c.claim_id}
                data-testid="claim-history-row"
                onClick={() => setSelected(c)}
                className="w-full flex items-center gap-3 text-sm py-3 px-3 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/10 transition-colors text-left"
              >
                <ShieldCheck size={16} style={{ color: statusColor(c.status) }} />
                <span className="font-mono text-white">{c.claim_ref}</span>
                <span className="text-slate-500 flex-1 truncate">{c.insurer}</span>
                {c.photos?.length > 0 && (
                  <span className="font-mono text-[10px] text-slate-500 flex items-center gap-1">
                    <Camera size={11} /> {c.photos.length}
                  </span>
                )}
                <span className="rounded-full px-2.5 py-0.5 font-mono text-[10px] uppercase"
                  style={{ background: `${statusColor(c.status)}22`, color: statusColor(c.status) }}>
                  {c.status?.replace("_", " ")}
                </span>
                <ChevronRight size={16} className="text-slate-600" />
              </button>
            ))}
          </div>
        </div>
      )}

      <ClaimDetail
        claim={selected}
        onClose={() => setSelected(null)}
        onUpdate={(u) => { setSelected(u); setClaims((cs) => cs.map((x) => (x.claim_id === u.claim_id ? u : x))); }}
      />
    </div>
  );
}

function ClaimDetail({ claim, onClose, onUpdate }) {
  const fileRef = useRef(null);
  const [busy, setBusy] = useState(false);
  if (!claim) return null;
  const curIdx = STAGE_KEYS.indexOf(claim.status);

  const advance = async () => {
    setBusy(true);
    try {
      const r = await api.post(`/claims/${claim.claim_id}/advance`);
      onUpdate(r.data);
      toast.success("Claim status advanced");
    } catch { toast.error("Update failed"); }
    finally { setBusy(false); }
  };

  const onFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const datas = [];
    for (const f of files) {
      if (f.size > 1_500_000) { toast.error(`${f.name} too large (max 1.5MB)`); continue; }
      // eslint-disable-next-line no-await-in-loop
      datas.push(await new Promise((res) => { const rd = new FileReader(); rd.onload = () => res(rd.result); rd.readAsDataURL(f); }));
    }
    if (!datas.length) return;
    try {
      const r = await api.post(`/claims/${claim.claim_id}/photos`, { photos: datas });
      onUpdate(r.data);
      toast.success("Crash photos uploaded");
    } catch { toast.error("Upload failed"); }
  };

  return (
    <Dialog open={!!claim} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bg-[#0f141f] border-white/10 text-white backdrop-blur-md max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display uppercase tracking-wide flex items-center gap-2">
            <FileText className="text-[#e60012]" size={20} /> {claim.claim_ref}
          </DialogTitle>
          <DialogDescription className="text-slate-500 text-sm">
            {claim.insurer} · Track your claim through to settlement
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2" data-testid="claim-stage-tracker">
          {CLAIM_STAGES.map((s, i) => {
            const done = i <= curIdx;
            const entry = (claim.timeline || []).find((t) => t.key === s.key);
            return (
              <div key={s.key} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: done ? "#10b98122" : "#0b0f17", border: `2px solid ${done ? "#10b981" : "#26304a"}` }}>
                    {done ? <CheckCircle2 size={16} className="text-emerald-400" /> : <Circle size={12} className="text-slate-600" />}
                  </div>
                  {i < CLAIM_STAGES.length - 1 && (
                    <div className="w-0.5 flex-1 min-h-[26px]" style={{ background: i < curIdx ? "#10b981" : "#26304a" }} />
                  )}
                </div>
                <div className="pb-4">
                  <p className={`font-display font-bold text-sm ${done ? "text-white" : "text-slate-500"}`}>{s.label}</p>
                  {entry ? (
                    <p className="font-mono text-[10px] text-slate-500">{entry.note} · {new Date(entry.at).toLocaleString()}</p>
                  ) : (
                    <p className="font-mono text-[10px] text-slate-600">Pending</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="rounded-lg bg-[#0b0f17] border border-white/10 p-4">
          <p className="font-mono text-[10px] tracking-widest text-slate-500 uppercase mb-2 flex items-center gap-2">
            <Camera size={12} /> Crash Photos ({(claim.photos || []).length})
          </p>
          <div className="grid grid-cols-4 gap-2">
            {(claim.photos || []).map((p, i) => (
              <img key={i} src={p} alt="" className="w-full h-16 object-cover rounded-md border border-white/10" />
            ))}
            <button data-testid="claim-add-photo-button" onClick={() => fileRef.current?.click()}
              className="h-16 rounded-md border border-dashed border-white/20 flex items-center justify-center text-slate-500 hover:border-[#e60012]/50 hover:text-white transition-colors">
              <Upload size={16} />
            </button>
          </div>
          <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={onFiles} />
        </div>

        {claim.status !== "settled" ? (
          <button data-testid="claim-advance-button" onClick={advance} disabled={busy}
            className="w-full py-3 rounded-lg bg-[#e60012] hover:bg-[#cc0010] disabled:opacity-60 text-white font-display font-bold uppercase tracking-wide transition-colors flex items-center justify-center gap-2">
            {busy ? <Loader2 className="animate-spin" size={18} /> : <ArrowRight size={18} />} Advance To Next Stage
          </button>
        ) : (
          <div className="text-center rounded-lg bg-emerald-500/10 border border-emerald-500/30 py-3 font-display font-bold uppercase text-emerald-300 text-sm">
            Claim Settled ✓
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
