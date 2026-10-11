import React, { useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useSpring,
  useTransform,
  useMotionValueEvent,
} from "framer-motion";
import { ChevronDown } from "lucide-react";

// Stylized, Bold Top-Down Cartoon Scooty Vector (Full-Size & Highly Recognizable)
function SleekRedScooty() {
  return (
    <svg
      viewBox="0 0 84 130"
      className="w-14 sm:w-16 md:w-20 lg:w-22 h-auto drop-shadow-[0_16px_32px_rgba(0,0,0,0.95)]"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Vibrant Glossy Red Paint Gradient */}
        <linearGradient id="scooty-body-red" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#9E000B" />
          <stop offset="18%" stopColor="#C90812" />
          <stop offset="48%" stopColor="#E50914" />
          <stop offset="78%" stopColor="#FF3845" />
          <stop offset="100%" stopColor="#9E000B" />
        </linearGradient>

        {/* Chrome / Metallic Trim Gradient */}
        <linearGradient id="scooty-chrome" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#e2e8f0" />
          <stop offset="50%" stopColor="#94a3b8" />
          <stop offset="100%" stopColor="#cbd5e1" />
        </linearGradient>

        {/* Deep Leather Seat Gradient */}
        <linearGradient id="scooty-seat-leather" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1a1e27" />
          <stop offset="45%" stopColor="#252c39" />
          <stop offset="100%" stopColor="#12161f" />
        </linearGradient>

        {/* Bright Headlight Forward Beam */}
        <linearGradient id="scooty-headlight-cone" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
          <stop offset="35%" stopColor="#ffe6e7" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#ff1f2d" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* 1. Deep Soft Ground Shadow */}
      <ellipse cx="42" cy="68" rx="26" ry="54" fill="#000000" opacity="0.7" filter="blur(6px)" />

      {/* 2. Radiant Headlight Light Cone (Beaming forward down the road) */}
      <polygon points="42,108 14,130 70,130" fill="url(#scooty-headlight-cone)" />

      {/* 3. Chunky Rear Wheel (Top, Trailing) */}
      <rect x="37" y="6" width="10" height="24" rx="5" fill="#0b0d13" stroke="#222836" strokeWidth="1" />
      <rect x="40" y="10" width="4" height="16" rx="2" fill="#3b465c" opacity="0.6" />

      {/* 4. Rear Mudguard Hugger */}
      <path d="M 34 22 C 34 14, 50 14, 50 22 L 48 30 L 36 30 Z" fill="#141822" stroke="#2a3344" strokeWidth="0.8" />

      {/* 5. Bulbous Sculpted Scooter Rear Body (The Classic Curved Flanks / Side Engine Panels) */}
      <path
        d="M 28 30 
           C 16 38, 14 54, 18 68 
           L 25 74 
           L 59 74 
           L 66 68 
           C 70 54, 68 38, 56 30 
           C 50 25, 34 25, 28 30 Z"
        fill="url(#scooty-body-red)"
        stroke="#ff4d55"
        strokeWidth="1.2"
      />

      {/* Glossy Highlights on Scooty Body Curves */}
      <path d="M 20 44 C 18 52, 19 62, 23 68" stroke="#ff858c" strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
      <path d="M 64 44 C 66 52, 65 62, 61 68" stroke="#ff858c" strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />

      {/* 6. Bold Chrome Tubular Rear Grab Rail */}
      <path
        d="M 26 34 C 28 26, 56 26, 58 34"
        stroke="url(#scooty-chrome)"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* 7. Rear Taillight (Bright Red LED Wrap) */}
      <path
        d="M 33 27 C 38 24, 46 24, 51 27 L 49 32 C 45 30, 39 30, 35 32 Z"
        fill="#ff1f2d"
        stroke="#ff6670"
        strokeWidth="0.8"
      />
      <line x1="35" y1="26" x2="49" y2="26" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" filter="drop-shadow(0 0 3px #ff1f2d)" />

      {/* 8. Large Contoured Scooter Seat (Dual-Tone with Red Piping Trim) */}
      <path
        d="M 31 32 
           C 26 40, 26 52, 29 68 
           C 33 70, 51 70, 55 68 
           C 58 52, 58 40, 53 32 
           C 49 28, 35 28, 31 32 Z"
        fill="url(#scooty-seat-leather)"
        stroke="#ff3845"
        strokeWidth="1"
      />
      {/* Seat Piping Accent Lines & Texture */}
      <line x1="42" y1="34" x2="42" y2="65" stroke="#ff4d55" strokeWidth="0.8" strokeDasharray="2 2" opacity="0.6" />
      <path d="M 33 50 Q 42 52 51 50" stroke="#12161f" strokeWidth="1.2" />

      {/* 9. Wide Floorboard / Foot Deck (With Anti-Slip Rubber Grip Ribs) */}
      <rect x="25" y="70" width="34" height="15" rx="3" fill="#0d1118" stroke="#252d3d" strokeWidth="1" />
      <line x1="28" y1="74" x2="56" y2="74" stroke="#273144" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="28" y1="78" x2="56" y2="78" stroke="#273144" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="28" y1="82" x2="56" y2="82" stroke="#273144" strokeWidth="1.2" strokeLinecap="round" />

      {/* 10. Chunky Front Wheel (Bottom, Leading forward) */}
      <rect x="37.5" y="98" width="9" height="23" rx="4.5" fill="#0b0d13" stroke="#222836" strokeWidth="1" />
      <rect x="40.5" y="102" width="3" height="15" rx="1.5" fill="#3b465c" opacity="0.6" />

      {/* 11. Curved Front Mudguard / Wheel Fender */}
      <path
        d="M 33 100 C 33 93, 51 93, 51 100 L 49 108 C 45 106, 39 106, 35 108 Z"
        fill="url(#scooty-body-red)"
        stroke="#ff4d55"
        strokeWidth="0.8"
      />

      {/* 12. Iconic Broad Curved Front Apron / Shield */}
      <path
        d="M 28 80 
           C 18 86, 17 96, 26 106 
           C 33 111, 51 111, 58 106 
           C 67 96, 66 86, 56 80 Z"
        fill="url(#scooty-body-red)"
        stroke="#ff4d55"
        strokeWidth="1.2"
      />
      {/* Chrome Center V-Rib on Front Shield (Classic Scooter Detail) */}
      <path d="M 42 85 L 42 104" stroke="url(#scooty-chrome)" strokeWidth="1.5" strokeLinecap="round" />

      {/* 13. Sporty Handlebar Assembly & Handgrips */}
      <line x1="15" y1="88" x2="69" y2="88" stroke="#161b24" strokeWidth="4" strokeLinecap="round" />
      {/* Left Grip */}
      <rect x="12" y="85" width="10" height="6" rx="2.5" fill="#06080b" stroke="#333d52" strokeWidth="0.8" />
      {/* Right Grip */}
      <rect x="62" y="85" width="10" height="6" rx="2.5" fill="#06080b" stroke="#333d52" strokeWidth="0.8" />
      {/* Silver Brake Levers */}
      <line x1="11" y1="89" x2="19" y2="91" stroke="#e2e8f0" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="73" y1="89" x2="65" y2="91" stroke="#e2e8f0" strokeWidth="1.5" strokeLinecap="round" />

      {/* 14. Prominent Round Rear-View Mirrors (Classic & Cool Scooty Feature) */}
      <line x1="20" y1="87" x2="13" y2="78" stroke="url(#scooty-chrome)" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="11" cy="76" r="5" fill="#141a24" stroke="url(#scooty-chrome)" strokeWidth="1.2" />
      <circle cx="11" cy="76" r="3.5" fill="#2d3748" />
      <line x1="64" y1="87" x2="71" y2="78" stroke="url(#scooty-chrome)" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="73" cy="76" r="5" fill="#141a24" stroke="url(#scooty-chrome)" strokeWidth="1.2" />
      <circle cx="73" cy="76" r="3.5" fill="#2d3748" />

      {/* 15. Handlebar Cowl Headpiece & Digital Speedometer */}
      <path
        d="M 31 82 
           C 31 77, 53 77, 53 82 
           L 51 92 
           C 48 94, 36 94, 33 92 Z"
        fill="url(#scooty-body-red)"
        stroke="#ff4d55"
        strokeWidth="1"
      />
      {/* Digital TFT Screen Display */}
      <rect x="36" y="81" width="12" height="6.5" rx="1.5" fill="#030712" stroke="#38bdf8" strokeWidth="0.7" />
      <rect x="37.5" y="82.5" width="9" height="3.5" rx="0.5" fill="#0284c7" opacity="0.85" />

      {/* 16. Big Cartoon Front Headlight (Prominent & Friendly like the classic car) */}
      <circle
        cx="42"
        cy="104"
        r="6"
        fill="#ffffff"
        stroke="#e2e8f0"
        strokeWidth="1.5"
        filter="drop-shadow(0 0 6px #ffffff)"
      />
      <circle cx="42" cy="104" r="3" fill="#ffffff" opacity="0.9" />
      <circle cx="40" cy="102" r="1.5" fill="#ffffff" />
    </svg>
  );
}

// 8 Real-Life Story Stages (Point A to Point B Journey with TripShield)
const STORY_STEPS = [
  {
    id: 1,
    side: "right",
    range: [0.04, 0.15],
    step: "01 / 08",
    milestone: "Point A Departure",
    title: "Starting the Late Night Commute",
    story:
      "You pack up and leave your workplace at 9:30 PM for a 45 km drive back home. The route takes you across unlit highway bypasses.",
    problem:
      "In traditional driving, you travel alone with zero backup. If anything goes wrong, nobody at home knows where you are or when to worry.",
    solution:
      "One tap starts your trip. An encrypted live tracking link is automatically shared with your family via WhatsApp—no app install required for them.",
  },
  {
    id: 2,
    side: "left",
    range: [0.16, 0.27],
    step: "02 / 08",
    milestone: "Highway Commute",
    title: "No More Distracting Check-in Calls",
    story:
      "Deep into the highway, rain starts falling and visibility drops. Your phone battery drops below 20%.",
    problem:
      "Anxious family members call repeatedly asking 'Where have you reached?', forcing risky one-handed driving to answer.",
    solution:
      "Your family opens the live link to view your scooty's exact location, road speed, and battery level in real time. They stay calm and let you ride focused.",
  },
  {
    id: 3,
    side: "right",
    range: [0.28, 0.39],
    step: "03 / 08",
    milestone: "The Incident",
    title: "Unmarked Hazard on a Dark Curve",
    story:
      "At 10:20 PM, you hit hidden road debris on an unlit bypass curve. The tire blows out, forcing a sudden stop on the dark shoulder.",
    problem:
      "The jolt knocks your phone under the seat. You are stranded in pitch darkness with heavy highway traffic rushing by, unable to reach help.",
    solution:
      "Built-in vehicle telematics instantly detect the sudden impact, deceleration, and stationary position on the road.",
  },
  {
    id: 4,
    side: "left",
    range: [0.40, 0.51],
    step: "04 / 08",
    milestone: "Autonomous Check",
    title: "The 15-Second False-Alarm Buffer",
    story:
      "TripShield automatically triggers a gentle 15-second audio prompt on your dashboard: 'Are you safe?'",
    problem:
      "False-alarm prevention: If it was just a minor bump and you are fine, you simply tap dismiss and continue driving normally.",
    solution:
      "If you are injured or cannot reach your phone, the 15-second timer runs out and TripShield immediately assumes an emergency.",
  },
  {
    id: 5,
    side: "right",
    range: [0.52, 0.63],
    step: "05 / 08",
    milestone: "Emergency Escalation",
    title: "Instant Family SOS & Cabin Audio",
    story:
      "When the timer expires without a response, TripShield shifts your family's tracking link into an active red SOS alert.",
    problem:
      "Normally, families are left in silence and panic for hours when a driver doesn't arrive.",
    solution:
      "Your family receives your exact pinned GPS location and a 60-second recorded audio snippet from the incident scene, giving them instant context.",
  },
  {
    id: 6,
    side: "left",
    range: [0.64, 0.75],
    step: "06 / 08",
    milestone: "Multi-Agency Rescue",
    title: "112 ERSS & Nearest Dealer Recovery",
    story:
      "TripShield coordinates assistance through emergency services and automotive networks simultaneously.",
    problem:
      "Calling a tow truck at midnight usually means stranded drivers trying to guess mile markers and road names.",
    solution:
      "National 112 emergency services receive verified satellite coordinates, while the nearest TripShield Service Center dispatches roadside recovery straight to your scooty.",
  },
  {
    id: 7,
    side: "right",
    range: [0.76, 0.87],
    step: "07 / 08",
    milestone: "Roadside Recovery",
    title: "Vehicle Secured & Instant Insurance FNOL",
    story:
      "The certified recovery team arrives in 14 minutes. Your tire is replaced, the vehicle is inspected, and you're cleared to continue home.",
    problem:
      "Filing an insurance claim usually takes days of paperwork and arguing over impact details.",
    solution:
      "A Notice of Loss (FNOL) is pre-filled automatically with recorded vehicle speed and crash telematics, ready for instant submission.",
  },
  {
    id: 8,
    side: "left",
    range: [0.88, 0.99],
    step: "08 / 08",
    milestone: "Point B Arrival",
    title: "Safe Arrival Confirmed at Home",
    story:
      "You pull safely through your front gate and park at home at 11:15 PM.",
    problem:
      "Without TripShield: A night of terror, uncertainty, and hours stranded alone in the dark.",
    solution:
      "TripShield automatically detects arrival at your destination and pings your family: 'Journey completed safely.' Complete peace of mind from start to finish.",
  },
];

export default function ScrollStoryCar() {
  const containerRef = useRef(null);
  const [activeStepIndex, setActiveStepIndex] = useState(-1);
  const [progressPercent, setProgressPercent] = useState(0);

  // Framer Motion scroll tracking over extended journey distance
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Butter-smooth physics spring to eliminate any scroll stutter
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 85,
    damping: 24,
    mass: 0.45,
    restDelta: 0.0005,
  });

  // Maps progress to car Y position moving from top (6vh) down to bottom (76vh)
  const carY = useTransform(smoothProgress, [0.02, 0.96], ["6vh", "76vh"]);

  // Track progress and determine active story popup
  useMotionValueEvent(smoothProgress, "change", (latest) => {
    const clamped = Math.max(0, Math.min(1, latest));
    setProgressPercent(Math.round(clamped * 100));

    const activeIdx = STORY_STEPS.findIndex(
      (s) => clamped >= s.range[0] && clamped <= s.range[1]
    );
    setActiveStepIndex(activeIdx);
  });

  const activeStep = activeStepIndex !== -1 ? STORY_STEPS[activeStepIndex] : null;

  return (
    <section
      id="story-journey"
      ref={containerRef}
      className="relative w-full bg-[#080808]"
      style={{ height: "540vh" }}
      aria-label="TripShield Real-Life Journey Story"
    >
      {/* Sticky Viewport Stage */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center select-none">
        {/* Deep Dark Ambient Canvas */}
        <div className="absolute inset-0 bg-[#080808]" />

        {/* Ambient Top & Bottom Blends */}
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#07090e] via-[#07090e]/80 to-transparent pointer-events-none z-20" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#07090e] via-[#07090e]/80 to-transparent pointer-events-none z-20" />

        {/* ======================================================== */}
        {/* THE PLAIN ROAD (20% Middle of Screen)                    */}
        {/* ======================================================== */}
        <div className="relative w-[22%] sm:w-[18%] md:w-[16%] max-w-[190px] min-w-[120px] h-full bg-[#0d1017] border-x border-white/5 flex justify-center z-10 shadow-[0_0_50px_rgba(0,0,0,0.9)]">
          {/* Subtle Muted Shoulder Lines */}
          <div className="absolute inset-y-0 left-0 w-0.5 bg-white/10" />
          <div className="absolute inset-y-0 right-0 w-0.5 bg-white/10" />

          {/* Center Dashed Lane Divider */}
          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-0.5 border-r border-dashed border-white/15" />

          {/* Point A Marker at Top (Simple Text) */}
          <div className="absolute top-10 inset-x-0 text-center">
            <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">
              A • START
            </span>
          </div>

          {/* Point B Marker at Bottom (Simple Text) */}
          <div className="absolute bottom-16 inset-x-0 text-center">
            <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">
              B • DESTINATION
            </span>
          </div>

          {/* ======================================================== */}
          {/* SLEEK RED PERFORMANCE SCOOTY (Scrolls Top to Bottom)     */}
          {/* ======================================================== */}
          <motion.div
            style={{ y: carY }}
            className="absolute top-0 left-1/2 -translate-x-1/2 z-20 will-change-transform flex flex-col items-center pointer-events-none"
          >
            <SleekRedScooty />
          </motion.div>
        </div>

        {/* ======================================================== */}
        {/* STORY CARDS: ALTERNATING RIGHT / LEFT (CLEAN TYPOGRAPHY) */}
        {/* ======================================================== */}
        <div className="absolute inset-0 max-w-7xl mx-auto px-4 sm:px-8 pointer-events-none flex items-center justify-center z-30">
          <AnimatePresence mode="wait">
            {activeStep && (
              <motion.div
                key={activeStep.id}
                initial={{
                  opacity: 0,
                  y: 16,
                  x: activeStep.side === "right" ? 24 : -24,
                  scale: 0.98,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                  x: 0,
                  scale: 1,
                }}
                exit={{
                  opacity: 0,
                  y: -12,
                  scale: 0.98,
                }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className={`pointer-events-auto absolute ${
                  // Desktop positioning on alternating sides of center road
                  activeStep.side === "right"
                    ? "lg:left-[62%] xl:left-[60%] lg:top-1/2 lg:-translate-y-1/2"
                    : "lg:right-[62%] xl:right-[60%] lg:top-1/2 lg:-translate-y-1/2"
                } ${
                  // Mobile positioning docked at bottom
                  "bottom-8 left-4 right-4 sm:left-6 sm:right-6 lg:bottom-auto max-w-lg mx-auto lg:mx-0"
                }`}
              >
                <div className="rounded-2xl border border-white/10 bg-[#0c0f17]/95 p-6 sm:p-7 backdrop-blur-xl shadow-2xl transition-all">
                  {/* Clean Text Header: Step and Milestone (No colored button tags) */}
                  <div className="flex items-center justify-between text-xs font-mono text-slate-500 mb-2">
                    <span className="tracking-wider uppercase">{activeStep.milestone}</span>
                    <span>{activeStep.step}</span>
                  </div>

                  {/* Headline */}
                  <h3 className="font-display font-semibold text-white text-lg sm:text-xl tracking-tight leading-snug">
                    {activeStep.title}
                  </h3>

                  {/* Real-Life Context Narrative */}
                  <p className="font-body text-slate-300 text-xs sm:text-sm mt-2.5 leading-relaxed font-normal">
                    {activeStep.story}
                  </p>

                  {/* Clean Typography Comparison (Simple Text, No Colored Badge Chips) */}
                  <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
                    <div>
                      <span className="text-xs font-semibold text-slate-400 block mb-0.5 uppercase tracking-wide">
                        The Problem
                      </span>
                      <p className="text-xs text-slate-400 leading-relaxed font-normal">
                        {activeStep.problem}
                      </p>
                    </div>

                    <div>
                      <span className="text-xs font-semibold text-white block mb-0.5 uppercase tracking-wide">
                        With TripShield
                      </span>
                      <p className="text-xs text-slate-200 leading-relaxed font-normal">
                        {activeStep.solution}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Top Minimal Text Banner */}
        <div className="absolute top-20 sm:top-24 inset-x-0 z-20 px-4 sm:px-8 max-w-7xl mx-auto flex items-center justify-between pointer-events-none text-xs font-mono text-slate-500">
          <span className="tracking-wider uppercase">Journey • Point A to Point B</span>
          <span className="hidden sm:inline">Scroll progress: {progressPercent}%</span>
        </div>

        {/* Scroll Cue (Fades once car moves) */}
        <motion.div
          animate={{ opacity: progressPercent < 4 ? 1 : 0, y: progressPercent < 4 ? 0 : 8 }}
          transition={{ duration: 0.2 }}
          className="absolute bottom-6 inset-x-0 z-20 flex flex-col items-center justify-center gap-1 pointer-events-none"
        >
          <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">
            Scroll to drive
          </span>
          <ChevronDown size={14} className="text-slate-500 animate-bounce" />
        </motion.div>

        {/* Destination Arrival Simple Text Status */}
        <AnimatePresence>
          {progressPercent >= 88 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 pointer-events-auto text-center"
            >
              <span className="text-xs font-mono text-slate-400 tracking-wider uppercase">
                Destination reached safely • Continue scrolling below
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
