import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useRole } from "../hooks/useRole";
import { getNavLinks, getRoleMeta, ROLES } from "../utils/roles";
import { StartupSelector } from "./UI";

// ── Profile dropdown ──────────────────────────────────────────────────────────
function ProfileDropdown({ email, role, meta, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    function handle(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const initial = email?.[0]?.toUpperCase() ?? "?";

  return (
    <div className="relative" ref={ref}>
      {/* Avatar button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-white/5 transition-all group"
      >
        {/* Avatar circle */}
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black border-2 shrink-0"
          style={{ background: meta.bg, borderColor: meta.border, color: meta.color }}
        >
          {initial}
        </div>
        <div className="hidden md:block text-left">
          <div className="text-xs font-semibold text-white/70 max-w-[120px] truncate leading-tight">{email ?? "User"}</div>
          <div className="text-[10px] font-bold tracking-widest uppercase leading-tight" style={{ color: meta.color }}>{meta.label}</div>
        </div>
        {/* Chevron */}
        <span className={`text-white/25 text-xs transition-transform duration-200 ${open ? "rotate-180" : ""}`}>▾</span>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-white/10 bg-[#0d1117]/98 backdrop-blur-xl shadow-2xl overflow-hidden z-50 animate-dropDown">
          {/* Profile header */}
          <div className="px-4 py-3 border-b border-white/[0.06]">
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black border-2 shrink-0"
                style={{ background: meta.bg, borderColor: meta.border, color: meta.color }}
              >
                {initial}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-white truncate">{email}</div>
                <span
                  className="inline-flex items-center gap-1 text-[10px] font-bold tracking-widest uppercase px-1.5 py-0.5 rounded-full border mt-0.5"
                  style={{ color: meta.color, background: meta.bg, borderColor: meta.border }}
                >
                  <span className="w-1 h-1 rounded-full" style={{ background: meta.color }} />
                  {meta.label}
                </span>
              </div>
            </div>
          </div>

          {/* Menu items */}
          <div className="py-1.5">
            <DropItem to="/dashboard" icon="◈" label="Dashboard" onClick={() => setOpen(false)} />
            {role === ROLES.FOUNDER && (
              <DropItem to="/create"    icon="✦" label="New Startup"   onClick={() => setOpen(false)} />
            )}
            {(role === ROLES.FOUNDER || role === ROLES.ADMIN) && (
              <DropItem to="/benchmark" icon="⊞" label="Benchmark"     onClick={() => setOpen(false)} />
            )}
            {role === ROLES.ADMIN && (
              <DropItem to="/admin"     icon="⚙" label="Admin Panel"   onClick={() => setOpen(false)} accent="#f87171" />
            )}

            <div className="h-px bg-white/[0.06] my-1.5" />

            {/* Token debug — dev only */}
            <DropItem to="/debug/token" icon="🔧" label="Token Inspector" onClick={() => setOpen(false)} accent="#fbbf24" />

            <div className="h-px bg-white/[0.06] my-1.5" />

            {/* Sign out */}
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400/70 hover:text-red-400 hover:bg-red-500/5 transition-all text-left"
            >
              <span className="text-base">↩</span>
              <span className="font-semibold">Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function DropItem({ to, icon, label, onClick, accent }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-2 text-sm transition-all hover:bg-white/[0.04]"
      style={{ color: accent ?? "rgba(255,255,255,0.55)" }}
    >
      <span className="text-sm opacity-70">{icon}</span>
      <span className="font-semibold">{label}</span>
    </Link>
  );
}

// ── Navbar ────────────────────────────────────────────────────────────────────
export default function Navbar() {
  const { token, role, email, logout, startups, activeStartupId, saveStartupId } = useAuth();
  const { meta } = useRole();
  const location = useLocation();
  const navigate = useNavigate();

  if (!token) return null;

  const links        = getNavLinks(role);
  const showSelector = ["/dashboard", "/benchmark"].includes(location.pathname);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06] bg-[#080c10]/93 backdrop-blur-xl">
      {/* Role-colored top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ background: `linear-gradient(90deg, transparent, ${meta.color}60, transparent)` }}
      />

      <div className="max-w-7xl mx-auto px-5 h-14 flex items-center gap-3">

        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2 shrink-0 mr-2 group">
          <span className="font-black text-lg tracking-tight text-white group-hover:text-[#63ffb4] transition-colors">
            Founder<span className="text-[#63ffb4]">Brain</span>
          </span>
          <span className="hidden sm:block text-[10px] text-white/15 font-mono tracking-widest">v2</span>
        </Link>

        {/* Startup selector */}
        {showSelector && startups?.length > 0 && (
          <div className="hidden sm:block">
            <StartupSelector
              startups={startups}
              value={activeStartupId}
              onChange={saveStartupId}
            />
          </div>
        )}

        {/* Nav links */}
        <div className="flex items-center gap-0.5 ml-auto">
          {links.map(({ to, label, icon }) => {
            const active = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                  active
                    ? "text-[#63ffb4] bg-[#63ffb4]/10 border border-[#63ffb4]/20"
                    : "text-white/40 hover:text-white/80 hover:bg-white/5"
                }`}
              >
                <span className="text-[10px] opacity-70">{icon}</span>
                <span className="hidden sm:inline">{label}</span>
              </Link>
            );
          })}
        </div>

        {/* Profile dropdown */}
        <div className="border-l border-white/[0.07] pl-3">
          <ProfileDropdown
            email={email}
            role={role}
            meta={meta}
            onLogout={handleLogout}
          />
        </div>
      </div>
    </nav>
  );
}