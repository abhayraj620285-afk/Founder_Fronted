import { useState, useRef, useEffect } from "react";
import Logo from "./Logo";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useRole } from "../hooks/useRole";
import { getNavLinks, getRoleMeta, ROLES } from "../utils/roles";

// ── Startup Switcher dropdown ─────────────────────────────────────────────────
function StartupSwitcher({ startups, activeId, onSwitch, canCreate }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const active = startups.find((s) => String(s.id) === String(activeId));

  if (!startups.length && !canCreate) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/8 hover:border-white/20 transition-all max-w-[200px]"
      >
        <span className="w-2 h-2 rounded-full bg-[#63ffb4] shrink-0" />
        <span className="text-sm font-semibold text-white truncate">
          {active?.name ?? "Select startup"}
        </span>
        <span className={`text-white/30 text-xs transition-transform duration-150 shrink-0 ${open ? "rotate-180" : ""}`}>▾</span>
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-2 w-64 rounded-2xl border border-white/10 bg-[#0d1117]/98 backdrop-blur-xl shadow-2xl overflow-hidden z-50 animate-dropDown">

          {/* Startup list */}
          {startups.length > 0 && (
            <div className="py-1.5">
              <div className="px-4 py-2 text-[10px] text-white/25 font-semibold tracking-widest uppercase">Your Startups</div>
              {startups.map((s) => {
                const isActive = String(s.id) === String(activeId);
                const riskColor = { LOW:"#63ffb4", MEDIUM:"#fbbf24", HIGH:"#f87171" }[s.riskLevel] ?? "#60a5fa";
                return (
                  <button
                    key={s.id}
                    onClick={() => { onSwitch(s.id); setOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all hover:bg-white/[0.04] ${isActive ? "bg-[#63ffb4]/5" : ""}`}
                  >
                    {/* Active indicator */}
                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${isActive ? "bg-[#63ffb4]" : "bg-white/10"}`} />

                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-white truncate">{s.name}</div>
                      <div className="text-[10px] text-white/35 truncate">{s.industry ?? "—"}</div>
                    </div>

                    {/* Health score + risk */}
                    <div className="flex flex-col items-end gap-0.5 shrink-0">
                      {s.healthScore != null && (
                        <span className="text-[10px] font-bold text-white/40">{s.healthScore}</span>
                      )}
                      {s.riskLevel && (
                        <span className="text-[9px] font-bold tracking-wider uppercase" style={{ color: riskColor }}>
                          {s.riskLevel}
                        </span>
                      )}
                    </div>

                    {isActive && <span className="text-[#63ffb4] text-xs shrink-0">✓</span>}
                  </button>
                );
              })}
            </div>
          )}

          {/* Divider */}
          {startups.length > 0 && canCreate && (
            <div className="h-px bg-white/[0.06] mx-4" />
          )}

          {/* Create new startup */}
          {canCreate && (
            <div className="py-1.5">
              <Link
                to="/create"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-[#63ffb4] hover:bg-[#63ffb4]/5 transition-all"
              >
                <span className="w-5 h-5 rounded-full border border-[#63ffb4]/40 flex items-center justify-center text-xs shrink-0">+</span>
                Create New Startup
              </Link>
            </div>
          )}

          {startups.length === 0 && (
            <div className="px-4 py-3 text-xs text-white/30 text-center">
              No startups yet.{" "}
              {canCreate && (
                <Link to="/create" onClick={() => setOpen(false)} className="text-[#63ffb4] hover:underline font-semibold">
                  Create one
                </Link>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Profile dropdown ──────────────────────────────────────────────────────────
function ProfileDropdown({ email, role, meta, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const initial = email?.[0]?.toUpperCase() ?? "?";

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-white/5 transition-all"
      >
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
        <span className={`text-white/25 text-xs transition-transform ${open ? "rotate-180" : ""}`}>▾</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-52 rounded-2xl border border-white/10 bg-[#0d1117]/98 backdrop-blur-xl shadow-2xl overflow-hidden z-50 animate-dropDown">
          {/* Header */}
          <div className="px-4 py-3 border-b border-white/[0.06] flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black border-2 shrink-0"
              style={{ background: meta.bg, borderColor: meta.border, color: meta.color }}>
              {initial}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-white truncate">{email}</div>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold tracking-widest uppercase px-1.5 py-0.5 rounded-full border mt-0.5"
                style={{ color: meta.color, background: meta.bg, borderColor: meta.border }}>
                {meta.icon} {meta.label}
              </span>
            </div>
          </div>

          {/* Links */}
          <div className="py-1.5">
            {[
              { to:"/dashboard",   icon:"◈", label:"Dashboard"      },
              { to:"/benchmark",   icon:"⊞", label:"Benchmark"       },
              ...(role===ROLES.FOUNDER ? [{ to:"/create", icon:"✦", label:"New Startup" }]  : []),
              ...(role===ROLES.ADMIN   ? [{ to:"/admin",  icon:"⚙", label:"Admin Panel", accent:"#f87171" }] : []),
            ].map(({ to, icon, label, accent }) => (
              <Link key={to} to={to} onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2 text-sm transition-all hover:bg-white/[0.04]"
                style={{ color: accent ?? "rgba(255,255,255,0.55)" }}>
                <span className="opacity-70">{icon}</span>
                <span className="font-semibold">{label}</span>
              </Link>
            ))}

            <div className="h-px bg-white/[0.06] my-1" />

            <Link to="/debug/token" onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-amber-400/50 hover:text-amber-400 hover:bg-white/[0.04] transition-all">
              <span>🔧</span>
              <span className="font-semibold">Token Inspector</span>
            </Link>

            <div className="h-px bg-white/[0.06] my-1" />

            <button onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400/60 hover:text-red-400 hover:bg-red-500/5 transition-all">
              <span>↩</span>
              <span className="font-semibold">Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Navbar ───────────────────────────────────────────────────────────────
export default function Navbar() {
  const { token, role, email, logout, startups, activeStartupId, saveStartupId } = useAuth();
  const { meta, can } = useRole();
  const location = useLocation();
  const navigate = useNavigate();

  if (!token) return null;

  const links          = getNavLinks(role);
  const showSwitcher   = ["/dashboard", "/benchmark"].includes(location.pathname);
  const canCreate      = can("canCreateStartup");

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06] bg-[#080c10]/93 backdrop-blur-xl">
      {/* Role accent line */}
      <div className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ background: `linear-gradient(90deg,transparent,${meta.color}55,transparent)` }} />

      <div className="max-w-7xl mx-auto px-5 h-14 flex items-center gap-3">

        {/* Logo */}
        <Link to="/dashboard" className="shrink-0 mr-2 hover:opacity-85 transition-opacity">
          <Logo size="sm" />
        </Link>

        {/* Startup switcher — shown on dashboard and benchmark */}
        {showSwitcher && (
          <StartupSwitcher
            startups={startups}
            activeId={activeStartupId}
            onSwitch={saveStartupId}
            canCreate={canCreate}
          />
        )}

        {/* Nav links */}
        <div className="flex items-center gap-0.5 ml-auto">
          {links.map(({ to, label, icon }) => {
            const active = location.pathname === to;
            return (
              <Link key={to} to={to}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                  active
                    ? "text-[#63ffb4] bg-[#63ffb4]/10 border border-[#63ffb4]/20"
                    : "text-white/40 hover:text-white/80 hover:bg-white/5"
                }`}>
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
            onLogout={() => { logout(); navigate("/login"); }}
          />
        </div>
      </div>
    </nav>
  );
}