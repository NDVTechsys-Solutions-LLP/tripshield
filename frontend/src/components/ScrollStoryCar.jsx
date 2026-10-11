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

// Compact, Professional Top-Down Automotive Vector (Short Red Vehicle)
function CompactRedVehicle() {
  return (
    <svg
      viewBox="0 0 68 112"
      className="w-11 sm:w-13 md:w-14 h-auto drop-shadow-[0_10px_20px_rgba(0,0,0,0.85)]"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Rich Crimson Metallic Body Gradient */}
        <linearGradient id="compact-red-paint" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#A80710" />
          <stop offset="20%" stopColor="#C90812" />
          <stop offset="50%" stopColor="#E50914" />
          <stop offset="80%" stopColor="#F5222D" />
          <stop offset="100%" stopColor="#A80710" />
        </linearGradient>

        {/* Clean Tinted Glass Gradient */}
        <linearGradient id="compact-windshield-glass" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#0c1017" />
          <stop offset="60%" stopColor="#141a24" />
          <stop offset="100%" stopColor="#1e2634" />
        </linearGradient>
      </defs>

      {/* Realistic Ground Shadow */}
      <ellipse cx="34" cy="58" rx="26" ry="48" fill="#000000" opacity="0.6" filter="blur(4px)" />

      {/* 4 Flush Wheels */}
      <rect x="4" y="20" width="5" height="17" rx="2.5" fill="#111318" />
      <rect x="59" y="20" width="5" height="17" rx="2.5" fill="#111318" />
      <rect x="4" y="74" width="5" height="17" rx="2.5" fill="#111318" />
      <rect x="59" y="74" width="5" height="17" rx="2.5" fill="#111318" />

      {/* Main Compact Car Body (Normal Short Proportions) */}
      <path
        d="M 22 10 
           C 26 8, 42 8, 46 10 
           C 52 12, 57 26, 57 48 
           C 57 74, 56 94, 50 102 
           C 46 106, 22 106, 18 102 
           C 12 94, 11 74, 11 48 
           C 11 26, 16 12, 22 10 Z"
        fill="url(#compact-red-paint)"
        stroke="#ff4d55"
        strokeWidth="0.8"
      />

      {/* Front Windshield (Bottom-facing, pointing forward) */}
      <path
        d="M 19 72 
           C 24 76, 44 76, 49 72 
           L 47 85 
           C 43 88, 25 88, 21 85 Z"
        fill="url(#compact-windshield-glass)"
        stroke="#222b3a"
        strokeWidth="0.6"
      />

      {/* Dark Panoramic Glass Roof */}
      <rect x="20" y="38" width="28" height="32" rx="4" fill="#0d1118" stroke="#1d2432" strokeWidth="0.6" />

      {/* Rear Windshield (Top-facing) */}
      <path
        d="M 21 36 
           C 25 33, 43 33, 47 36 
           L 46 25 
           C 42 23, 26 23, 22 25 Z"
        fill="url(#compact-windshield-glass)"
        stroke="#222b3a"
        strokeWidth="0.6"
      />

      {/* Side Windows */}
      <rect x="18" y="42" width="1.5" height="26" rx="0.75" fill="#141a24" />
      <rect x="48.5" y="42" width="1.5" height="26" rx="0.75" fill="#141a24" />

      {/* Sleek Front Headlights (Bottom, pointing forward) */}
      <path
        d="M 17 101 Q 23 104 26 101"
        stroke="#ffffff"
        strokeWidth="2"
        strokeLinecap="round"
        filter="drop-shadow(0 0 2px #fff)"
      />
      <path
        d="M 42 101 Q 45 104 51 101"
        stroke="#ffffff"
        strokeWidth="2"
        strokeLinecap="round"
        filter="drop-shadow(0 0 2px #fff)"
      />

      {/* Sleek Rear Taillight Bar (Top, pointing backward) */}
      <line
        x1="20"
        y1="11"
        x2="48"
        y2="11"
        stroke="#ff1f2d"
        strokeWidth="2"
        strokeLinecap="round"
        filter="drop-shadow(0 0 2.5px #ff1f2d)"
      />

      {/* Side Mirrors */}
      <rect x="8" y="73" width="3" height="6" rx="1.5" fill="#A80710" />
      <rect x="57" y="73" width="3" height="6" rx="1.5" fill="#A80710" />

      {/* Subtle Hood Lines */}
      <line x1="24" y1="88" x2="23" y2="99" stroke="#8c060e" strokeWidth="0.6" strokeLinecap="round" />
      <line x1="44" y1="88" x2="45" y2="99" stroke="#8c060e" strokeWidth="0.6" strokeLinecap="round" />
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
      "Your family opens the live link to view your car's exact location, road speed, and battery level in real time. They stay calm and let you drive focused.",
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
      "Your family receives your exact pinned GPS location and a 60-second recorded audio snippet from the car cabin, giving them instant context.",
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
      "National 112 emergency services receive verified satellite coordinates, while the nearest TripShield Service Center dispatches roadside recovery straight to your car.",
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
          {/* COMPACT RED CAR (Scrolls Top to Bottom)                  */}
          {/* ======================================================== */}
          <motion.div
            style={{ y: carY }}
            className="absolute top-0 left-1/2 -translate-x-1/2 z-20 will-change-transform flex flex-col items-center pointer-events-none"
          >
            <CompactRedVehicle />
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
