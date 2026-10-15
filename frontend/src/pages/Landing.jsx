import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { TripShieldMark } from "@/components/BrandMark";
import ScrollStoryCar from "@/components/ScrollStoryCar";
import RagChatbot from "@/components/RagChatbot";
import { warmupBackend } from "@/lib/api";
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
  Calendar,
  MessageSquareQuote,
  Mail,
  Send,
  Linkedin,
  Instagram,
  Facebook,
  Youtube,
  Award,
  FileCheck,
  PhoneCall,
  Sparkles,
  HelpCircle,
} from "lucide-react";
import api from "@/lib/api";

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
    tagline: "Live WhatsApp route link accessible directly in any browser.",
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
    question: "Do users or family members need to install an app?",
    answer:
      "No. TripShield is a web platform that works directly in any browser without installing an app. Riders access the cockpit online, and family members track journeys via an instant, secure web link.",
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

  // Request Demo Modal State
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [demoForm, setDemoForm] = useState({
    name: "",
    email: "",
    phone: "",
    organization: "",
    user_type: "Fleet Operator",
    fleet_size: "1-10 vehicles",
    preferred_date: "",
    notes: "",
  });
  const [demoLoading, setDemoLoading] = useState(false);
  const [demoSuccess, setDemoSuccess] = useState(null);
  const [demoError, setDemoError] = useState("");

  // Get a Quote / Query Modal State
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [quoteForm, setQuoteForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "Get a Quote",
    problem_description: "",
    preferred_contact: "email",
  });
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteSuccess, setQuoteSuccess] = useState(null);
  const [quoteError, setQuoteError] = useState("");

  // Legal Modals State
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);
  const [termsModalOpen, setTermsModalOpen] = useState(false);

  const handleDemoSubmit = async (e) => {
    e.preventDefault();
    setDemoLoading(true);
    setDemoError("");
    setDemoSuccess(null);
    try {
      const res = await api.post("/demo-request", demoForm);
      setDemoSuccess(
        res.data?.message ||
          "Demo request received! Our team has notified customercare@ndvtechsys.com and will contact you shortly."
      );
    } catch (err) {
      setDemoError(err.response?.data?.detail || "Failed to submit demo request. Please check inputs.");
    } finally {
      setDemoLoading(false);
    }
  };

  const handleQuoteSubmit = async (e) => {
    e.preventDefault();
    setQuoteLoading(true);
    setQuoteError("");
    setQuoteSuccess(null);
    try {
      const res = await api.post("/contact-quote", quoteForm);
      setQuoteSuccess(
        res.data?.message ||
          "Your inquiry has been submitted! An admin at customercare@ndvtechsys.com will review your request and reply to you directly."
      );
    } catch (err) {
      setQuoteError(err.response?.data?.detail || "Failed to submit inquiry. Please check inputs.");
    } finally {
      setQuoteLoading(false);
    }
  };

  useEffect(() => {
    warmupBackend();
  }, []);

  useEffect(() => {
    if (!loading && user) navigate(user.role === "dealer" ? "/dealer" : "/app");
  }, [user, loading, navigate]);

  const startGoogleLogin = () => {
    warmupBackend();
    localStorage.setItem("hsj_role", "user");
    const redirectUrl = window.location.origin + "/app";
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(
      redirectUrl
    )}`;
  };

  const openLoginModal = () => {
    warmupBackend();
    setLoginRole("dealer");
    setLoginEmail("ndvtechsys.solutions@gmail.com");
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
        <div className="max-w-6xl mx-auto pointer-events-auto rounded-full bg-[#0a0f1b]/90 backdrop-blur-xl border border-white/10 px-4 sm:px-6 py-2.5 shadow-2xl flex items-center justify-between gap-4">
          {/* Brand Logo & Wordmark */}
          <button
            onClick={() => scrollToSection("hero", "home")}
            className="flex items-center gap-2.5 cursor-pointer group shrink-0"
          >
            <TripShieldMark size={28} glow />
            <span className="font-display font-extrabold text-[#e60012] text-lg tracking-wide">
              TRIPSHIELD
            </span>
          </button>

          {/* Clean Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
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
                className={`px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer font-medium ${activeTab === n.tab
                    ? "text-white font-semibold bg-white/10 shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
              >
                {n.label}
              </button>
            ))}
          </nav>

          {/* Top Bar Action Buttons: Request Demo & Get a Quote */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setDemoSuccess(null);
                setDemoError("");
                setDemoModalOpen(true);
              }}
              className="px-3 sm:px-3.5 py-1.5 rounded-lg bg-[#e60012] hover:bg-[#c90812] text-white font-semibold text-xs tracking-wide transition-all shadow-sm cursor-pointer whitespace-nowrap"
            >
              Request Demo
            </button>
            <button
              type="button"
              onClick={() => {
                setQuoteSuccess(null);
                setQuoteError("");
                setQuoteModalOpen(true);
              }}
              className="px-2.5 sm:px-3 py-1.5 rounded-lg border border-white/20 hover:border-white/40 text-slate-200 hover:text-white bg-white/5 font-semibold text-xs tracking-wide transition-all cursor-pointer whitespace-nowrap"
            >
              Get a Quote
            </button>
          </div>
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

              <h1 className="font-heading font-extrabold text-white text-2xl sm:text-3xl lg:text-4xl tracking-tight uppercase leading-snug sm:leading-tight">
                REAL-TIME TWO-WHEELER <span className="text-[#e60012]">INTELLIGENCE &amp; SAFETY</span>.
              </h1>

              <p className="font-body text-slate-300 text-sm sm:text-base mt-4 max-w-lg font-normal leading-relaxed">
                Connected telematics and emergency safety network for two-wheelers and passenger vehicles. Autonomous crash detection, 112 ERSS dispatch, and hands-free family tracking on every ride.
              </p>

              {/* Streamlined Direct Portal Access Buttons */}
              <div className="w-full mt-8 space-y-3 max-w-lg">
                {/* Rider Portal Button (Google Auth) */}
                <motion.button
                  whileHover={{ y: -2, transition: { type: "spring", stiffness: 400, damping: 25 } }}
                  whileTap={{ scale: 0.98 }}
                  data-testid="login-google-user-button"
                  onClick={startGoogleLogin}
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
                    <GoogleGlyph />
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
                  onClick={openLoginModal}
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
          <h2 className="font-heading font-bold text-white text-xl sm:text-2xl lg:text-3xl uppercase tracking-tight">
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
                <h3 className="font-heading font-semibold text-white text-base sm:text-lg">
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
            <h2 className="font-heading font-bold text-white text-xl sm:text-2xl lg:text-3xl uppercase tracking-tight">
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
                    <h3 className="font-heading font-semibold text-white text-base">
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
          <h2 className="font-heading font-bold text-white text-xl sm:text-2xl lg:text-3xl uppercase tracking-tight">
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
                <h3 className="font-heading font-semibold text-white text-base sm:text-lg mt-3">
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
              <h3 className="text-xs font-display font-bold uppercase tracking-wider text-white">
                Real-Time Journey Cockpit &amp; Telemetry
              </h3>
              <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                Direct Family Web Tracking
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
          <h2 className="font-heading font-bold text-white text-xl sm:text-2xl uppercase tracking-tight">
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
                  <span className="font-heading font-medium text-white text-sm sm:text-base leading-snug">
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
              <h2 className="font-heading font-bold text-white text-2xl sm:text-3xl lg:text-4xl uppercase tracking-tight leading-tight">
                DISCOVER <span className="text-[#3b82f6]">AUTOCARE PULSE</span>.
              </h2>

              <p className="font-body text-slate-300 text-sm sm:text-base mt-4 leading-relaxed max-w-xl">
                Complement your safety network with intelligent vehicle health diagnostics. Predictive maintenance alerts, automated workshop scheduling, and live mechanical telemetry for passenger and fleet vehicles.
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-slate-400 font-medium">
                <span>Predictive Health</span>
                <span>·</span>
                <span>Workshop Telematics</span>
                <span>·</span>
                <span>Automated Servicing</span>
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
      {/* ======================================================== */}
      {/* 9. ENTERPRISE MULTI-COLUMN FOOTER & COMPLIANCE            */}
      {/* ======================================================== */}
      <footer className="relative bg-gradient-to-b from-[#07090e] via-[#090e1a] to-[#04060a] border-t border-white/10 pt-14 pb-12 overflow-hidden text-xs text-slate-300">
        {/* Subtle background ambient mesh */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-red-950/15 via-transparent to-transparent pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Top Footer Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 pb-12">
            {/* Left Brand Column (Cols 1-5) */}
            <div className="lg:col-span-5 flex flex-col items-start pr-0 lg:pr-8">
              <div className="flex items-center gap-3">
                <TripShieldMark size={30} glow />
                <span className="font-display font-extrabold text-[#e60012] tracking-wider text-xl">
                  TRIPSHIELD
                </span>
              </div>
              <p className="mt-4 text-slate-400 text-xs sm:text-sm leading-relaxed max-w-md">
                Connected vehicle telematics and emergency safety network. Real-time crash detection, automated emergency dispatch, and live tracking for riders and certified workshops.
              </p>

              {/* Direct Portal Quick Links */}
              <div className="mt-5 flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={startGoogleLogin}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 hover:text-white text-xs font-semibold transition-all cursor-pointer"
                >
                  <Bike size={14} className="text-[#e60012]" />
                  <span>Rider Portal</span>
                </button>
                <button
                  type="button"
                  onClick={openLoginModal}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 hover:text-white text-xs font-semibold transition-all cursor-pointer"
                >
                  <Building2 size={14} className="text-blue-400" />
                  <span>Service Center Portal</span>
                </button>
              </div>
            </div>

            {/* Right Nav Columns (Cols 6-12, 4 focused columns) */}
            <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-6">
              {/* Column 1: PLATFORM */}
              <div>
                <h3 className="font-display font-bold text-white uppercase tracking-wider text-xs mb-3.5">
                  PLATFORM
                </h3>
                <ul className="space-y-2.5 text-slate-400 text-xs font-normal">
                  <li>
                    <button
                      onClick={() => scrollToSection("story-journey", "journey")}
                      className="hover:text-white transition-colors cursor-pointer text-left"
                    >
                      Live Tracking
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => scrollToSection("features-section", "features")}
                      className="hover:text-white transition-colors cursor-pointer text-left"
                    >
                      Crash Detection
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => scrollToSection("features-section", "features")}
                      className="hover:text-white transition-colors cursor-pointer text-left"
                    >
                      Family Live Link
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={openLoginModal}
                      className="hover:text-white transition-colors cursor-pointer text-left"
                    >
                      Workshop Triage
                    </button>
                  </li>
                  <li>
                    <a
                      href={AUTOCARE_PULSE_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-blue-400 transition-colors inline-flex items-center gap-1"
                    >
                      AutoCare Pulse
                      <ExternalLink size={10} />
                    </a>
                  </li>
                </ul>
              </div>

              {/* Column 2: ACTIONS & DEMO */}
              <div>
                <h3 className="font-display font-bold text-white uppercase tracking-wider text-xs mb-3.5">
                  ACTIONS
                </h3>
                <ul className="space-y-2.5 text-slate-400 text-xs font-normal">
                  <li>
                    <button
                      onClick={() => {
                        setDemoSuccess(null);
                        setDemoError("");
                        setDemoModalOpen(true);
                      }}
                      className="text-[#e60012] hover:text-red-400 font-semibold transition-colors cursor-pointer text-left inline-flex items-center gap-1"
                    >
                      Request Demo
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        setQuoteSuccess(null);
                        setQuoteError("");
                        setQuoteModalOpen(true);
                      }}
                      className="text-[#3b82f6] hover:text-blue-400 font-semibold transition-colors cursor-pointer text-left inline-flex items-center gap-1"
                    >
                      Get a Quote
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => scrollToSection("how-it-works", "workflow")}
                      className="hover:text-white transition-colors cursor-pointer text-left"
                    >
                      How It Works
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => scrollToSection("faq-section", "faq")}
                      className="hover:text-white transition-colors cursor-pointer text-left"
                    >
                      FAQ
                    </button>
                  </li>
                </ul>
              </div>

              {/* Column 3: CONTACT & SUPPORT */}
              <div>
                <h3 className="font-display font-bold text-white uppercase tracking-wider text-xs mb-3.5">
                  CONTACT
                </h3>
                <ul className="space-y-2.5 text-slate-400 text-xs font-normal">
                  <li>
                    <a
                      href="mailto:customercare@ndvtechsys.com"
                      className="hover:text-white transition-colors inline-flex items-center gap-1.5 break-all"
                    >
                      <Mail size={12} className="text-[#e60012] shrink-0" />
                      <span>customercare@ndvtechsys.com</span>
                    </a>
                  </li>
                  <li>
                    <a
                      href="tel:+919538880910"
                      className="hover:text-white transition-colors inline-flex items-center gap-1.5"
                    >
                      <PhoneCall size={12} className="text-[#e60012] shrink-0" />
                      <span>+91-9538880910</span>
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://wa.me/919538880910?text=Hello%20TripShield%20Team%2C%20I%20have%20an%20inquiry%20regarding%20TripShield."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-emerald-400 transition-colors inline-flex items-center gap-1.5"
                    >
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>WhatsApp Desk</span>
                    </a>
                  </li>
                </ul>
              </div>

              {/* Column 4: LEGAL */}
              <div>
                <h3 className="font-display font-bold text-white uppercase tracking-wider text-xs mb-3.5">
                  LEGAL
                </h3>
                <ul className="space-y-2.5 text-slate-400 text-xs font-normal">
                  <li>
                    <button
                      onClick={() => setPrivacyModalOpen(true)}
                      className="hover:text-white transition-colors cursor-pointer text-left"
                    >
                      Privacy Policy
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setTermsModalOpen(true)}
                      className="hover:text-white transition-colors cursor-pointer text-left"
                    >
                      Terms &amp; Conditions
                    </button>
                  </li>
                  <li>
                    <span className="text-slate-500 text-[11px]">112 ERSS Interop</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* RECOGNISED & SUPPORTED BY SECTION                         */}
          {/* ======================================================== */}
          <div className="border-t border-white/10 pt-8 pb-10">
            <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-5">
              Recognised &amp; supported by
            </p>
            <div className="flex flex-wrap items-center gap-6 sm:gap-8">
              {/* Badge 1: MCA Registered */}
              <div className="flex flex-col items-center group">
                <div className="w-36 sm:w-40 h-16 bg-white rounded-2xl px-3 py-2 flex items-center justify-center shadow-lg border border-slate-200/90 transition-transform duration-200 hover:-translate-y-0.5">
                  <div className="flex items-center gap-2">
                    {/* Emblem Ashoka Pillar representation */}
                    <svg viewBox="0 0 24 24" className="w-8 h-8 text-slate-800 shrink-0" fill="currentColor">
                      <path d="M12 2C8.5 2 6 4 6 7v3h12V7c0-3-2.5-5-6-5zm-4 9v6h2v-6H8zm5 0v6h2v-6h-2zm-9 7v2h16v-2H4z" />
                    </svg>
                    <div className="leading-[1.15] text-left">
                      <div className="text-[8.5px] font-black uppercase tracking-tight text-slate-900">Ministry of</div>
                      <div className="text-[8.5px] font-black uppercase tracking-tight text-slate-900">Corporate</div>
                      <div className="text-[8.5px] font-black uppercase tracking-tight text-slate-900">Affairs</div>
                    </div>
                  </div>
                </div>
                <span className="mt-2.5 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                  MCA Registered
                </span>
              </div>

              {/* Badge 2: Startup India */}
              <div className="flex flex-col items-center group">
                <div className="w-36 sm:w-40 h-16 bg-white rounded-2xl px-3 py-2 flex items-center justify-center shadow-lg border border-slate-200/90 transition-transform duration-200 hover:-translate-y-0.5">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-600 font-bold text-sm shrink-0">
                      🇮🇳
                    </div>
                    <div className="leading-[1.15] text-left">
                      <div className="text-[10px] font-black uppercase tracking-tight text-slate-900">#startupindia</div>
                      <div className="text-[8px] font-semibold text-slate-600">DPIIT Recognised</div>
                    </div>
                  </div>
                </div>
                <span className="mt-2.5 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                  Startup India
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Copyright & Social Bar */}
          <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-slate-400 text-xs text-center sm:text-left">
              © 2026 TRIPSHIELD by NDVTechsys Solutions LLP, India. All rights reserved.
            </p>

            {/* Social Icons & WhatsApp */}
            <div className="flex items-center gap-3">
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
              >
                <Linkedin size={15} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
              >
                <Instagram size={15} />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
              >
                <Facebook size={15} />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
              >
                <Youtube size={15} />
              </a>
              <a
                href="https://wa.me/919538880910?text=Hello%20TripShield%20Team%2C%20I%20would%20like%20to%20learn%20more%20about%20your%20services."
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="w-8 h-8 rounded-lg bg-emerald-600 hover:bg-emerald-500 flex items-center justify-center text-white transition-colors shadow-sm"
              >
                <Phone size={15} />
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* ======================================================== */}
      {/* SERVICE CENTER LOGIN POPUP                                */}
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
            <h2 className="font-heading font-bold text-white text-lg sm:text-xl uppercase tracking-tight">
              Service Center Login
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
                  placeholder="ndvtechsys.solutions@gmail.com"
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

      {/* ======================================================== */}
      {/* 1. REQUEST DEMO MODAL                                     */}
      {/* ======================================================== */}
      {demoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-xl my-8 rounded-2xl bg-[#0c111d] border border-white/15 p-6 sm:p-8 shadow-2xl text-left">
            <button
              onClick={() => {
                setDemoModalOpen(false);
                setDemoError("");
                setDemoSuccess(null);
              }}
              className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#e60012]/15 flex items-center justify-center text-[#e60012]">
                <Calendar size={18} />
              </div>
              <h2 className="font-heading font-bold text-white text-lg sm:text-xl uppercase tracking-tight">
                Request a Live Demo
              </h2>
            </div>

            <p className="mt-2 text-xs text-slate-400 leading-relaxed">
              Schedule a personalized walkthrough of TripShield’s automated crash dispatch, live fleet telematics, and service center portal. A notification will be dispatched to our admin desk (<span className="text-[#e60012] font-semibold">customercare@ndvtechsys.com</span>).
            </p>

            {demoSuccess ? (
              <div className="mt-6 p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs leading-relaxed">
                <div className="flex items-center gap-2 font-bold text-sm mb-1 text-emerald-400">
                  <CheckCircle2 size={18} />
                  Demo Request Submitted
                </div>
                {demoSuccess}
                <div className="mt-4 pt-3 border-t border-emerald-500/20 flex justify-end">
                  <button
                    onClick={() => {
                      setDemoModalOpen(false);
                      setDemoSuccess(null);
                    }}
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors cursor-pointer"
                  >
                    Close Window
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleDemoSubmit} className="mt-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={demoForm.name}
                      onChange={(e) => setDemoForm({ ...demoForm, name: e.target.value })}
                      placeholder="e.g. Rajesh Sharma"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#07090e] border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-[#e60012]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Work Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={demoForm.email}
                      onChange={(e) => setDemoForm({ ...demoForm, email: e.target.value })}
                      placeholder="name@company.com"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#07090e] border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-[#e60012]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={demoForm.phone}
                      onChange={(e) => setDemoForm({ ...demoForm, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#07090e] border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-[#e60012]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Organization / Company *
                    </label>
                    <input
                      type="text"
                      required
                      value={demoForm.organization}
                      onChange={(e) => setDemoForm({ ...demoForm, organization: e.target.value })}
                      placeholder="e.g. Apex Mobility Ltd"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#07090e] border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-[#e60012]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      User / Fleet Type
                    </label>
                    <select
                      value={demoForm.user_type}
                      onChange={(e) => setDemoForm({ ...demoForm, user_type: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#07090e] border border-white/10 text-white text-xs focus:outline-none focus:border-[#e60012]"
                    >
                      <option value="Fleet Operator">Fleet Operator</option>
                      <option value="Two-Wheeler OEM">Two-Wheeler OEM</option>
                      <option value="Service Center / Dealer">Service Center / Dealer</option>
                      <option value="Delivery & Logistics">Delivery &amp; Logistics</option>
                      <option value="Individual Rider">Individual Rider</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Fleet Scale
                    </label>
                    <select
                      value={demoForm.fleet_size}
                      onChange={(e) => setDemoForm({ ...demoForm, fleet_size: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#07090e] border border-white/10 text-white text-xs focus:outline-none focus:border-[#e60012]"
                    >
                      <option value="1-10 vehicles">1 - 10 vehicles</option>
                      <option value="11-50 vehicles">11 - 50 vehicles</option>
                      <option value="51-200 vehicles">51 - 200 vehicles</option>
                      <option value="200+ vehicles">200+ vehicles</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Preferred Demo Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={demoForm.preferred_date}
                    onChange={(e) => setDemoForm({ ...demoForm, preferred_date: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#07090e] border border-white/10 text-white text-xs focus:outline-none focus:border-[#e60012]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Operational Requirements / Notes
                  </label>
                  <textarea
                    rows={2}
                    value={demoForm.notes}
                    onChange={(e) => setDemoForm({ ...demoForm, notes: e.target.value })}
                    placeholder="Mention specific features you want to test (e.g., automated accident detection, SOS dispatch, OBD data sync)..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#07090e] border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-[#e60012]"
                  />
                </div>

                {demoError && (
                  <p className="text-xs text-red-500 font-medium">
                    {demoError}
                  </p>
                )}

                <div className="pt-2 flex items-center justify-between gap-3">
                  <span className="text-[10px] text-slate-500">
                    Forwarding to admin desk: <span className="text-slate-400">customercare@ndvtechsys.com</span>
                  </span>
                  <button
                    type="submit"
                    disabled={demoLoading}
                    className="px-5 py-2.5 rounded-xl bg-[#e60012] hover:bg-[#c90812] text-white font-semibold text-xs tracking-wide transition-all shadow-md cursor-pointer disabled:opacity-50 inline-flex items-center gap-2"
                  >
                    <Send size={14} />
                    <span>{demoLoading ? "Sending..." : "Submit Request"}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. GET A QUOTE / CONTACT US INQUIRY MODAL                  */}
      {/* ======================================================== */}
      {quoteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-xl my-8 rounded-2xl bg-[#0c111d] border border-white/15 p-6 sm:p-8 shadow-2xl text-left">
            <button
              onClick={() => {
                setQuoteModalOpen(false);
                setQuoteError("");
                setQuoteSuccess(null);
              }}
              className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#3b82f6]/15 flex items-center justify-center text-[#3b82f6]">
                <MessageSquareQuote size={18} />
              </div>
              <h2 className="font-heading font-bold text-white text-lg sm:text-xl uppercase tracking-tight">
                Get a Quote &amp; Query
              </h2>
            </div>

            <p className="mt-2 text-xs text-slate-400 leading-relaxed">
              Have an operational problem or need a custom quote? Submit your query and an administrator at <span className="text-[#3b82f6] font-semibold">customercare@ndvtechsys.com</span> will analyze your problem and respond directly to your email.
            </p>

            {quoteSuccess ? (
              <div className="mt-6 p-4 rounded-xl bg-blue-950/40 border border-blue-500/30 text-blue-300 text-xs leading-relaxed">
                <div className="flex items-center gap-2 font-bold text-sm mb-1 text-blue-400">
                  <CheckCircle2 size={18} />
                  Inquiry Dispatched Successfully
                </div>
                {quoteSuccess}
                <div className="mt-4 pt-3 border-t border-blue-500/20 flex justify-end">
                  <button
                    onClick={() => {
                      setQuoteModalOpen(false);
                      setQuoteSuccess(null);
                    }}
                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors cursor-pointer"
                  >
                    Close Window
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleQuoteSubmit} className="mt-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={quoteForm.name}
                      onChange={(e) => setQuoteForm({ ...quoteForm, name: e.target.value })}
                      placeholder="e.g. Vikramaditya Rao"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#07090e] border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-[#3b82f6]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Your Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={quoteForm.email}
                      onChange={(e) => setQuoteForm({ ...quoteForm, email: e.target.value })}
                      placeholder="vikram@fleetpulse.com"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#07090e] border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-[#3b82f6]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={quoteForm.phone}
                      onChange={(e) => setQuoteForm({ ...quoteForm, phone: e.target.value })}
                      placeholder="+91 98111 22233"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#07090e] border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-[#3b82f6]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Query Subject
                    </label>
                    <select
                      value={quoteForm.subject}
                      onChange={(e) => setQuoteForm({ ...quoteForm, subject: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#07090e] border border-white/10 text-white text-xs focus:outline-none focus:border-[#3b82f6]"
                    >
                      <option value="Get a Quote">Commercial Quote Request</option>
                      <option value="Fleet Safety Implementation">Fleet Safety Implementation</option>
                      <option value="Service Center Integration">Service Center Integration</option>
                      <option value="Technical Telematics Query">Technical Telematics Query</option>
                      <option value="Admin Query">Other Administrative Query</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Problem Description / Operational Requirements *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={quoteForm.problem_description}
                    onChange={(e) => setQuoteForm({ ...quoteForm, problem_description: e.target.value })}
                    placeholder="Describe the exact challenge or question you want our admin team to solve (e.g. how many riders you manage, what telematics features you need, or custom integrations)..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#07090e] border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-[#3b82f6] leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Preferred Communication
                  </label>
                  <div className="flex items-center gap-6 text-xs text-slate-300">
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="contact_pref"
                        value="email"
                        checked={quoteForm.preferred_contact === "email"}
                        onChange={() => setQuoteForm({ ...quoteForm, preferred_contact: "email" })}
                        className="text-[#3b82f6] focus:ring-[#3b82f6]"
                      />
                      <span>Reply via Email</span>
                    </label>
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="contact_pref"
                        value="phone"
                        checked={quoteForm.preferred_contact === "phone"}
                        onChange={() => setQuoteForm({ ...quoteForm, preferred_contact: "phone" })}
                        className="text-[#3b82f6] focus:ring-[#3b82f6]"
                      />
                      <span>Call on Phone</span>
                    </label>
                  </div>
                </div>

                {quoteError && (
                  <p className="text-xs text-red-500 font-medium">
                    {quoteError}
                  </p>
                )}

                <div className="pt-2 flex items-center justify-between gap-3">
                  <span className="text-[10px] text-slate-500">
                    Direct admin inbox: <span className="text-slate-400">customercare@ndvtechsys.com</span>
                  </span>
                  <button
                    type="submit"
                    disabled={quoteLoading}
                    className="px-5 py-2.5 rounded-xl bg-[#1d4ed8] hover:bg-[#2563eb] text-white font-semibold text-xs tracking-wide transition-all shadow-md cursor-pointer disabled:opacity-50 inline-flex items-center gap-2"
                  >
                    <Send size={14} />
                    <span>{quoteLoading ? "Submitting..." : "Send Query to Admin"}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. PRIVACY POLICY MODAL                                   */}
      {/* ======================================================== */}
      {privacyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl my-8 rounded-2xl bg-[#0c111d] border border-white/15 p-6 sm:p-8 shadow-2xl text-left max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2.5">
                <FileCheck size={20} className="text-[#e60012]" />
                <h2 className="font-heading font-bold text-white text-base sm:text-lg uppercase tracking-tight">
                  TripShield Privacy Policy
                </h2>
              </div>
              <button
                onClick={() => setPrivacyModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <div className="overflow-y-auto pr-2 mt-4 space-y-4 text-xs text-slate-300 leading-relaxed">
              <p className="text-slate-400">
                Last updated: October 2026. TripShield by NDVTechsys Solutions LLP (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) prioritizes the confidential and respectful treatment of rider telemetry, journey tracking, and incident audio.
              </p>

              <div>
                <h4 className="font-bold text-white text-sm mb-1">1. Journey &amp; Telematics Data</h4>
                <p>
                  GPS coordinates, vehicle velocity, and acceleration vectors are recorded solely during an active, user-initiated journey. TripShield does not execute background tracking when journeys are completed or terminated.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-white text-sm mb-1">2. Emergency Audio Incident Recording</h4>
                <p>
                  To assist emergency medical responders and family in critical situations, our system may capture up to 60 seconds of ambient audio only when an autonomous crash or high-impact SOS trigger is flagged and unanswered. Audio is encrypted and accessible strictly via the secure incident dossier.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-white text-sm mb-1">3. Tokenized Family Tracking</h4>
                <p>
                  Public link sharing is token-gated and ephemeral. Recipients require no software installation and can view live GPS breadcrumbs directly in any web browser during the active journey.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-white text-sm mb-1">4. Data Storage &amp; Security</h4>
                <p>
                  All telemetry records and contacts are encrypted using AES-256 at rest and TLS 1.3 in transit. We do not sell or monetize personal movement logs or user data to third-party ad brokers.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-white text-sm mb-1">5. Administrative Inquiries</h4>
                <p>
                  For data erasure requests, compliance audits, or telemetry policies, write to our admin desk at <a href="mailto:customercare@ndvtechsys.com" className="text-[#e60012] underline">customercare@ndvtechsys.com</a>.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 mt-4 flex justify-end shrink-0">
              <button
                onClick={() => setPrivacyModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-colors cursor-pointer"
              >
                Close Policy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. TERMS & CONDITIONS MODAL                               */}
      {/* ======================================================== */}
      {termsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl my-8 rounded-2xl bg-[#0c111d] border border-white/15 p-6 sm:p-8 shadow-2xl text-left max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2.5">
                <ShieldCheck size={20} className="text-[#e60012]" />
                <h2 className="font-heading font-bold text-white text-base sm:text-lg uppercase tracking-tight">
                  Terms &amp; Conditions
                </h2>
              </div>
              <button
                onClick={() => setTermsModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <div className="overflow-y-auto pr-2 mt-4 space-y-4 text-xs text-slate-300 leading-relaxed">
              <p className="text-slate-400">
                Effective October 2026. By accessing TripShield portals, mobile services, or workshop dashboards, you agree to these operational terms with NDVTechsys Solutions LLP.
              </p>

              <div>
                <h4 className="font-bold text-white text-sm mb-1">1. Scope of the Platform</h4>
                <p>
                  TripShield provides software-driven rider safety telematics, automated incident alerting, and workshop recovery triage. The platform operates alongside certified workshop networks and public emergency lines.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-white text-sm mb-1">2. Emergency Dispatch Disclaimer</h4>
                <p>
                  While TripShield incorporates automated crash alerts and connects with the 112 ERSS emergency protocol, network availability and hardware connectivity may affect delivery times. TripShield acts as a supplementary safety companion and is not a replacement for direct emergency services.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-white text-sm mb-1">3. Rider &amp; Vehicle Compliance</h4>
                <p>
                  Vehicle operators agree to follow local traffic laws, wear certified safety gear, and ensure accurate contact and medical information is maintained in their profile.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-white text-sm mb-1">4. Workshop &amp; Dealer Standards</h4>
                <p>
                  Authorized service centers agree to respond to active roadside triage requests within standard operating SLAs and uphold transparent vehicle health assessments.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-white text-sm mb-1">5. Contact &amp; Governance</h4>
                <p>
                  These terms are governed by the laws of India. For legal questions or service agreements, reach out to <a href="mailto:customercare@ndvtechsys.com" className="text-[#e60012] underline">customercare@ndvtechsys.com</a>.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 mt-4 flex justify-end shrink-0">
              <button
                onClick={() => setTermsModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-colors cursor-pointer"
              >
                Accept &amp; Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TRIPSHIELD RAG CHATBOT (Bottom-Right Logo / Mascot + Popup) */}
      {/* ======================================================== */}
      <RagChatbot />
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
      <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-2.5 py-1 text-slate-300 text-xs font-medium">
        <Navigation size={13} className="text-[#e60012]" />
        <span>Live GPS Route</span>
      </div>
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 px-2.5 py-1 text-slate-400 text-xs font-medium">
        <span>Family Tracking Active</span>
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

// ========================================================
// GOOGLE GLYPH COMPONENT
// ========================================================
function GoogleGlyph() {
  return (
    <span className="flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1.5 text-xs font-bold text-slate-800 shadow-sm transition-all group-hover:bg-slate-100">
      <svg width="14" height="14" viewBox="0 0 48 48">
        <path
          fill="#EA4335"
          d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
        />
        <path
          fill="#4285F4"
          d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
        />
        <path
          fill="#FBBC05"
          d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
        />
        <path
          fill="#34A853"
          d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
        />
      </svg>
      Google
    </span>
  );
}


