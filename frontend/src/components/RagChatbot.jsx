import React, { useState, useEffect, useRef } from "react";
import { TripShieldMark } from "@/components/BrandMark";
import api from "@/lib/api";
import {
  X,
  Search,
  ChevronRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";

// ========================================================
// TRIPSHIELD VERIFIED KNOWLEDGE BASE
// ========================================================
const RAG_KNOWLEDGE = [
  {
    id: "kb-crash-detect",
    category: "Emergency & SOS",
    question: "How does autonomous crash detection work if I cannot reach my phone?",
    keywords: ["crash", "accident", "detect", "autonomous", "unconscious", "phone", "sensor", "g-force", "impact"],
    summary: "High-G impact sensors trigger an automatic 15-second safety countdown that auto-escalates to 112 ERSS if unanswered.",
    answer:
      "TripShield runs an onboard multi-axis accelerometer and gyro watchdog. When high-G impact or abnormal deceleration followed by vehicle stillness is detected, a 15-second safety check-in countdown initiates with loud audible cues. If you cannot tap 'I am Safe' before time expires, TripShield autonomously dispatches your exact GPS coordinates, medical vital stats, and vehicle profile to 112 ERSS and alerts your family on WhatsApp.",
    quickAction: "15s Auto Escalation",
  },
  {
    id: "kb-erss-112",
    category: "Emergency & SOS",
    question: "What is 112 ERSS integration and what information is transmitted?",
    keywords: ["112", "erss", "police", "ambulance", "emergency", "dispatch", "first responder", "medical", "blood group"],
    summary: "Instant transmission of coordinates, rider medical profile, vehicle registration, and audio dispatch script to national responders.",
    answer:
      "112 ERSS is India's National Emergency Response Support System. TripShield transmits an encrypted dispatch packet directly to emergency routing servers. It contains: (1) Precise live GPS coordinates + Google Maps routing link, (2) Rider blood group and recorded medical allergies, (3) Vehicle make, model, and registration plate, and (4) An AI-synthesized 80-word voice script for 112 operators to deploy immediate medical and police assistance.",
    quickAction: "National ERSS Link",
  },
  {
    id: "kb-audio-sos",
    category: "Emergency & SOS",
    question: "How does the silent 60-second emergency audio recording work?",
    keywords: ["audio", "recording", "voice", "microphone", "sound", "evidence", "silent", "60s", "ambient"],
    summary: "Automatic hands-free capture of 60 seconds of ambient audio attached directly to the secure emergency link.",
    answer:
      "When an incident or SOS triggers, TripShield's secure background service activates the microphone hands-free to record 60 seconds of ambient cockpit audio. This audio clip is encrypted and linked directly to your secure incident dashboard so verified family members and triage coordinators can evaluate the situation (e.g. ambient traffic noise, verbal distress) without requiring you to hold the phone.",
    quickAction: "60s Ambient Audio",
  },
  {
    id: "kb-family-link",
    category: "Family Network",
    question: "Do my family members or emergency contacts need to install an app?",
    keywords: ["family", "app", "install", "download", "whatsapp", "sms", "link", "browser", "contacts"],
    summary: "Zero installation required. Loved ones open a private token-gated live tracking link via WhatsApp or SMS in any browser.",
    answer:
      "No. Zero installation is required. TripShield is a web platform. When you start any journey, TripShield generates a secure, token-gated tracking link sent via WhatsApp and SMS. Loved ones simply tap the link to watch your live route progress, current speed, and vehicle telemetry in real-time in any web browser.",
    quickAction: "Instant Browser Access",
  },
  {
    id: "kb-unplanned-stop",
    category: "Route Guard",
    question: "What happens if I stop for fuel, tea, or take an unplanned detour?",
    keywords: ["stop", "fuel", "tea", "detour", "deviation", "checkin", "false alarm", "route"],
    summary: "A calm 15-second safety prompt appears. Tapping 'I am Safe' closes it instantly with zero false alarms sent to family.",
    answer:
      "TripShield is built to prevent false alarms. If you halt at an unscheduled location or divert significantly from your route, our Route Guard displays a prompt: 'Are you safe?'. A single tap on 'I am Safe' dismisses the check-in immediately. Emergency services and family are NEVER bothered unless the 15-second countdown expires with zero response.",
    quickAction: "15s False-Alarm Guard",
  },
  {
    id: "kb-dead-zones",
    category: "Route Guard",
    question: "Does safety monitoring still work in rural dead zones or low network areas?",
    keywords: ["offline", "network", "dead zone", "rural", "signal", "internet", "coverage", "cache", "no signal"],
    summary: "Local telemetry and impact monitoring continue offline on-device; all breadcrumbs auto-sync the moment connectivity returns.",
    answer:
      "Yes. The TripShield sensor watchdog runs locally on your smartphone processor. It caches GPS coordinates, velocity curves, and impact signatures even with zero cellular signal. If an incident occurs offline, emergency SMS dispatch triggers via base GSM towers, and full telemetry syncs to cloud servers the second mobile data resumes.",
    quickAction: "Offline Sensor Watchdog",
  },
  {
    id: "kb-hardware-obd",
    category: "Hardware & Vehicles",
    question: "Do I need to purchase a physical OBD-II device to use TripShield?",
    keywords: ["obd", "hardware", "device", "dongle", "buy", "sensor", "scanner", "bluetooth", "phone only"],
    summary: "Works standalone on any smartphone. Optional Bluetooth OBD-II scanners can be paired for deep mechanical telemetry.",
    answer:
      "No hardware purchase is required. TripShield functions completely using your smartphone's built-in accelerometer, gyroscope, and GPS hardware. However, if you want live mechanical metrics (engine RPM, real-time battery voltage, diagnostics trouble codes), you can pair any standard Bluetooth OBD-II scanner with the platform via Bluetooth.",
    quickAction: "No Hardware Required",
  },
  {
    id: "kb-vehicles-supported",
    category: "Hardware & Vehicles",
    question: "Which vehicles are supported (2-wheelers vs 4-wheelers)?",
    keywords: ["vehicle", "bike", "scooter", "car", "scooty", "motorcycle", "honda", "activa", "shine", "elevate", "city", "ev"],
    summary: "All two-wheelers (Honda Activa, Shine, CB350, EVs) and four-wheelers (Elevate, City, Amaze, fleet vehicles) supported.",
    answer:
      "TripShield supports both two-wheelers (Honda Activa, Dio, Shine, SP125, CB350, electric scooters) and four-wheelers (Honda Elevate, City, Amaze, commercial fleet cars). The motion algorithm automatically adapts its sensitivity thresholds depending on whether you configure your vehicle as a two-wheeler or four-wheeler during onboarding.",
    quickAction: "2-Wheeler & 4-Wheeler Ready",
  },
  {
    id: "kb-insurance-claim",
    category: "Claims & Service",
    question: "How does the 1-Tap Insurance Claim (FNOL) process work?",
    keywords: ["claim", "insurance", "fnol", "notice of loss", "damage", "icici", "hdfc", "bajaj", "payout", "fir"],
    summary: "Automated First Notice of Loss pre-filled with impact telemetry and GPS time sent to top insurers and dealer body shops.",
    answer:
      "In the event of vehicle damage or collision, TripShield compiles a verified First Notice of Loss (FNOL). It auto-populates impact force, exact location, date/time, and vehicle registration. With one tap from `/app/claim`, your dossier is forwarded directly to your insurer (ICICI Lombard, HDFC ERGO, Bajaj Allianz) and your chosen Honda Authorized Service Center for immediate towing and cashless repair.",
    quickAction: "1-Tap Instant FNOL",
  },
  {
    id: "kb-dealer-portal",
    category: "Claims & Service",
    question: "What is the Service Center / Dealer Command Center?",
    keywords: ["dealer", "service center", "workshop", "portal", "command center", "towing", "repair", "honda dealer"],
    summary: "Authorized dealer portal for real-time fleet triage, roadside recovery dispatch, and cashless repair coordination.",
    answer:
      "Authorized Honda Service Centers log into the Dealer Portal (`/dealer`) to monitor active incidents across their operating territory. When a breakdown or collision happens, service technicians receive live telematics alerts to dispatch roadside recovery vehicles, prepare replacement parts, and initiate insurance claim verification before the vehicle even arrives at the workshop.",
    quickAction: "Dealer Radar Hub",
  },
  {
    id: "kb-autocare-pulse",
    category: "AutoCare Pulse",
    question: "What is AutoCare Pulse and how does it connect with TripShield?",
    keywords: ["autocare", "autocare pulse", "monafa", "ecosystem", "maintenance", "service", "health", "workshop"],
    summary: "Vehicle mechanical health diagnostics companion predicting component wear and automating scheduled maintenance.",
    answer:
      "AutoCare Pulse (https://autocare.tripshield.org/) is our sister ecosystem platform focusing on vehicle longevity and predictive mechanical health. While TripShield protects the rider during transit with emergency safety networks, AutoCare Pulse tracks engine diagnostics, predicts brake/battery wear, and streamlines automated workshop appointments.",
    quickAction: "Explore AutoCare Pulse",
  },
  {
    id: "kb-privacy-security",
    category: "Privacy & Security",
    question: "How is my medical data and personal location kept private?",
    keywords: ["privacy", "security", "data", "location", "medical", "encrypted", "leak", "tracking", "who sees"],
    summary: "Bank-grade encryption; medical data and location tokens expire immediately upon safe trip completion.",
    answer:
      "TripShield uses end-to-end tokenization and strict access control. Your medical context (blood group, allergies) is encrypted at rest and is only decipherable when an active SOS incident is initiated. Live location links are temporary tokens that terminate automatically the moment you finish your journey.",
    quickAction: "Encrypted & Ephemeral",
  },
];

// Helper to filter knowledge base by search query
function searchKnowledge(query) {
  if (!query || !query.trim()) return RAG_KNOWLEDGE;

  const clean = query.toLowerCase().trim();
  const terms = clean.split(/\s+/).filter((t) => t.length > 1);

  if (terms.length === 0) return RAG_KNOWLEDGE;

  const scored = RAG_KNOWLEDGE.map((item) => {
    let score = 0;
    const itemQuestion = item.question.toLowerCase();
    const itemAnswer = item.answer.toLowerCase();
    const itemKeywords = item.keywords.map((k) => k.toLowerCase());

    // Exact or phrase match
    if (itemQuestion.includes(clean)) score += 15;
    if (itemAnswer.includes(clean)) score += 6;

    // Term-by-term scoring
    terms.forEach((term) => {
      if (itemQuestion.includes(term)) score += 5;
      if (itemKeywords.some((k) => k.includes(term))) score += 4;
      if (itemAnswer.includes(term)) score += 2;
    });

    return { item, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((s) => s.item);
}

export default function RagChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [isLoadingAnswer, setIsLoadingAnswer] = useState(false);
  const [answerError, setAnswerError] = useState(null);

  // Question reporting state
  const [reportQuestionText, setReportQuestionText] = useState("");
  const [reportEmail, setReportEmail] = useState("");
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);
  const [reportError, setReportError] = useState(null);

  const scrollContainerRef = useRef(null);

  // Scroll to top when view changes
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [selectedQuestion]);

  // Handle selecting a question
  const handleSelectQuestion = (item) => {
    setAnswerError(null);
    setIsLoadingAnswer(true);

    // Subtle retrieval transition for smooth visual feedback
    setTimeout(() => {
      if (!item || !item.answer) {
        setAnswerError("Could not retrieve answer. Please try again.");
      } else {
        setSelectedQuestion(item);
      }
      setIsLoadingAnswer(false);
    }, 120);
  };

  // Handle submitting an unlisted question to admin
  const handleReportSubmit = async (e) => {
    e.preventDefault();
    const trimmed = reportQuestionText.trim();
    if (!trimmed) return;

    setIsSubmittingReport(true);
    setReportError(null);
    setReportSuccess(false);

    const payload = {
      question: trimmed,
      category: selectedQuestion ? selectedQuestion.category : "General Support",
      email: reportEmail.trim(),
      phone: "",
      user_context: "Help & Support Chatbot",
    };

    try {
      const res = await api.post("/support/report-question", payload);
      if (res.data && res.data.ok) {
        setReportSuccess(true);
        setReportQuestionText("");
        setReportEmail("");
        setTimeout(() => setReportSuccess(false), 5000);
      } else {
        setReportError(res.data?.detail || "Could not record report. Please try again.");
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.detail ||
        err.message ||
        "Could not submit question. Please check your connection and retry.";
      setReportError(errorMsg);
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const filteredQuestions = searchKnowledge(searchQuery);

  return (
    <div className="rag-chatbot-root">
      {/* ======================================================== */}
      {/* 1. FLOATING LAUNCHER BUTTON (Bottom-Right)               */}
      {/* ======================================================== */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          id="tripshield-ragbot-launcher"
          data-testid="ragbot-launcher-btn"
          aria-label={isOpen ? "Close Help & Support" : "Open Help & Support"}
          onClick={() => setIsOpen((prev) => !prev)}
          className={`flex items-center justify-center w-14 h-14 rounded-2xl transition-all duration-200 shadow-xl cursor-pointer ${
            isOpen
              ? "bg-[#161d2c] border border-white/20 text-white"
              : "bg-[#0c1017] border border-[#e60012] text-white hover:border-[#ff2e3b] hover:bg-[#121824]"
          }`}
        >
          {isOpen ? (
            <X size={22} className="text-slate-300" />
          ) : (
            <TripShieldMark size={28} glow={false} />
          )}
        </button>
      </div>

      {/* ======================================================== */}
      {/* 2. CHATBOT WINDOW (Simplified, Friendly, Clean)          */}
      {/* ======================================================== */}
      {isOpen && (
        <div
          id="tripshield-ragbot-modal"
          data-testid="ragbot-chat-window"
          className="fixed bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[420px] max-h-[82vh] h-[600px] flex flex-col rounded-2xl border border-white/10 bg-[#0c1017] shadow-2xl overflow-hidden backdrop-blur-xl animate-in fade-in duration-150"
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-white/10 bg-[#0f141f] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <TripShieldMark size={22} glow={false} />
              <div>
                <h2 className="text-base font-bold text-white tracking-tight leading-tight">
                  Help &amp; Support
                </h2>
                <p className="text-xs text-slate-400 mt-0.5 leading-none">
                  Find answers to your questions.
                </p>
              </div>
            </div>

            <button
              data-testid="ragbot-close-btn"
              onClick={() => setIsOpen(false)}
              aria-label="Close Help & Support"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Main Scrollable Body */}
          <div
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto rag-chatbot-scroll"
          >
            {/* VIEW A: ANSWER DISPLAY */}
            {selectedQuestion ? (
              <div className="p-5 space-y-4">
                <button
                  data-testid="ragbot-back-btn"
                  onClick={() => setSelectedQuestion(null)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer py-1"
                >
                  <ArrowLeft size={14} />
                  <span>Back to questions</span>
                </button>

                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
                    {selectedQuestion.question}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Topic: {selectedQuestion.category}
                  </p>
                </div>

                {isLoadingAnswer ? (
                  <div className="py-8 flex flex-col items-center justify-center gap-2 text-slate-400">
                    <Loader2 size={20} className="animate-spin text-[#e60012]" />
                    <span className="text-xs">Loading answer...</span>
                  </div>
                ) : answerError ? (
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
                    {answerError}
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    <p className="text-[15px] sm:text-base text-slate-200 leading-[1.65]">
                      {selectedQuestion.answer}
                    </p>

                    {selectedQuestion.summary && (
                      <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 text-xs text-slate-300 leading-relaxed">
                        <strong className="text-white block mb-0.5">Key Point:</strong>
                        {selectedQuestion.summary}
                      </div>
                    )}

                    <div className="pt-2 border-t border-white/5 text-xs text-slate-400">
                      <span>Need immediate road assistance? Dial 112 directly.</span>
                    </div>

                    <div className="pt-1">
                      <button
                        onClick={() => {
                          setReportQuestionText(selectedQuestion.question);
                          setSelectedQuestion(null);
                        }}
                        className="text-xs text-[#ff4d5a] hover:text-[#ff7882] underline cursor-pointer"
                      >
                        Have a more specific question about this? Report to our team →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* VIEW B: FREQUENTLY ASKED QUESTIONS LIST */
              <div>
                {/* Search Bar */}
                <div className="p-4 border-b border-white/5 bg-[#0a0e17]">
                  <div className="relative">
                    <Search
                      size={15}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    />
                    <input
                      id="ragbot-input"
                      data-testid="ragbot-query-input"
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search questions..."
                      className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-[#121824] border border-white/10 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-[#e60012] focus:ring-1 focus:ring-[#e60012] transition-colors"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery("")}
                        aria-label="Clear search"
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 cursor-pointer"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Questions List */}
                <div className="divide-y divide-white/5">
                  {filteredQuestions.length > 0 ? (
                    filteredQuestions.map((item) => (
                      <button
                        key={item.id}
                        data-testid={`ragbot-q-${item.id}`}
                        onClick={() => handleSelectQuestion(item)}
                        className="w-full py-3.5 px-5 text-left flex items-center justify-between gap-3 text-slate-200 hover:text-white hover:bg-white/[0.03] transition-colors cursor-pointer group"
                      >
                        <span className="text-sm font-medium leading-relaxed">
                          {item.question}
                        </span>
                        <ChevronRight
                          size={16}
                          className="text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0"
                        />
                      </button>
                    ))
                  ) : (
                    <div className="p-6 text-center text-slate-400 space-y-2">
                      <p className="text-sm">No questions match &ldquo;{searchQuery}&rdquo;</p>
                      <button
                        onClick={() => setReportQuestionText(searchQuery)}
                        className="text-xs text-[#ff4d5a] hover:text-[#ff7882] underline cursor-pointer"
                      >
                        Report &ldquo;{searchQuery}&rdquo; to our team →
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ======================================================== */}
          {/* 3. REPORT A QUESTION SECTION ("Can't find your answer?") */}
          {/* ======================================================== */}
          <div className="p-4 sm:p-5 border-t border-white/10 bg-[#0f141f] shrink-0">
            <div className="mb-2.5">
              <h4 className="text-sm font-bold text-white tracking-tight">
                Can&apos;t find your answer?
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Submit your question and our safety team will review it.
              </p>
            </div>

            <form onSubmit={handleReportSubmit} className="space-y-2">
              <input
                data-testid="ragbot-report-textarea"
                type="text"
                value={reportQuestionText}
                onChange={(e) => setReportQuestionText(e.target.value)}
                placeholder="Type your question..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#07090e] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#e60012] transition-colors"
              />

              <div className="flex items-center gap-2">
                <input
                  data-testid="ragbot-report-email"
                  type="email"
                  value={reportEmail}
                  onChange={(e) => setReportEmail(e.target.value)}
                  placeholder="Your email (optional)"
                  className="flex-1 px-3.5 py-2 rounded-xl bg-[#07090e] border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-[#e60012] transition-colors"
                />

                <button
                  type="submit"
                  data-testid="ragbot-report-submit-btn"
                  disabled={isSubmittingReport || !reportQuestionText.trim()}
                  className="px-4 py-2 rounded-xl bg-[#e60012] hover:bg-[#cc0010] text-white text-xs font-semibold shrink-0 transition-colors disabled:opacity-40 cursor-pointer shadow-sm flex items-center gap-1.5"
                >
                  {isSubmittingReport ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <span>Report a Question</span>
                  )}
                </button>
              </div>

              {/* Status Notifications */}
              {reportSuccess && (
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                  <CheckCircle2 size={14} className="shrink-0" />
                  <span>Question received! Our team will review and update the guide.</span>
                </div>
              )}

              {reportError && (
                <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{reportError}</span>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
