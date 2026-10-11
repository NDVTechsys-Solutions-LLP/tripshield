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

// Aggressive, Athletic Top-Down Hyper-Sport Superbike Vector (Large, Sleek, Aerodynamic)
function HyperSportBike() {
  return (
    <svg
      viewBox="0 0 76 168"
      className="w-14 sm:w-16 md:w-18 lg:w-20 h-auto drop-shadow-[0_22px_42px_rgba(0,0,0,0.98)]"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Dynamic Hyper-Red Glossy Fairing Gradient */}
        <linearGradient id="hsb-red" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#8A000A" />
          <stop offset="22%" stopColor="#C90812" />
          <stop offset="50%" stopColor="#FF1E28" />
          <stop offset="78%" stopColor="#C90812" />
          <stop offset="100%" stopColor="#8A000A" />
        </linearGradient>

        {/* Deep Carbon Fiber Accent Gradient */}
        <linearGradient id="hsb-carbon" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1f242d" />
          <stop offset="50%" stopColor="#11141a" />
          <stop offset="100%" stopColor="#080a0e" />
        </linearGradient>

        {/* Titanium Gold Inverted Fork Gradient */}
        <linearGradient id="hsb-gold-fork" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#b45309" />
          <stop offset="40%" stopColor="#f59e0b" />
          <stop offset="70%" stopColor="#fef08a" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>

        {/* Billet Aluminum / Alloy Gradient */}
        <linearGradient id="hsb-alloy" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#cbd5e1" />
          <stop offset="50%" stopColor="#64748b" />
          <stop offset="100%" stopColor="#94a3b8" />
        </linearGradient>

        {/* Burning Titanium Exhaust Pipe Gradient */}
        <linearGradient id="hsb-exhaust" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1e293b" />
          <stop offset="30%" stopColor="#3b82f6" />
          <stop offset="60%" stopColor="#a855f7" />
          <stop offset="85%" stopColor="#eab308" />
          <stop offset="100%" stopColor="#64748b" />
        </linearGradient>

        {/* Alcantara Racing Seat Texture */}
        <linearGradient id="hsb-seat" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#181c24" />
          <stop offset="50%" stopColor="#222834" />
          <stop offset="100%" stopColor="#101318" />
        </linearGradient>

        {/* Twin Projector Headlight Road Illumination Cones */}
        <linearGradient id="hsb-beam-left" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="25%" stopColor="#67e8f9" stopOpacity="0.4" />
          <stop offset="75%" stopColor="#ff2a38" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#ff1f2d" stopOpacity="0" />
        </linearGradient>

        <linearGradient id="hsb-beam-right" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="25%" stopColor="#67e8f9" stopOpacity="0.4" />
          <stop offset="75%" stopColor="#ff2a38" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#ff1f2d" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* ======================================================== */}
      {/* 1. AERODYNAMIC ROAD LIGHT BEAMS (Forward Down Tarmac)     */}
      {/* ======================================================== */}
      <polygon points="32,142 8,168 36,168" fill="url(#hsb-beam-left)" />
      <polygon points="44,142 40,168 68,168" fill="url(#hsb-beam-right)" />

      {/* ======================================================== */}
      {/* 2. GROUND CONTACT SHADOW (Tight, Athletic, Floating)     */}
      {/* ======================================================== */}
      <ellipse cx="38" cy="88" rx="19" ry="72" fill="#000000" opacity="0.75" filter="blur(6px)" />

      {/* ======================================================== */}
      {/* 3. EXPOSED REAR TIRE (Wide 200-Section Superbike Slick)   */}
      {/* ======================================================== */}
      {/* Tire Body */}
      <rect x="32" y="8" width="12" height="38" rx="6" fill="#080a0f" stroke="#1e2430" strokeWidth="1" />
      {/* Tread Grooves (Sport Sipes) */}
      <line x1="33" y1="14" x2="37" y2="18" stroke="#1e2533" strokeWidth="1" strokeLinecap="round" />
      <line x1="43" y1="14" x2="39" y2="18" stroke="#1e2533" strokeWidth="1" strokeLinecap="round" />
      <line x1="33" y1="24" x2="37" y2="28" stroke="#1e2533" strokeWidth="1" strokeLinecap="round" />
      <line x1="43" y1="24" x2="39" y2="28" stroke="#1e2533" strokeWidth="1" strokeLinecap="round" />
      <line x1="33" y1="34" x2="37" y2="38" stroke="#1e2533" strokeWidth="1" strokeLinecap="round" />
      <line x1="43" y1="34" x2="39" y2="38" stroke="#1e2533" strokeWidth="1" strokeLinecap="round" />

      {/* Rear Hugger Fender (Carbon Minimalist) */}
      <path d="M 33 28 C 33 22, 43 22, 43 28 L 42 36 L 34 36 Z" fill="url(#hsb-carbon)" stroke="#334155" strokeWidth="0.6" />

      {/* Aluminum Swingarm Struts */}
      <line x1="28" y1="26" x2="32" y2="44" stroke="url(#hsb-alloy)" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="48" y1="26" x2="44" y2="44" stroke="url(#hsb-alloy)" strokeWidth="2.5" strokeLinecap="round" />

      {/* Titanium Race Exhaust Muffler (Right Flank) */}
      <path
        d="M 46 36 L 51 34 L 52 56 L 47 58 Z"
        fill="url(#hsb-exhaust)"
        stroke="#475569"
        strokeWidth="0.8"
      />
      {/* Carbon Exhaust End-Cap */}
      <polygon points="46,36 51,34 50,31 45,33" fill="#0f172a" stroke="#cbd5e1" strokeWidth="0.6" />

      {/* ======================================================== */}
      {/* 4. RAZOR-SHARP AERODYNAMIC TAIL COWL (Wasp Tail)          */}
      {/* ======================================================== */}
      {/* Tail Fairing Body (Sharply Tapered, NOT round or fat) */}
      <path
        d="M 38 22 
           L 44 38 
           L 46 54 
           L 44 64 
           L 32 64 
           L 30 54 
           L 32 38 Z"
        fill="url(#hsb-red)"
        stroke="#ff3845"
        strokeWidth="1.2"
      />
      {/* Center Pearl Racing Stripe on Tail */}
      <polygon points="37,24 39,24 39.5,60 36.5,60" fill="#ffffff" opacity="0.9" />

      {/* Dual Aerodynamic Air Flow Tunnels (Panigale-Style Aero Ducts) */}
      <path d="M 33 42 L 35 50 L 33 54 Z" fill="#090d14" stroke="#ff4d55" strokeWidth="0.6" />
      <path d="M 43 42 L 41 50 L 43 54 Z" fill="#090d14" stroke="#ff4d55" strokeWidth="0.6" />

      {/* Dual Blade Neon-Red LED Taillights on Tail Fins */}
      <line x1="31" y1="34" x2="36" y2="24" stroke="#ff1f2d" strokeWidth="1.8" strokeLinecap="round" filter="drop-shadow(0 0 3px #ff1f2d)" />
      <line x1="45" y1="34" x2="40" y2="24" stroke="#ff1f2d" strokeWidth="1.8" strokeLinecap="round" filter="drop-shadow(0 0 3px #ff1f2d)" />

      {/* ======================================================== */}
      {/* 5. TUCKED-IN ATHLETIC RIDER SEAT (Slim Waistline)        */}
      {/* ======================================================== */}
      <path
        d="M 32 64 
           L 44 64 
           L 45 84 
           L 38 88 
           L 31 84 Z"
        fill="url(#hsb-seat)"
        stroke="#272e3d"
        strokeWidth="1"
      />
      {/* Red Contrast Race Stitching */}
      <line x1="33" y1="66" x2="32.5" y2="82" stroke="#ff3845" strokeWidth="0.7" strokeDasharray="2 1.5" />
      <line x1="43" y1="66" x2="43.5" y2="82" stroke="#ff3845" strokeWidth="0.7" strokeDasharray="2 1.5" />

      {/* ======================================================== */}
      {/* 6. SCULPTED MUSCULAR FUEL TANK & ERGONOMIC KNEE RECESSES */}
      {/* ======================================================== */}
      {/* Main Tank Body (Hourglass: Narrow at knees, athletic shoulders) */}
      <path
        d="M 31 84 
           C 27 88, 26 96, 28 104 
           L 24 114 
           L 52 114 
           L 48 104 
           C 50 96, 49 88, 45 84 Z"
        fill="url(#hsb-red)"
        stroke="#ff4d55"
        strokeWidth="1.2"
      />
      {/* Matte Black Rubber Knee Grip Pads (Left & Right Flanks) */}
      <path d="M 27 90 C 26 96, 27 102, 29 104 L 28 104 C 25 101, 25 95, 27 90 Z" fill="#090d15" />
      <path d="M 49 90 C 50 96, 49 102, 47 104 L 48 104 C 51 101, 51 95, 49 90 Z" fill="#090d15" />

      {/* Carbon Fiber Spine Tank Protector */}
      <polygon points="36,86 40,86 41,108 35,108" fill="url(#hsb-carbon)" stroke="#334155" strokeWidth="0.5" />

      {/* Aircraft Aluminum Fuel Cap */}
      <circle cx="38" cy="100" r="3.2" fill="url(#hsb-alloy)" stroke="#1e293b" strokeWidth="0.7" />
      <circle cx="38" cy="100" r="1.4" fill="#0f172a" />

      {/* High-Gloss Light Flare along Tank Shoulders */}
      <path d="M 27 108 L 32 94" stroke="#ff858c" strokeWidth="1" strokeLinecap="round" opacity="0.8" />
      <path d="M 49 108 L 44 94" stroke="#ff858c" strokeWidth="1" strokeLinecap="round" opacity="0.8" />

      {/* ======================================================== */}
      {/* 7. COCKPIT, TRIPLE CLAMP & CLIP-ON RACING BARS           */}
      {/* ======================================================== */}
      {/* CNC Billet Top Triple Tree */}
      <path d="M 25 116 L 51 116 L 47 122 L 29 122 Z" fill="url(#hsb-alloy)" stroke="#334155" strokeWidth="0.8" />
      <circle cx="38" cy="119" r="2.2" fill="#090d15" stroke="url(#hsb-alloy)" strokeWidth="0.6" />

      {/* Digital Full-Color Racing TFT Instrument Cluster */}
      <rect x="32" y="112" width="12" height="7" rx="1.5" fill="#020617" stroke="#38bdf8" strokeWidth="0.8" />
      <rect x="33.5" y="113.5" width="9" height="4" rx="0.5" fill="#082f49" />
      {/* Cyan Speedo Arc & RPM Redline Bar */}
      <line x1="34" y1="114.5" x2="41" y2="114.5" stroke="#38bdf8" strokeWidth="0.8" />
      <line x1="39.5" y1="114.5" x2="41.5" y2="114.5" stroke="#ef4444" strokeWidth="0.8" />

      {/* Wide Clip-on Handlebars */}
      <line x1="14" y1="120" x2="62" y2="120" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" />
      {/* Diamond-Grip Left Handle */}
      <rect x="12" y="117.5" width="10" height="5" rx="2" fill="#030712" stroke="#334155" strokeWidth="0.7" />
      {/* Diamond-Grip Right Handle */}
      <rect x="54" y="117.5" width="10" height="5" rx="2" fill="#030712" stroke="#334155" strokeWidth="0.7" />

      {/* CNC Alloy Racing Brake & Clutch Levers */}
      <line x1="10" y1="122" x2="19" y2="122" stroke="url(#hsb-alloy)" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="66" y1="122" x2="57" y2="122" stroke="url(#hsb-alloy)" strokeWidth="1.4" strokeLinecap="round" />

      {/* Aerodynamic Stealth Winglet Mirrors (Bar-End) */}
      <polygon points="9,116 13,119 10,121" fill="url(#hsb-carbon)" stroke="#94a3b8" strokeWidth="0.5" />
      <polygon points="67,116 63,119 66,121" fill="url(#hsb-carbon)" stroke="#94a3b8" strokeWidth="0.5" />

      {/* ======================================================== */}
      {/* 8. MOTOGP-STYLE AERODYNAMIC DOWNFORCE WINGLETS           */}
      {/* ======================================================== */}
      {/* Left Carbon Downforce Winglet */}
      <polygon points="12,126 24,124 23,130 11,131" fill="url(#hsb-carbon)" stroke="#ff3845" strokeWidth="0.8" />
      <line x1="11" y1="128" x2="11" y2="133" stroke="#ff1f2d" strokeWidth="1.5" strokeLinecap="round" />

      {/* Right Carbon Downforce Winglet */}
      <polygon points="64,126 52,124 53,130 65,131" fill="url(#hsb-carbon)" stroke="#ff3845" strokeWidth="0.8" />
      <line x1="65" y1="128" x2="65" y2="133" stroke="#ff1f2d" strokeWidth="1.5" strokeLinecap="round" />

      {/* ======================================================== */}
      {/* 9. SHARK-NOSE FRONT COWL & TWIN PROJECTOR LED HEADLIGHTS */}
      {/* ======================================================== */}
      {/* Aerodynamic Front Fairing Nose */}
      <path
        d="M 23 124 
           L 53 124 
           L 48 142 
           L 38 147 
           L 28 142 Z"
        fill="url(#hsb-red)"
        stroke="#ff4d55"
        strokeWidth="1.2"
      />

      {/* Tinted Polycarbonate Windscreen / Bubble Screen */}
      <path
        d="M 32 120 
           L 44 120 
           L 42 133 
           L 38 135 
           L 34 133 Z"
        fill="#0284c7"
        opacity="0.45"
        stroke="#38bdf8"
        strokeWidth="0.8"
      />

      {/* Central Ram-Air Intake Snorkel (Between Headlights) */}
      <polygon points="36,140 40,140 39,144 37,144" fill="#000000" stroke="#334155" strokeWidth="0.6" />

      {/* Predatory Left Projector LED Eye */}
      <polygon points="29,136 35,138 33,142 28,139" fill="#ffffff" filter="drop-shadow(0 0 5px #67e8f9)" stroke="#67e8f9" strokeWidth="0.6" />
      <circle cx="31.5" cy="139" r="1.3" fill="#ffffff" />

      {/* Predatory Right Projector LED Eye */}
      <polygon points="47,136 41,138 43,142 48,139" fill="#ffffff" filter="drop-shadow(0 0 5px #67e8f9)" stroke="#67e8f9" strokeWidth="0.6" />
      <circle cx="44.5" cy="139" r="1.3" fill="#ffffff" />

      {/* ======================================================== */}
      {/* 10. INVERTED GOLD FORKS & DUAL BREMBO BRAKE ROTORS       */}
      {/* ======================================================== */}
      {/* Inverted Gold Front Forks (USD Öhlins style) */}
      <rect x="27.5" y="130" width="3.5" height="24" rx="1.5" fill="url(#hsb-gold-fork)" stroke="#78350f" strokeWidth="0.6" />
      <rect x="45" y="130" width="3.5" height="24" rx="1.5" fill="url(#hsb-gold-fork)" stroke="#78350f" strokeWidth="0.6" />

      {/* Dual Drilled Performance Brake Discs */}
      <rect x="31" y="138" width="1.8" height="20" rx="0.9" fill="url(#hsb-alloy)" stroke="#334155" strokeWidth="0.5" />
      <rect x="43.2" y="138" width="1.8" height="20" rx="0.9" fill="url(#hsb-alloy)" stroke="#334155" strokeWidth="0.5" />

      {/* Red Brembo Radial Racing Brake Calipers */}
      <rect x="29.5" y="144" width="2.5" height="7" rx="1" fill="#dc2626" stroke="#f87171" strokeWidth="0.5" />
      <rect x="44" y="144" width="2.5" height="7" rx="1" fill="#dc2626" stroke="#f87171" strokeWidth="0.5" />

      {/* Front Tire (Leading, Gripping the Asphalt) */}
      <rect x="33.5" y="132" width="9" height="32" rx="4.5" fill="#080a0f" stroke="#1e2430" strokeWidth="1" />
      <line x1="38" y1="135" x2="38" y2="161" stroke="#1e2533" strokeWidth="1" strokeDasharray="3 2" />

      {/* Aerodynamic Front Carbon Wheel Hugger / Mudguard */}
      <path
        d="M 33 135 
           C 33 129, 43 129, 43 135 
           L 42 148 
           L 34 148 Z"
        fill="url(#hsb-carbon)"
        stroke="#ff4d55"
        strokeWidth="0.7"
      />
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
          {/* HYPER-SPORT PERFORMANCE BIKE (Scrolls Top to Bottom)     */}
          {/* ======================================================== */}
          <motion.div
            style={{ y: carY }}
            className="absolute top-0 left-1/2 -translate-x-1/2 z-20 will-change-transform flex flex-col items-center pointer-events-none"
          >
            <HyperSportBike />
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
