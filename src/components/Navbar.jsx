import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { StartupSelector } from "./UI";

const NAV = [
  { to: "/create",    label: "New Startup", icon: "✦" },
  { to: "/dashboard", label: "Dashboard",   icon: "◈" },
  { to: "/benchmark", label: "Benchmark",   icon: "⊞" },
];

export default function Navbar() {
  const { token, logout, startups, activeStartupId, saveStartupId } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (!token) return null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06] bg-[#080c10]/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2 shrink-0 group">
          <span className="font-black text-lg tracking-tight text-white group-hover:text-[#63ffb4] transition-colors">
            Founder<span className="text-[#63ffb4]">Brain</span>
          </span>
          <span className="text-[10px] text-white/20 font-mono tracking-widest">v2</span>
        </Link>

        {/* Startup selector — shown on dashboard/benchmark */}
        {["/dashboard", "/benchmark"].includes(location.pathname) && (
          <StartupSelector
            startups={startups}
            value={activeStartupId}
            onChange={saveStartupId}
          />
        )}

        {/* Nav links */}
        <div className="flex items-center gap-1 ml-auto">
          {NAV.map(({ to, label, icon }) => {
            const active = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                  active
                    ? "bg-[#63ffb4]/10 text-[#63ffb4]"
                    : "text-white/40 hover:text-white/80 hover:bg-white/5"
                }`}
              >
                <span className="text-[10px]">{icon}</span>
                <span className="hidden sm:inline">{label}</span>
              </Link>
            );
          })}
        </div>

        {/* Sign out */}
        <button
          onClick={() => { logout(); navigate("/login"); }}
          className="shrink-0 text-xs font-semibold text-white/30 hover:text-red-400 transition-colors"
        >
          Sign out
        </button>
      </div>
    </nav>
  );
}