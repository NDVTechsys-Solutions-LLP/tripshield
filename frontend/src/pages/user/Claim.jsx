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
    "Policy Number": find("Vehicle Insurance")?.doc_number || "Not on file",
    "Registration": find("Vehicle RC")?.doc_number || vehicle?.reg_no || "—",
    "Vehicle": vehicle?.model || "—",
    "Driving License": find("Driving License")?.doc_number || "Not on file",
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
        toast.success("Claim package submitted to insurer");
        api.get("/claims").then((res) => setClaims(res.data));
      }, 1400);
    } catch {
      setSubmitting(false);
      toast.error("Submission failed");
    }
  };

  return (
    <div className="hsj-fade-up max-w-5xl space-y-8">
      {/* Header */}
      <div>
        <p className="text-xs font-bold tracking-wider text-[#e60012] uppercase mb-2">
          Post-Ride Incident Recovery
        </p>
        <h1 className="font-display font-extrabold text-white text-3xl sm:text-4xl uppercase tracking-tight">
          One-Tap Insurance Claim
        </h1>
        <p className="text-slate-400 mt-2 font-body text-sm sm:text-base max-w-2xl">
          Auto-assembles your crash telematics, vehicle VIN, and registered documents into an instant FNOL filing.
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Data Package Card */}
        <div className="lg:col-span-7 rounded-2xl border border-white/10 bg-[#0c111d] p-6 sm:p-7 shadow-xl">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-bold text-white text-lg uppercase tracking-wide flex items-center gap-2">
              <FileText size={18} className="text-[#e60012]" /> Auto-Assembled Claim Package
            </h2>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
              Verified
            </span>
          </div>

          <div className="space-y-2.5">
            {Object.entries(pkg).map(([k, v]) => (
              <div key={k} className="flex items-center justify-between rounded-xl bg-[#090d16] border border-white/10 px-4 py-3">
                <span className="text-xs text-slate-400 uppercase tracking-wide font-semibold">{k}</span>
                <span className={`text-xs font-semibold ${String(v).includes("Not") ? "text-amber-400" : "text-white"}`}>{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Submit & Insurer Selection */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-2xl border border-white/10 bg-[#0c111d] p-6 sm:p-7 shadow-xl">
            <h3 className="font-display font-bold text-white uppercase tracking-wide text-base mb-4 flex items-center gap-2">
              <Landmark size={18} className="text-[#3b82f6]" /> Select Insurer
            </h3>
            <div className="grid grid-cols-2 gap-2.5">
              {INSURERS.map((ins) => (
                <button
                  key={ins}
                  type="button"
                  data-testid="insurer-option"
                  onClick={() => setInsurer(ins)}
                  className={`rounded-xl border px-3 py-2.5 text-xs font-semibold transition-all cursor-pointer ${
                    insurer === ins
                      ? "border-[#e60012] bg-[#e60012]/15 text-white font-semibold shadow-[0_0_12px_rgba(230,0,18,0.2)]"
                      : "border-white/10 bg-[#090d16] text-slate-400 hover:text-white hover:border-white/25"
                  }`}
                >
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
              className="w-full py-4 rounded-xl bg-[#e60012] hover:bg-[#cc0010] disabled:opacity-60 text-white font-display font-bold uppercase tracking-wider text-xs transition-all flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(230,0,18,0.4)] cursor-pointer"
            >
              {submitting ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
              <span>{submitting ? "Transmitting FNOL package…" : "Submit Claim · One Tap"}</span>
            </button>
          ) : (
            <div data-testid="claim-success" className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center hsj-fade-up shadow-xl">
              <CheckCircle2 className="text-emerald-400 mx-auto" size={40} />
              <p className="font-display font-bold text-white text-lg mt-3 uppercase">Claim Transmitted</p>
              <p className="text-xs text-slate-400 font-medium mt-1">{claim.insurer}</p>
              <div className="mt-4 flex items-center justify-between rounded-xl bg-[#090d16] border border-white/10 px-4 py-2.5">
                <span className="text-xs text-emerald-300 font-bold tracking-wider uppercase">{claim.claim_ref}</span>
                <button
                  type="button"
                  onClick={() => { navigator.clipboard?.writeText(claim.claim_ref); toast.success("Claim reference copied"); }}
                  className="text-slate-400 hover:text-white p-1 cursor-pointer"
                  title="Copy reference"
                >
                  <Copy size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Claims History */}
      {claims.length > 0 && (
        <div className="rounded-2xl border border-white/10 bg-[#0c111d] p-6 sm:p-7 shadow-xl">
          <h2 className="font-display font-bold text-white text-lg uppercase tracking-wide mb-4 flex items-center gap-2">
            <Clock size={18} className="text-[#e60012]" /> Submitted Claim Records
          </h2>
          <div className="space-y-2">
            {claims.map((c) => (
              <button
                key={c.claim_id}
                type="button"
                data-testid="claim-history-row"
                onClick={() => setSelected(c)}
                className="w-full flex items-center gap-4 text-sm p-4 rounded-xl hover:bg-white/[0.02] border border-white/5 hover:border-white/15 transition-all text-left cursor-pointer"
              >
                <ShieldCheck size={18} style={{ color: statusColor(c.status) }} />
                <span className="text-xs text-white font-bold tracking-wider uppercase">{c.claim_ref}</span>
                <span className="text-slate-400 flex-1 truncate text-xs font-body">{c.insurer}</span>
                {c.photos?.length > 0 && (
                  <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
                    <Camera size={11} /> {c.photos.length} photos
                  </span>
                )}
                <span
                  className="rounded-lg px-2.5 py-1 text-xs font-semibold uppercase tracking-wider border"
                  style={{
                    background: `${statusColor(c.status)}15`,
                    borderColor: `${statusColor(c.status)}40`,
                    color: statusColor(c.status),
                  }}
                >
                  {c.status?.replace("_", " ")}
                </span>
                <ChevronRight size={16} className="text-slate-500" />
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
      toast.success("Claim stage updated");
    } catch {
      toast.error("Update failed");
    } finally {
      setBusy(false);
    }
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
      toast.success("Crash photos attached to claim");
    } catch {
      toast.error("Upload failed");
    }
  };

  return (
    <Dialog open={!!claim} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bg-[#0c111d] border-white/10 text-white backdrop-blur-xl max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl">
        <DialogHeader>
          <DialogTitle className="font-display uppercase tracking-wide flex items-center gap-2 text-xl">
            <FileText className="text-[#e60012]" size={20} /> {claim.claim_ref}
          </DialogTitle>
          <DialogDescription className="text-slate-400 text-xs font-medium">
            {claim.insurer} · Real-time FNOL settlement tracker
          </DialogDescription>
        </DialogHeader>

        <div className="mt-3" data-testid="claim-stage-tracker">
          {CLAIM_STAGES.map((s, i) => {
            const done = i <= curIdx;
            const entry = (claim.timeline || []).find((t) => t.key === s.key);
            return (
              <div key={s.key} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 border"
                    style={{
                      background: done ? "#10b98120" : "#090d16",
                      borderColor: done ? "#10b981" : "#26304a",
                    }}
                  >
                    {done ? <CheckCircle2 size={15} className="text-emerald-400" /> : <Circle size={10} className="text-slate-600" />}
                  </div>
                  {i < CLAIM_STAGES.length - 1 && (
                    <div className="w-0.5 flex-1 min-h-[26px]" style={{ background: i < curIdx ? "#10b981" : "#26304a" }} />
                  )}
                </div>
                <div className="pb-4">
                  <p className={`font-display font-bold text-sm ${done ? "text-white" : "text-slate-500"}`}>{s.label}</p>
                  {entry ? (
                    <p className="text-xs text-slate-400 font-medium mt-0.5">{entry.note} · {new Date(entry.at).toLocaleString()}</p>
                  ) : (
                    <p className="text-xs text-slate-500 font-medium mt-0.5">Pending</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="rounded-xl bg-[#090d16] border border-white/10 p-4">
          <p className="text-xs font-bold tracking-wider text-slate-400 uppercase mb-2 flex items-center gap-2">
            <Camera size={12} /> On-Scene Damage Photos ({(claim.photos || []).length})
          </p>
          <div className="grid grid-cols-4 gap-2">
            {(claim.photos || []).map((p, i) => (
              <img key={i} src={p} alt="" className="w-full h-16 object-cover rounded-lg border border-white/10" />
            ))}
            <button
              type="button"
              data-testid="claim-add-photo-button"
              onClick={() => fileRef.current?.click()}
              className="h-16 rounded-lg border border-dashed border-white/20 flex items-center justify-center text-slate-500 hover:border-[#e60012]/50 hover:text-white transition-colors cursor-pointer"
            >
              <Upload size={16} />
            </button>
          </div>
          <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={onFiles} />
        </div>

        {claim.status !== "settled" ? (
          <button
            type="button"
            data-testid="claim-advance-button"
            onClick={advance}
            disabled={busy}
            className="w-full py-3 rounded-xl bg-[#e60012] hover:bg-[#cc0010] disabled:opacity-60 text-white font-display font-bold uppercase tracking-wider text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
          >
            {busy ? <Loader2 className="animate-spin" size={16} /> : <ArrowRight size={16} />}
            <span>Advance To Next Review Stage</span>
          </button>
        ) : (
          <div className="text-center rounded-xl bg-emerald-500/10 border border-emerald-500/30 py-3 font-display font-bold uppercase text-emerald-300 text-xs">
            Claim Settled &amp; Archived ✓
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
