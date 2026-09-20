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
  `group flex items-center gap-3 px-4 py-3 rounded-lg font-body text-sm transition-colors ${
    isActive
      ? "bg-[#e60012] text-white shadow-lg shadow-[#e60012]/25"
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
          <n.icon size={18} />
          <span>{n.label}</span>
        </NavLink>
      ))}

      <p className="font-mono text-[10px] tracking-widest text-slate-600 uppercase px-4 mt-5 mb-1">
        Safe Journey Settings
      </p>
      {NAV_SETTINGS.map((n) => (
        <NavLink key={n.to} to={n.to} end={n.end} data-testid={n.testid} onClick={onClick} className={linkClass}>
          <n.icon size={18} />
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
          className="mt-4 flex items-center gap-3 px-4 py-3 rounded-lg font-body text-sm bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
          </span>
          Live Journey Active
        </button>
      )}
    </nav>
  );

  return (
    <div className="min-h-screen bg-background hsj-grid-bg flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-72 flex-col border-r border-white/10 bg-[#0b0f17]/80 backdrop-blur-md fixed h-screen">
        <div className="flex items-center gap-3 px-6 h-20 border-b border-white/10">
          <span className="text-[#e60012]"><TripShieldMark size={34} /></span>
          <div>
            <p className="font-display font-extrabold text-white leading-none tracking-tight">
              SAFE JOURNEY
            </p>
            <p className="font-mono text-[10px] tracking-widest text-slate-500 mt-1">
              CONNECTED MOBILITY
            </p>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <NavItems />
        </div>
        <UserFoot user={user} logout={logout} />
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-40 h-16 flex items-center justify-between px-4 border-b border-white/10 bg-[#0b0f17]/95 backdrop-blur-md">
        <div className="flex items-center gap-2 text-[#e60012]">
          <TripShieldMark size={26} />
          <span className="font-display font-extrabold text-white text-sm">SAFE JOURNEY</span>
        </div>
        <button data-testid="mobile-menu-toggle" onClick={() => setOpen(true)} className="text-white p-2">
          <Menu size={22} />
        </button>
      </div>

      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/70 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="w-72 bg-[#0b0f17] border-l border-white/10 flex flex-col">
            <div className="flex items-center justify-between px-5 h-16 border-b border-white/10">
              <span className="font-display font-bold text-white">MENU</span>
              <button data-testid="mobile-menu-close" onClick={() => setOpen(false)} className="text-slate-400">
                <X size={22} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <NavItems onClick={() => setOpen(false)} />
            </div>
            <UserFoot user={user} logout={logout} />
          </div>
        </div>
      )}

      {/* Main */}
      <main className="flex-1 lg:ml-72 pt-16 lg:pt-0 min-h-screen">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

function UserFoot({ user, logout }) {
  return (
    <div className="p-4 border-t border-white/10">
      <div className="flex items-center gap-3 mb-3">
        {user?.picture ? (
          <img src={user.picture} alt="" className="w-9 h-9 rounded-full border border-white/20" />
        ) : (
          <div className="w-9 h-9 rounded-full bg-[#e60012]/20 flex items-center justify-center text-[#e60012]">
            <ShieldCheck size={18} />
          </div>
        )}
        <div className="min-w-0">
          <p className="text-sm text-white truncate font-medium">{user?.name || "Rider"}</p>
          <p className="text-[11px] text-slate-500 truncate font-mono">{user?.email}</p>
        </div>
      </div>
      <button
        data-testid="logout-button"
        onClick={logout}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm text-slate-400 border border-white/10 hover:border-[#e60012]/50 hover:text-white transition-colors"
      >
        <LogOut size={16} /> Sign Out
      </button>
    </div>
  );
}
