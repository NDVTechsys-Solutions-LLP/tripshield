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

// Clean, Bold Cartoon Scooty with Rider on Top (Matching User Reference in Black & Red)
function RiderScooty() {
  return (
    <svg
      viewBox="0 0 90 144"
      className="w-16 sm:w-20 md:w-24 lg:w-28 h-auto drop-shadow-[0_18px_36px_rgba(0,0,0,0.85)]"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Vibrant Red Paint Gradient */}
        <linearGradient id="scooty-red" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#9E000B" />
          <stop offset="20%" stopColor="#C90812" />
          <stop offset="50%" stopColor="#E50914" />
          <stop offset="80%" stopColor="#C90812" />
          <stop offset="100%" stopColor="#9E000B" />
        </linearGradient>

        {/* Headlight Forward Beam Cone */}
        <linearGradient id="scooty-headlight-cone" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
          <stop offset="40%" stopColor="#ffe4e6" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#ff2330" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* 1. Soft Ground Shadow */}
      <ellipse cx="45" cy="74" rx="26" ry="52" fill="#000000" opacity="0.6" filter="blur(6px)" />

      {/* 2. Radiant Forward Headlight Cone (Illuminating the Road) */}
      <polygon points="45,130 16,144 74,144" fill="url(#scooty-headlight-cone)" />

      {/* 3. Rear Wheel (Trailing at Top) */}
      <rect x="40.5" y="8" width="9" height="20" rx="4.5" fill="#10131a" stroke="#222834" strokeWidth="1" />

      {/* 4. Rear Mudguard Tip & Reflector */}
      <path d="M 38 18 C 38 14, 52 14, 52 18 L 51 28 L 39 28 Z" fill="#e50914" stroke="#ff3845" strokeWidth="0.8" />
      <rect x="42" y="15" width="6" height="3" rx="1" fill="#f59e0b" />

      {/* 5. Scooty Rear Body (Smooth Rounded Cartoon Flanks, matching Reference) */}
      <path
        d="M 29 28 
           C 25 44, 25 60, 28 76 
           L 62 76 
           C 65 60, 65 44, 61 28 
           C 55 22, 35 22, 29 28 Z"
        fill="url(#scooty-red)"
        stroke="#ff4d55"
        strokeWidth="1.2"
      />
      {/* Glossy Curved Body Highlights */}
      <path d="M 31 38 C 28 48, 28 62, 30 70" stroke="#ff858c" strokeWidth="1.2" strokeLinecap="round" opacity="0.75" />
      <path d="M 59 38 C 62 48, 62 62, 60 70" stroke="#ff858c" strokeWidth="1.2" strokeLinecap="round" opacity="0.75" />

      {/* 6. Chrome / Silver Rear Tubular Grab Bar (like Reference) */}
      <path
        d="M 33 26 C 37 18, 53 18, 57 26"
        fill="none"
        stroke="#e2e8f0"
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* 7. Bright Red LED Taillight */}
      <path
        d="M 37 24 C 41 21, 49 21, 53 24 L 51 28 C 48 26, 42 26, 39 28 Z"
        fill="#ff1f2d"
        stroke="#ffffff"
        strokeWidth="0.8"
      />

      {/* 8. Scooty Seat (Rounded Oval Cushion) */}
      <path
        d="M 33 30 
           C 30 40, 30 56, 33 66 
           C 38 69, 52 69, 57 66 
           C 60 56, 60 40, 57 30 
           C 52 26, 38 26, 33 30 Z"
        fill="#151922"
        stroke="#e50914"
        strokeWidth="1"
      />

      {/* 9. Floorboard / Footdeck */}
      <rect x="28" y="70" width="34" height="32" rx="4" fill="#0d1017" stroke="#222a38" strokeWidth="1" />
      <line x1="32" y1="76" x2="58" y2="76" stroke="#222a38" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="32" y1="82" x2="58" y2="82" stroke="#222a38" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="32" y1="88" x2="58" y2="88" stroke="#222a38" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="32" y1="94" x2="58" y2="94" stroke="#222a38" strokeWidth="1.2" strokeLinecap="round" />

      {/* 10. Rider Legs & Knees (Resting on Floorboard, Black & Red) */}
      {/* Left Leg */}
      <path
        d="M 33 52 C 28 62, 27 74, 30 86 L 36 86 C 34 76, 36 65, 39 56 Z"
        fill="#161b26"
        stroke="#2a3445"
        strokeWidth="0.8"
      />
      <rect x="29" y="84" width="7" height="6" rx="2.5" fill="#e50914" />
      {/* Right Leg */}
      <path
        d="M 57 52 C 62 62, 63 74, 60 86 L 54 86 C 56 76, 54 65, 51 56 Z"
        fill="#161b26"
        stroke="#2a3445"
        strokeWidth="0.8"
      />
      <rect x="54" y="84" width="7" height="6" rx="2.5" fill="#e50914" />

      {/* 11. Rider Torso & Shoulders (Black Jacket with Red Sports Accents) */}
      <path
        d="M 28 78 
           C 26 66, 32 58, 45 58 
           C 58 58, 64 66, 62 78 
           C 56 83, 34 83, 28 78 Z"
        fill="#181d27"
        stroke="#2a3344"
        strokeWidth="1"
      />
      {/* Red Center Sports Stripe */}
      <path d="M 43 60 L 47 60 L 48 78 L 42 78 Z" fill="#e50914" />

      {/* 12. Rider Arms (Reaching Forward to Handlebars, like Reference) */}
      {/* Left Arm */}
      <path
        d="M 29 76 C 21 86, 18 97, 21 110 L 26 110 C 24 99, 27 89, 34 80 Z"
        fill="#181d27"
        stroke="#2a3344"
        strokeWidth="1"
      />
      <rect x="20" y="106" width="6" height="2" rx="1" fill="#e50914" />
      {/* Left Hand Gripping Bar */}
      <ellipse cx="23" cy="111" rx="4" ry="4" fill="#e0a98b" stroke="#333333" strokeWidth="0.8" />

      {/* Right Arm */}
      <path
        d="M 61 76 C 69 86, 72 97, 69 110 L 64 110 C 66 99, 63 89, 56 80 Z"
        fill="#181d27"
        stroke="#2a3344"
        strokeWidth="1"
      />
      <rect x="64" y="106" width="6" height="2" rx="1" fill="#e50914" />
      {/* Right Hand Gripping Bar */}
      <ellipse cx="67" cy="111" rx="4" ry="4" fill="#e0a98b" stroke="#333333" strokeWidth="0.8" />

      {/* 13. Rider Head / Helmet (Viewed from Top, Round & Stylized like Reference) */}
      <circle cx="45" cy="70" r="13" fill="#10141d" stroke="#2a3344" strokeWidth="1.2" />
      {/* Red Racing Stripe on Helmet */}
      <path d="M 42 58 C 44 57, 46 57, 48 58 L 48 82 C 46 83, 44 83, 42 82 Z" fill="#e50914" />
      {/* Forward Visor Rim */}
      <path d="M 36 78 C 40 82, 50 82, 54 78" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.9" />
      {/* Glossy Crown Highlight */}
      <ellipse cx="41" cy="65" rx="3.5" ry="2" fill="#ffffff" opacity="0.3" />

      {/* 14. Front Apron / Shield (Red) */}
      <path
        d="M 29 96 
           C 22 104, 21 116, 28 126 
           C 34 132, 56 132, 62 126 
           C 69 116, 68 104, 61 96 Z"
        fill="url(#scooty-red)"
        stroke="#ff4d55"
        strokeWidth="1.2"
      />
      <line x1="45" y1="104" x2="45" y2="124" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />

      {/* 15. Handlebars & Cowl Headpiece (Red) */}
      <path
        d="M 31 106 
           C 31 101, 59 101, 59 106 
           L 56 115 
           C 50 117, 40 117, 34 115 Z"
        fill="url(#scooty-red)"
        stroke="#ff4d55"
        strokeWidth="1"
      />
      {/* Speedometer Instrument Display */}
      <ellipse cx="45" cy="108" rx="7" ry="3.5" fill="#080c14" stroke="#38bdf8" strokeWidth="0.8" />
      <ellipse cx="45" cy="108" rx="4.5" ry="2" fill="#0284c7" opacity="0.85" />

      {/* Handlebar Grips & Levers */}
      <line x1="15" y1="111" x2="75" y2="111" stroke="#111620" strokeWidth="4.5" strokeLinecap="round" />
      <rect x="14" y="108.5" width="9" height="5" rx="2" fill="#000000" stroke="#333d4e" strokeWidth="0.8" />
      <rect x="67" y="108.5" width="9" height="5" rx="2" fill="#000000" stroke="#333d4e" strokeWidth="0.8" />
      <line x1="12" y1="113" x2="19" y2="114" stroke="#e2e8f0" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="78" y1="113" x2="71" y2="114" stroke="#e2e8f0" strokeWidth="1.5" strokeLinecap="round" />

      {/* 16. Prominent Oval Rear-View Mirrors (Direct from Reference Image) */}
      {/* Left Mirror */}
      <line x1="25" y1="108" x2="14" y2="97" stroke="#e2e8f0" strokeWidth="2.4" strokeLinecap="round" />
      <ellipse cx="12" cy="95" rx="6.5" ry="4.5" fill="#141a24" stroke="#e2e8f0" strokeWidth="1.2" />
      <ellipse cx="12" cy="95" rx="4.8" ry="3.2" fill="#38bdf8" opacity="0.9" />

      {/* Right Mirror */}
      <line x1="65" y1="108" x2="76" y2="97" stroke="#e2e8f0" strokeWidth="2.4" strokeLinecap="round" />
      <ellipse cx="78" cy="95" rx="6.5" ry="4.5" fill="#141a24" stroke="#e2e8f0" strokeWidth="1.2" />
      <ellipse cx="78" cy="95" rx="4.8" ry="3.2" fill="#38bdf8" opacity="0.9" />

      {/* 17. Front Fender & Wheel (Leading Forward) */}
      <path
        d="M 37 124 C 37 118, 53 118, 53 124 L 51 133 L 39 133 Z"
        fill="url(#scooty-red)"
        stroke="#ff4d55"
        strokeWidth="0.8"
      />
      <rect x="41" y="127" width="8" height="15" rx="4" fill="#12161f" stroke="#252d3d" strokeWidth="1" />

      {/* 18. Big Friendly Cartoon Front Headlight */}
      <circle
        cx="45"
        cy="129"
        r="5.5"
        fill="#ffffff"
        stroke="#cbd5e1"
        strokeWidth="1.4"
        filter="drop-shadow(0 0 5px #ffffff)"
      />
      <circle cx="43.5" cy="127.5" r="1.8" fill="#ffffff" />
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
          {/* CARTOON SCOOTY WITH RIDER (Scrolls Top to Bottom)        */}
          {/* ======================================================== */}
          <motion.div
            style={{ y: carY }}
            className="absolute top-0 left-1/2 -translate-x-1/2 z-20 will-change-transform flex flex-col items-center pointer-events-none"
          >
            <RiderScooty />
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
