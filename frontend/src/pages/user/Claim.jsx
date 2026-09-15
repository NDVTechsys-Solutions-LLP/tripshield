import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import {
  FileText, Landmark, CheckCircle2, Loader2, ShieldCheck, Sparkles, Copy,
} from "lucide-react";

const INSURERS = ["Honda Assure", "ICICI Lombard", "Bajaj Allianz", "HDFC ERGO"];

export default function Claim() {
  const [docs, setDocs] = useState([]);
  const [vehicle, setVehicle] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [journeys, setJourneys] = useState([]);
  const [insurer, setInsurer] = useState("Honda Assure");
  const [submitting, setSubmitting] = useState(false);
  const [claim, setClaim] = useState(null);
  const [claims, setClaims] = useState([]);

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
          <h2 className="font-display font-bold text-white uppercase tracking-wide mb-4">Claim History</h2>
          <div className="space-y-2">
            {claims.map((c) => (
              <div key={c.claim_id} className="flex items-center gap-3 text-sm py-2 border-b border-white/5 last:border-0">
                <ShieldCheck className="text-emerald-400" size={16} />
                <span className="font-mono text-white">{c.claim_ref}</span>
                <span className="text-slate-500 flex-1">{c.insurer}</span>
                <span className="rounded-full bg-emerald-500/15 text-emerald-400 px-2.5 py-0.5 font-mono text-[10px] uppercase">{c.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
