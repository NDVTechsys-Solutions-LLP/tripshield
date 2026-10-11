import React, { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { TripShieldMark } from "@/components/BrandMark";
import {
  LayoutDashboard,
  Bike,
  Users,
  Navigation,
  FileText,
  LogOut,
  ShieldCheck,
  Menu,
  X,
  History as HistoryIcon,
  Settings as SettingsIcon,
  Radio,
} from "lucide-react";

const NAV_MAIN = [
  { to: "/app", icon: LayoutDashboard, label: "Command Hub", end: true, testid: "nav-hub" },
  { to: "/app/journey/new", icon: Navigation, label: "Start Journey", testid: "nav-journey" },
  { to: "/app/claim", icon: FileText, label: "Insurance Claim", testid: "nav-claim" },
  { to: "/app/history", icon: HistoryIcon, label: "Journey History", testid: "nav-history" },
];

const NAV_SETTINGS = [
  { to: "/app/settings", icon: SettingsIcon, label: "Preferences", end: true, testid: "nav-settings" },
  { to: "/app/onboarding", icon: Bike, label: "My Vehicle", testid: "nav-vehicle" },
  { to: "/app/contacts", icon: Users, label: "Family Network", testid: "nav-contacts" },
];

const linkClass = ({ isActive }) =>
  `group flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-body text-sm transition-all ${
    isActive
      ? "bg-[#e60012] text-white font-medium shadow-[0_0_18px_rgba(230,0,18,0.35)]"
      : "text-slate-400 hover:bg-white/5 hover:text-white"
  }`;

export default function AppShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(null);

  useEffect(() => {
    api.get("/journeys/active").then((r) => setActive(r.data)).catch(() => {});
  }, []);

  const NavItems = ({ onClick }) => (
    <nav className="flex flex-col gap-1">
      {NAV_MAIN.map((n) => (
        <NavLink key={n.to} to={n.to} end={n.end} data-testid={n.testid} onClick={onClick} className={linkClass}>
          <n.icon size={18} className="shrink-0" />
          <span>{n.label}</span>
        </NavLink>
      ))}

      <p className="text-[11px] font-bold tracking-wider text-slate-400 uppercase px-3.5 mt-5 mb-1.5">
        Settings &amp; Safety
      </p>
      {NAV_SETTINGS.map((n) => (
        <NavLink key={n.to} to={n.to} end={n.end} data-testid={n.testid} onClick={onClick} className={linkClass}>
          <n.icon size={18} className="shrink-0" />
          <span>{n.label}</span>
        </NavLink>
      ))}

      {active && (
        <button
          data-testid="nav-live-journey"
          onClick={() => {
            navigate("/app/journey/live");
            onClick && onClick();
          }}
          className="mt-4 flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl font-body text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25 transition-all cursor-pointer"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>Live Journey Active</span>
        </button>
      )}
    </nav>
  );

  return (
    <div className="min-h-screen bg-[#07090e] text-white hsj-grid-bg selection:bg-[#e60012]/30 selection:text-white flex">
      {/* ======================================================== */}
      {/* Desktop Floating Sidebar                                 */}
      {/* ======================================================== */}
      <aside className="hidden lg:flex w-72 fixed top-4 bottom-4 left-4 z-40 rounded-3xl border border-white/10 bg-[#0a0f1b]/90 backdrop-blur-2xl shadow-2xl flex-col justify-between overflow-hidden">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-6 h-20 border-b border-white/10 bg-black/20">
          <TripShieldMark size={32} glow />
          <div>
            <p className="font-display font-extrabold text-[#e60012] text-base leading-none tracking-tight">
              TRIPSHIELD
            </p>
            <p className="text-[10px] font-semibold tracking-wider text-slate-400 mt-1 uppercase">
              Connected Safety
            </p>
          </div>
        </div>

        {/* Navigation items */}
        <div className="flex-1 overflow-y-auto p-4 hsj-scroll">
          <NavItems />
        </div>

        {/* User profile footer */}
        <UserFoot user={user} logout={logout} />
      </aside>

      {/* ======================================================== */}
      {/* Mobile Floating Curved Topbar                            */}
      {/* ======================================================== */}
      <div className="lg:hidden fixed top-3 inset-x-3 z-40 h-14 rounded-full border border-white/10 bg-[#0a0f1b]/95 backdrop-blur-xl px-5 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-2.5">
          <TripShieldMark size={26} glow />
          <span className="font-display font-extrabold text-[#e60012] text-base tracking-wide">
            TRIPSHIELD
          </span>
        </div>
        <button
          data-testid="mobile-menu-toggle"
          onClick={() => setOpen(true)}
          className="text-white p-1.5 rounded-full hover:bg-white/10 transition-colors"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Mobile Drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/75 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="w-72 bg-[#0a0f1b] border-l border-white/10 flex flex-col justify-between shadow-2xl">
            <div className="flex items-center justify-between px-5 h-16 border-b border-white/10 bg-black/20">
              <div className="flex items-center gap-2">
                <TripShieldMark size={24} glow />
                <span className="font-display font-bold text-[#e60012] text-sm">TRIPSHIELD</span>
              </div>
              <button
                data-testid="mobile-menu-close"
                onClick={() => setOpen(false)}
                className="text-slate-400 hover:text-white p-1"
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <NavItems onClick={() => setOpen(false)} />
            </div>
            <UserFoot user={user} logout={logout} />
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* Main Content Area                                        */}
      {/* ======================================================== */}
      <main className="flex-1 lg:pl-80 pt-20 lg:pt-6 min-h-screen">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

function UserFoot({ user, logout }) {
  return (
    <div className="p-4 border-t border-white/10 bg-black/20">
      <div className="flex items-center gap-3 mb-3 p-2 rounded-xl bg-white/5 border border-white/5">
        {user?.picture ? (
          <img src={user.picture} alt="" className="w-8 h-8 rounded-full border border-white/20 shrink-0" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-[#e60012]/20 flex items-center justify-center text-[#e60012] shrink-0">
            <ShieldCheck size={16} />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-xs text-white truncate font-medium">{user?.name || "Rider"}</p>
          <p className="text-[11px] text-slate-400 truncate font-medium">{user?.email}</p>
        </div>
      </div>
      <button
        data-testid="logout-button"
        onClick={logout}
        className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider text-slate-400 hover:text-white border border-white/10 hover:border-[#e60012]/40 hover:bg-[#e60012]/10 transition-all cursor-pointer"
      >
        <LogOut size={14} /> Sign Out
      </button>
    </div>
  );
}
