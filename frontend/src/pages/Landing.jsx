import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { TripShieldMark } from "@/components/BrandMark";
import ScrollStoryCar from "@/components/ScrollStoryCar";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Bike,
  Building2,
  Navigation,
  Users,
  Radio,
  Mic,
  ArrowRight,
  Heart,
  Phone,
  FileText,
  CheckCircle2,
  MapPin,
  Clock,
  ChevronDown,
  Activity,
  Volume2,
  VolumeX,
  Wrench,
  ExternalLink,
  X,
} from "lucide-react";

// AutoCare Pulse Frontend Website Link
const AUTOCARE_PULSE_URL = "https://autocare.tripshield.org/";

// ========================================================
// REFINED MINIMAL DATA DEFINITIONS (Single-Line, Simple)
// ========================================================
const WHY_POINTS = [
  {
    icon: Clock,
    title: "Instant Rescue",
    tagline: "Autonomous dispatch when reaching for a phone is impossible.",
    tags: ["15s Check-In", "Crash Sensing"],
  },
  {
    icon: Users,
    title: "Family Peace of Mind",
    tagline: "Live WhatsApp route link with zero app installation.",
    tags: ["Zero Install", "Auto Arrival"],
  },
  {
    icon: Heart,
    title: "Emergency Context",
    tagline: "Critical medical data and ambient audio sent to 112 ERSS.",
    tags: ["Blood Group", "60s Audio"],
  },
];

const CORE_FEATURES = [
  {
    icon: Navigation,
    category: "riding",
    title: "Live Cockpit",
    tagline: "Turn-by-turn routing with real-time speed and battery telemetry.",
    points: ["Live GPS", "Route Progress"],
  },
  {
    icon: Users,
    category: "riding",
    title: "Family Link",
    tagline: "One-tap live tracking shared directly to WhatsApp and SMS.",
    points: ["Zero Install", "Arrival Ping"],
  },
  {
    icon: Radio,
    category: "emergency",
    title: "Route Guard",
    tagline: "Automated 15-second safety prompt on unexpected path stops.",
    points: ["Deviation Alert", "False-Alarm Proof"],
  },
  {
    icon: Mic,
    category: "emergency",
    title: "Silent Audio SOS",
    tagline: "Automatic 60-second microphone capture during incidents.",
    points: ["Hands-Free", "Family Shared"],
  },
  {
    icon: Phone,
    category: "emergency",
    title: "112 ERSS Dispatch",
    tagline: "Direct coordinates and caller-ID link to national emergency services.",
    points: ["Exact GPS", "Rapid Response"],
  },
  {
    icon: FileText,
    category: "riding",
    title: "One-Tap Claim",
    tagline: "Fast Notice of Loss auto-filled with crash impact telemetry.",
    points: ["Instant FNOL", "Top Insurers"],
  },
];

const WORKFLOW_STEPS = [
  {
    num: "01",
    title: "Plan & Share",
    desc: "Set route and share private tracking link with family.",
    badge: "Instant Share",
  },
  {
    num: "02",
    title: "Ride Monitored",
    desc: "Live cockpit tracks path, speed, and vehicle telemetry.",
    badge: "Real-Time GPS",
  },
  {
    num: "03",
    title: "Arrive Protected",
    desc: "Family is auto-notified; emergency net on standby.",
    badge: "Auto Safe Arrival",
  },
];

const FAQS = [
  {
    question: "Does my family need to install an app to track my journey?",
    answer:
      "No. TripShield generates a secure, token-gated web tracking link that works instantly on WhatsApp, SMS, and any browser without installing an app.",
  },
  {
    question: "How does the emergency audio recording work?",
    answer:
      "When an incident is triggered or a check-in goes unanswered, TripShield records up to 60 seconds of ambient audio and attaches it to the incident link for family.",
  },
  {
    question: "What happens if I make an unplanned stop or change my route?",
    answer:
      "A calm 15-second check-in appears on your screen. Confirming you are safe closes it immediately without alerting anyone.",
  },
  {
    question: "Can I use TripShield for both two-wheelers and four-wheelers?",
    answer:
      "Yes. TripShield supports major Indian motorcycles, scooters, electric vehicles, and cars with adaptive vehicle telematics.",
  },
  {
    question: "How is my medical data and personal information secured?",
    answer:
      "Your medical details and contacts are encrypted and only surfaced in the emergency broadcast when an active SOS incident is initiated.",
  },
  {
    question: "What is the role of the Service Center / Dealer Command Center?",
    answer:
      "Authorized service centers monitor active fleet journeys in their operating region, triaging incidents to dispatch rapid roadside recovery.",
  },
];

export default function Landing() {
  const { user, loading, login } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("home");
  const [featureCategory, setFeatureCategory] = useState("all");
  const [openFaq, setOpenFaq] = useState(0);

  // Minimalist Login Modal State
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [loginRole, setLoginRole] = useState("dealer");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate(user.role === "dealer" ? "/dealer" : "/app");
  }, [user, loading, navigate]);

  const openLoginModal = (role) => {
    setLoginRole(role);
    setLoginEmail(role === "dealer" ? "ndvtechsys.solutions@gmail.com" : "");
    setLoginPassword("");
    setLoginError("");
    setLoginModalOpen(true);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");
    try {
      const loggedUser = await login(loginEmail, loginPassword, loginRole);
      setLoginModalOpen(false);
      navigate(loggedUser.role === "dealer" ? "/dealer" : "/app");
    } catch (err) {
      setLoginError(err.message || "Invalid email or password");
    } finally {
      setLoginLoading(false);
    }
  };

  const scrollToSection = (id, tabName) => {
    setActiveTab(tabName);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const toggleFaq = (idx) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  const filteredFeatures =
    featureCategory === "all"
      ? CORE_FEATURES
      : CORE_FEATURES.filter((f) => f.category === featureCategory);

  return (
    <div className="min-h-screen bg-[#07090e] text-white selection:bg-[#e60012]/30 selection:text-white">
      {/* ======================================================== */}
      {/* 1. PROFESSIONAL TOP BAR (Floating Capsule)               */}
      {/* ======================================================== */}
      <header className="fixed top-0 left-0 right-0 z-50 pt-4 px-4 sm:px-6 pointer-events-none">
        <div className="max-w-5xl mx-auto pointer-events-auto rounded-full bg-[#0a0f1b]/85 backdrop-blur-xl border border-white/10 px-4 sm:px-6 py-2.5 shadow-2xl flex items-center justify-between">
          {/* Brand Logo & Wordmark */}
          <button
            onClick={() => scrollToSection("hero", "home")}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <TripShieldMark size={28} glow />
            <span className="font-display font-extrabold text-[#e60012] text-lg tracking-wide">
              TRIPSHIELD
            </span>
          </button>

          {/* Clean Navigation Links */}
          <nav className="flex items-center gap-1">
            {[
              { id: "hero", label: "Home", tab: "home" },
              { id: "story-journey", label: "Journey", tab: "journey" },
              { id: "why-tripshield", label: "Overview", tab: "why" },
              { id: "features-section", label: "Features", tab: "features" },
              { id: "how-it-works", label: "Workflow", tab: "workflow" },
              { id: "faq-section", label: "FAQ", tab: "faq" },
            ].map((n) => (
              <button
                key={n.id}
                onClick={() => scrollToSection(n.id, n.tab)}
                className={`px-3.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer font-medium ${activeTab === n.tab
                    ? "text-white font-semibold bg-white/10 shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
              >
                {n.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* ======================================================== */}
      {/* 2. HERO SECTION (Dark Highway Aesthetic, Simple)         */}
      {/* ======================================================== */}
      <section
        id="hero"
        className="relative min-h-screen flex flex-col justify-between overflow-hidden pt-28 pb-12 sm:pb-16"
      >
        {/* Background Image: Red Curves Highway (Enhanced Visibility) */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none z-0 opacity-90 sm:opacity-95"
          style={{
            backgroundImage: "url('/hero-bg.png')",
          }}
        />

        {/* Refined Ambient Overlays (Preserves background art while keeping text crisp) */}
        {/* Soft bottom blend into the next section */}
        <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#07090e] via-[#07090e]/60 to-transparent pointer-events-none z-0" />
        {/* Soft top blend behind floating navigation capsule */}
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#07090e]/60 to-transparent pointer-events-none z-0" />
        {/* Subtle left-side wash for optimal headline and button readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#07090e]/70 via-[#07090e]/25 to-transparent pointer-events-none z-0" />

        {/* Main Hero Grid */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full my-auto py-10 lg:py-16">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            {/* Left Column: Heading, Subhead & Actions (Clean, No Button Chips) */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="lg:col-span-7 flex flex-col items-start justify-center max-w-2xl pr-0 lg:pr-6"
            >

              <h1 className="font-display font-extrabold text-white text-5xl sm:text-6xl lg:text-7xl tracking-tight uppercase leading-[0.95]">
                GUARDED<span className="text-[#e60012]">.</span>
              </h1>

              <p className="font-body text-slate-300 text-base sm:text-lg mt-5 max-w-lg font-normal leading-relaxed">
                Next-generation safety network for two-wheelers and passenger vehicles. Live navigation, autonomous incident detection, and hands-free family protection on every ride.
              </p>

              {/* Streamlined Direct Portal Access Buttons */}
              <div className="w-full mt-8 space-y-3 max-w-lg">
                {/* Rider Portal Button */}
                <motion.button
                  whileHover={{ y: -2, transition: { type: "spring", stiffness: 400, damping: 25 } }}
                  whileTap={{ scale: 0.98 }}
                  data-testid="login-user-button"
                  onClick={() => openLoginModal("user")}
                  className="group w-full rounded-xl sm:rounded-2xl border border-white/10 bg-[#0c111d]/90 backdrop-blur-sm hover:border-[#e60012]/70 hover:bg-[#121929] transition-all px-4 sm:px-5 py-3 sm:py-3.5 flex items-center justify-between gap-3 shadow-lg cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-[#e60012]/15 flex items-center justify-center text-[#e60012] shrink-0 group-hover:scale-105 transition-transform">
                      <Bike size={20} />
                    </div>
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-display font-bold text-white text-sm sm:text-base truncate">
                        Vehicle Owner / Rider
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="px-3.5 py-1.5 rounded-lg bg-white/10 group-hover:bg-[#e60012] text-xs font-semibold text-white tracking-wide transition-colors">
                      Login
                    </span>
                    <ArrowRight
                      className="text-slate-500 group-hover:text-[#e60012] group-hover:translate-x-0.5 transition-all"
                      size={16}
                    />
                  </div>
                </motion.button>

                {/* Dealer Portal Button */}
                <motion.button
                  whileHover={{ y: -2, transition: { type: "spring", stiffness: 400, damping: 25 } }}
                  whileTap={{ scale: 0.98 }}
                  data-testid="login-dealer-portal-button"
                  onClick={() => openLoginModal("dealer")}
                  className="group w-full rounded-xl sm:rounded-2xl border border-white/10 bg-[#0c111d]/90 backdrop-blur-sm hover:border-[#3b82f6]/70 hover:bg-[#121929] transition-all px-4 sm:px-5 py-3 sm:py-3.5 flex items-center justify-between gap-3 shadow-lg cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-[#3b82f6]/15 flex items-center justify-center text-[#3b82f6] shrink-0 group-hover:scale-105 transition-transform">
                      <Building2 size={20} />
                    </div>
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-display font-bold text-white text-sm sm:text-base truncate">
                        TripShield Service Center
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="px-3.5 py-1.5 rounded-lg bg-white/10 group-hover:bg-[#3b82f6] text-xs font-semibold text-white tracking-wide transition-colors">
                      Login
                    </span>
                    <ArrowRight
                      className="text-slate-500 group-hover:text-[#3b82f6] group-hover:translate-x-0.5 transition-all"
                      size={16}
                    />
                  </div>
                </motion.button>
              </div>
            </motion.div>

            {/* Right Column: Hero Video Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
              className="lg:col-span-5 flex justify-end items-center w-full lg:translate-x-4 xl:translate-x-8"
            >
              <HeroVideoCard />
            </motion.div>
          </div>
        </div>

        {/* Hero Bottom: Scroll Cue */}
        <div className="relative z-10 flex flex-col items-center justify-center gap-2 text-slate-400 mt-2">
          <button
            onClick={() => scrollToSection("story-journey", "journey")}
            className="flex flex-col items-center gap-1.5 text-slate-400 hover:text-white transition-colors cursor-pointer group"
          >
            <span className="text-xs font-semibold tracking-wider text-slate-400 group-hover:text-white uppercase">
              Begin The Journey
            </span>
            <div className="w-5 h-8 rounded-full border border-white/20 flex items-start justify-center p-1 group-hover:border-[#e60012] transition-colors">
              <div className="w-1 h-2 rounded-full bg-[#e60012] animate-bounce" />
            </div>
          </button>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 2.5 CONTINUOUS SCROLL-DRIVEN CAR JOURNEY & STORY        */}
      {/* ======================================================== */}
      <ScrollStoryCar />

      {/* ======================================================== */}
      {/* 3. WHY TRIPSHIELD (Simple, Single-Line Points)           */}
      {/* ======================================================== */}
      <section
        id="why-tripshield"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24 border-t border-white/5"
      >
        <div className="max-w-2xl mb-12">
          <p className="text-xs font-bold tracking-wider text-[#e60012] uppercase mb-2">
            Why TripShield
          </p>
          <h2 className="font-display font-extrabold text-white text-3xl sm:text-4xl uppercase tracking-tight">
            Built for everyday roads
          </h2>
          <p className="text-slate-400 mt-2 font-body text-sm sm:text-base leading-relaxed">
            Three critical safety gaps resolved in one connected platform.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {WHY_POINTS.map((item, idx) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              whileHover={{ y: -4, transition: { type: "spring", stiffness: 400, damping: 25 } }}
              whileTap={{ scale: 0.98 }}
              className="rounded-2xl border border-white/10 bg-[#0c111d] p-6 sm:p-7 flex flex-col justify-between hover:border-white/20 transition-all shadow-xl"
            >
              <div>
                <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#e60012] mb-5">
                  <item.icon size={22} />
                </div>
                <h3 className="font-display font-bold text-white text-xl">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-400 mt-2 font-body leading-relaxed">
                  {item.tagline}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/5 flex flex-wrap items-center gap-3 text-xs text-slate-400 font-medium">
                {item.tags.map((tag) => (
                  <span key={tag} className="flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-[#e60012]" />
                    <span>{tag}</span>
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ======================================================== */}
      {/* 4. CORE FEATURES (React-Native Segmented Filter + Cards) */}
      {/* ======================================================== */}
      <section
        id="features-section"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24 border-t border-white/5"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <p className="text-xs font-bold tracking-wider text-[#e60012] uppercase mb-2">
              Platform Features
            </p>
            <h2 className="font-display font-extrabold text-white text-3xl sm:text-4xl uppercase tracking-tight">
              Six pillars of connected safety
            </h2>
            <p className="text-slate-400 mt-2 font-body text-sm sm:text-base">
              Autonomous protection from key ignition to safe arrival.
            </p>
          </div>

          {/* React Native Web Style Segmented Tab Control */}
          <div className="inline-flex p-1 rounded-xl bg-[#090d16] border border-white/10 self-start md:self-auto">
            {[
              { id: "all", label: "All Features" },
              { id: "riding", label: "Active Riding" },
              { id: "emergency", label: "Emergency Net" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFeatureCategory(tab.id)}
                className={`relative px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${featureCategory === tab.id
                    ? "text-white"
                    : "text-slate-400 hover:text-white"
                  }`}
              >
                {featureCategory === tab.id && (
                  <motion.div
                    layoutId="activeFeatureTab"
                    className="absolute inset-0 rounded-lg bg-[#e60012] shadow-sm"
                    transition={{ type: "spring", stiffness: 450, damping: 35 }}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Feature Cards Grid (Single-Line, Simple) */}
        <motion.div layout className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredFeatures.map((f) => {
              const Icon = f.icon;
              return (
                <motion.div
                  layout
                  key={f.title}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.25 }}
                  whileHover={{ y: -4, transition: { type: "spring", stiffness: 400, damping: 25 } }}
                  whileTap={{ scale: 0.98 }}
                  className="rounded-2xl border border-white/10 bg-[#0c111d] p-6 hover:border-white/20 transition-all flex flex-col justify-between shadow-xl"
                >
                  <div>
                    <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#e60012] mb-4">
                      <Icon size={22} />
                    </div>
                    <h3 className="font-display font-bold text-white text-lg">
                      {f.title}
                    </h3>
                    <p className="text-sm text-slate-400 mt-1.5 font-body leading-relaxed">
                      {f.tagline}
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-white/5 flex items-center gap-3">
                    {f.points.map((p) => (
                      <span key={p} className="text-xs text-slate-300 font-medium">
                        • {p}
                      </span>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </section>

      {/* ======================================================== */}
      {/* 5. HOW IT WORKS (Simple 3 Steps, No Essay Paragraphs)    */}
      {/* ======================================================== */}
      <section
        id="how-it-works"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24 border-t border-white/5"
      >
        <div className="max-w-2xl mb-12">
          <p className="text-xs font-bold tracking-wider text-[#e60012] uppercase mb-2">
            Workflow
          </p>
          <h2 className="font-display font-extrabold text-white text-3xl sm:text-4xl uppercase tracking-tight">
            How a TripShield ride works
          </h2>
          <p className="text-slate-400 mt-2 font-body text-sm sm:text-base">
            Three simple steps from start to arrival.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {WORKFLOW_STEPS.map((step, idx) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              whileHover={{ y: -4, transition: { type: "spring", stiffness: 400, damping: 25 } }}
              whileTap={{ scale: 0.98 }}
              className="rounded-2xl border border-white/10 bg-[#0c111d] p-6 sm:p-7 flex flex-col justify-between hover:border-white/20 transition-all shadow-xl"
            >
              <div>
                <p className="text-xs text-[#e60012] font-mono font-bold tracking-wider uppercase mb-1">
                  Step {step.num}
                </p>
                <h3 className="font-display font-bold text-white text-xl mt-4">
                  {step.title}
                </h3>
                <p className="text-sm text-slate-400 mt-2 font-body leading-relaxed">
                  {step.desc}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/5 text-xs font-semibold text-slate-300 flex items-center gap-2">
                <CheckCircle2 size={14} className="text-[#e60012]" />
                <span>{step.badge}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Live Route Track Simulator in Workflow context */}
        <div data-testid="how-it-protects" id="telemetry-cockpit" className="mt-10">
          <div className="rounded-2xl border border-white/10 bg-[#0c111d] p-5 sm:p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-display font-bold uppercase tracking-wider text-white">
                  Real-Time Journey Cockpit &amp; Telemetry
                </span>
              </div>
              <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                Zero-App Family Web Tracking
              </span>
            </div>
            <TrackPreview />
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 7. FREQUENTLY ASKED QUESTIONS (Simple, Clean, Modern)     */}
      {/* ======================================================== */}
      <section
        id="faq-section"
        className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-20 border-t border-white/5"
      >
        <div className="text-center mb-8">
          <p className="text-xs font-bold tracking-wider text-[#e60012] uppercase mb-1.5">
            Questions &amp; Clarity
          </p>
          <h2 className="font-display font-extrabold text-white text-2xl sm:text-3xl uppercase tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-slate-400 mt-2 font-body text-xs sm:text-sm max-w-md mx-auto">
            Everything you need to know about using TripShield on your rides.
          </p>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className={`rounded-xl border transition-all duration-200 overflow-hidden ${isOpen
                    ? "border-[#e60012]/40 bg-[#0c111d] shadow-lg shadow-[#e60012]/5"
                    : "border-white/10 bg-[#0c111d] hover:border-white/20"
                  }`}
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
                >
                  <span className="font-display font-semibold text-white text-sm sm:text-base leading-snug">
                    {faq.question}
                  </span>
                  <ChevronDown
                    size={18}
                    className={`shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180 text-[#e60012]" : "text-slate-400"
                      }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-4 pt-1 text-sm text-slate-300 font-body leading-relaxed border-t border-white/5">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ======================================================== */}
      {/* 8. AUTOCARE ECOSYSTEM LINK                                */}
      {/* ======================================================== */}
      <section
        id="autocare-ecosystem"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20 border-t border-white/5"
      >
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-[#0c111d] to-[#07090e] p-8 sm:p-12 lg:p-14 shadow-2xl">
          {/* Subtle Diagnostic Blue Ambient Lighting */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#1d4ed8]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#2563eb]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="max-w-2xl">
              <h2 className="font-display font-extrabold text-white text-3xl sm:text-4xl lg:text-5xl uppercase tracking-tight leading-tight">
                DISCOVER <span className="text-[#3b82f6]">AUTOCARE PULSE</span>.
              </h2>

              <p className="font-body text-slate-300 text-sm sm:text-base mt-4 leading-relaxed max-w-xl">
                Complement your safety network with intelligent vehicle health diagnostics. Predictive maintenance alerts, automated workshop scheduling, and live mechanical telemetry for passenger and fleet vehicles.
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-3 text-xs font-mono text-slate-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400" /> Predictive Health
                </span>
                <span>·</span>
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400" /> Workshop Telematics
                </span>
                <span>·</span>
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400" /> Automated Servicing
                </span>
              </div>
            </div>

            {/* AutoCare Navigation Button */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 shrink-0">
              <a
                href={AUTOCARE_PULSE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-3 px-6 py-3.5 rounded-xl font-display font-bold text-white text-sm sm:text-base tracking-wide bg-[#1d4ed8] hover:bg-[#2563eb] border border-[#3b82f6]/40 transition-all shadow-lg shadow-blue-950/40 hover:shadow-blue-600/25 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              >
                <Wrench size={18} className="text-blue-200 group-hover:rotate-12 transition-transform" />
                <span>AutoCare Pulse</span>
                <ArrowRight size={16} className="text-blue-200 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 9. CLEAN REASSURING FOOTER                                */}
      {/* ======================================================== */}
      <footer className="border-t border-white/5 py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-6 text-xs text-slate-400 font-medium">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <TripShieldMark size={22} glow />
            <div>
              <span className="font-display font-extrabold text-[#e60012] tracking-wide text-sm">TRIPSHIELD</span>
              <span className="text-slate-500 ml-2">© 2026 · Powered by NDV Texas Solutions</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-slate-400">
            <span>Zero-Install Tracking</span>
            <span>·</span>
            <span>112 ERSS Ready</span>
            <span>·</span>
            <span>Encrypted Dossier</span>
            <span>·</span>
            <span className="text-emerald-400 font-semibold">All Systems Normal</span>
          </div>
        </div>
        <p
          data-testid="demo-disclaimer"
          className="text-center md:text-left text-[11px] text-slate-500 font-normal leading-relaxed border-t border-white/5 pt-4"
        >
          Powered by NDV Texas Solutions.
        </p>
      </footer>

      {/* ======================================================== */}
      {/* MINIMALIST LOGIN POPUP                                    */}
      {/* ======================================================== */}
      {loginModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl bg-[#0c111d] border border-white/10 p-6 sm:p-8 shadow-2xl">
            {/* Close button */}
            <button
              onClick={() => {
                setLoginModalOpen(false);
                setLoginError("");
              }}
              className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X size={20} />
            </button>

            {/* Login Heading */}
            <h2 className="font-display font-bold text-white text-xl sm:text-2xl uppercase tracking-tight">
              {loginRole === "dealer" ? "Service Center Login" : "Vehicle Owner Login"}
            </h2>

            {/* Form */}
            <form onSubmit={handleLoginSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => {
                    setLoginEmail(e.target.value);
                    setLoginError("");
                  }}
                  placeholder={loginRole === "dealer" ? "ndvtechsys.solutions@gmail.com" : "owner@tripshield.org"}
                  required
                  autoFocus
                  className="w-full px-4 py-3 rounded-xl bg-[#07090e] border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-[#e60012] focus:ring-1 focus:ring-[#e60012] text-sm transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => {
                    setLoginPassword(e.target.value);
                    setLoginError("");
                  }}
                  placeholder="••••••••••••"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-[#07090e] border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-[#e60012] focus:ring-1 focus:ring-[#e60012] text-sm transition-colors"
                />
              </div>

              {loginError && (
                <p className="text-xs text-red-500 font-medium">
                  {loginError}
                </p>
              )}

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-[#e60012] hover:bg-[#c90812] text-white font-semibold text-sm transition-colors cursor-pointer disabled:opacity-50"
              >
                {loginLoading ? "Signing in..." : "Login"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ========================================================
// HERO VIDEO CARD COMPONENT (Plays on Hover / Mouse Move)
// ========================================================
function HeroVideoCard() {
  const videoRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true);

  const handleMouseEnter = () => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => { });
    }
  };

  const handleMouseLeave = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  const toggleMute = (e) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    const nextMuted = !videoRef.current.muted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="w-full max-w-md sm:max-w-lg lg:max-w-lg xl:max-w-xl ml-auto relative group cursor-pointer"
    >
      {/* Subtle ambient automotive red glow on hover */}
      <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-[#e60012]/20 to-red-600/20 blur-xl opacity-40 group-hover:opacity-90 transition-opacity duration-500" />

      {/* Main Clean Video Frame */}
      <div className="relative rounded-2xl overflow-hidden border border-white/15 group-hover:border-white/30 bg-[#090d16] shadow-2xl transition-all duration-300">
        <div className="relative aspect-video w-full bg-black overflow-hidden">
          <video
            ref={videoRef}
            src="/tripshield-preview.mp4"
            poster="/video-poster.jpg"
            playsInline
            loop
            muted={isMuted}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
          />

          {/* Sound / Mute Toggle Button (Visible on Hover) */}
          <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              type="button"
              onClick={toggleMute}
              aria-label={isMuted ? "Unmute audio" : "Mute audio"}
              className="flex items-center gap-1.5 rounded-lg bg-black/80 hover:bg-black/95 backdrop-blur-md border border-white/20 hover:border-white/40 px-2.5 py-1.5 text-xs text-white shadow-xl cursor-pointer transition-all hover:scale-105 active:scale-95"
            >
              {isMuted ? (
                <>
                  <VolumeX size={14} className="text-slate-300" />
                  <span className="text-xs text-slate-200 font-medium">Unmute</span>
                </>
              ) : (
                <>
                  <Volume2 size={14} className="text-[#e60012]" />
                  <span className="text-xs text-white font-medium">Mute</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ========================================================
// TRACK PREVIEW COMPONENT
// ========================================================
function TrackPreview() {
  return (
    <div
      data-testid="landing-track-preview"
      className="relative rounded-2xl overflow-hidden border border-white/10 h-60 sm:h-72 bg-[#0b1120] shadow-xl"
    >
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.06) 1px,transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 rounded-lg bg-black/70 backdrop-blur-md border border-white/10 px-2.5 py-1">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
        </span>
        <span className="text-[11px] font-semibold tracking-wider text-red-300 uppercase">Live GPS</span>
      </div>
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 rounded-lg bg-black/70 backdrop-blur-md border border-white/10 px-2.5 py-1">
        <Users size={12} className="text-emerald-400" />
        <span className="text-[11px] font-semibold tracking-wider text-emerald-300 uppercase">
          Zero-App Link
        </span>
      </div>

      <svg
        viewBox="0 0 400 200"
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="xMidYMid slice"
      >
        <path
          d="M0,150 H400 M0,70 H400 M120,0 V200 M280,0 V200"
          stroke="rgba(255,255,255,.05)"
          strokeWidth="1"
        />
        <path
          id="landing-route"
          d="M30,165 C90,60 170,185 240,105 S350,45 378,82"
          fill="none"
          stroke="#e60012"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="2 8"
          opacity="0.85"
        >
          <animate
            attributeName="stroke-dashoffset"
            from="0"
            to="-100"
            dur="2.5s"
            repeatCount="indefinite"
          />
        </path>
        <circle cx="30" cy="165" r="5" fill="#10b981" stroke="#0b1120" strokeWidth="2" />
        <circle cx="378" cy="82" r="5" fill="#3b82f6" stroke="#0b1120" strokeWidth="2" />
        <g>
          <circle r="10" fill="#e60012" opacity="0.3">
            <animate attributeName="r" values="6;13;6" dur="1.6s" repeatCount="indefinite" />
            <animate
              attributeName="opacity"
              values="0.35;0;0.35"
              dur="1.6s"
              repeatCount="indefinite"
            />
            <animateMotion dur="6s" repeatCount="indefinite">
              <mpath href="#landing-route" />
            </animateMotion>
          </circle>
          <circle r="6" fill="#e60012" stroke="#fff" strokeWidth="2">
            <animateMotion dur="6s" repeatCount="indefinite">
              <mpath href="#landing-route" />
            </animateMotion>
          </circle>
        </g>
      </svg>

      <div className="absolute inset-0 bg-gradient-to-t from-[#07090e] via-transparent pointer-events-none" />
      <div className="absolute bottom-3 left-3 right-3 z-10 flex items-center justify-between text-xs text-slate-300 font-medium">
        <span>Delhi → Jaipur · 268 km</span>
        <span className="text-emerald-400 font-semibold">On Track · ETA 4h 12m</span>
      </div>
    </div>
  );
}


