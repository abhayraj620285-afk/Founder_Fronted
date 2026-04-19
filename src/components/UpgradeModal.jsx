import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PERKS = [
  { icon: "ShieldCheck", label: "ML Risk Prediction",      desc: "Real-time AI scoring of your startup's operational, financial and market risk" },
  { icon: "TrendingUp",  label: "Growth Analytics",        desc: "Month-over-month revenue tracking with industry benchmark comparisons"          },
  { icon: "Clock",       label: "Runway Projection",       desc: "Cash burn modelling with critical threshold alerts and fundraise triggers"       },
  { icon: "BarChart2",   label: "Industry Benchmarks",     desc: "Side-by-side comparison of your metrics vs sector peers and top performers"      },
  { icon: "Zap",         label: "Funding Suggestions",     desc: "Stage-aware fundraising recommendations generated from your live data"           },
  { icon: "Target",      label: "Action Recommendations",  desc: "Prioritised next steps powered by AI analysis of your startup's trajectory"      },
];

// Inline SVG icons
const Icons = {
  ShieldCheck: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/>
    </svg>
  ),
  TrendingUp: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
    </svg>
  ),
  Clock: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  BarChart2: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
  ),
  Zap: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  ),
  Target: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
    </svg>
  ),
};

export default function UpgradeModal({ onClose }) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleUpgrade = () => {
    onClose();
    // Log out current USER session and redirect to register as FOUNDER
    logout();
    navigate("/register");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-3xl border border-[#63ffb4]/20 bg-[#080c10]/98 shadow-2xl overflow-hidden animate-scaleIn">

        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#63ffb4]/70 to-transparent" />
        {/* Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-40 rounded-full bg-[#63ffb4]/6 blur-3xl pointer-events-none" />

        <div className="relative p-8 space-y-6">
          {/* Close */}
          <button onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all text-lg">
            ×
          </button>

          {/* Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#63ffb4]/25 bg-[#63ffb4]/8 text-[#63ffb4] text-xs font-mono tracking-widest">
              ⚡ UPGRADE TO FOUNDER
            </div>
            <h2 className="text-2xl font-black text-white">Unlock the full platform</h2>
            <p className="text-sm text-white/45 leading-relaxed max-w-sm mx-auto">
              You're currently exploring as a User. Register as a <span className="text-[#63ffb4] font-semibold">Founder</span> to connect your real startup and access live AI analytics.
            </p>
          </div>

          {/* Perks */}
          <div className="grid grid-cols-2 gap-2.5">
            {PERKS.map(({ icon, label, desc }, i) => {
              const Icon = Icons[icon];
              return (
                <div key={label}
                  className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-3 space-y-1.5 animate-fadeInUp"
                  style={{ animationDelay:`${i*0.05}s` }}>
                  <div className="flex items-center gap-2">
                    <span className="text-[#63ffb4]/70"><Icon /></span>
                    <span className="text-xs font-bold text-white leading-tight">{label}</span>
                  </div>
                  <p className="text-[10px] text-white/35 leading-relaxed">{desc}</p>
                </div>
              );
            })}
          </div>

          {/* CTA */}
          <div className="space-y-3">
            <button
              onClick={handleUpgrade}
              className="w-full rounded-2xl bg-[#63ffb4] text-[#080c10] font-black text-sm py-4 hover:bg-[#4dffa8] active:scale-[0.98] transition-all"
            >
              🚀 Register as Founder — It's Free
            </button>
            <button
              onClick={onClose}
              className="w-full rounded-2xl bg-white/5 border border-white/10 text-white/50 text-sm py-3 hover:text-white hover:bg-white/8 transition-all"
            >
              Continue Exploring
            </button>
          </div>

          <p className="text-center text-[10px] text-white/20">
            You'll be signed out and taken to the registration page
          </p>
        </div>
      </div>
    </div>
  );
}