import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function UpgradePage() {
  const { logout } = useAuth();
  const navigate   = useNavigate();

  return (
    <div className="min-h-screen bg-[#080c10] pt-20 pb-16 px-4 flex items-center justify-center">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#63ffb4]/5 blur-[120px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(99,255,180,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(99,255,180,0.015)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      <div className="relative w-full max-w-md space-y-6 animate-scaleIn text-center">

        {/* Icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-[#63ffb4]/10 border border-[#63ffb4]/25 text-4xl animate-float mx-auto">
          🚀
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-black text-white">Become a Founder</h1>
          <p className="text-sm text-white/45 leading-relaxed">
            To create startups and access real analytics, you need a <span className="text-[#63ffb4] font-semibold">Founder</span> account.
          </p>
        </div>

        {/* Steps */}
        <div className="rounded-2xl border border-white/10 bg-[#0d1117]/80 p-6 space-y-4 text-left">
          <p className="text-xs font-semibold tracking-widest uppercase text-white/30">How to upgrade</p>
          {[
            { step:"1", text:"Sign out of your current USER account" },
            { step:"2", text:"Register a new account selecting the Founder role" },
            { step:"3", text:"Log in and create your first startup" },
          ].map(({ step, text }) => (
            <div key={step} className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#63ffb4]/10 border border-[#63ffb4]/25 flex items-center justify-center text-xs font-black text-[#63ffb4] shrink-0 mt-0.5">
                {step}
              </div>
              <p className="text-sm text-white/60">{text}</p>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <button
            onClick={() => { logout(); navigate("/register"); }}
            className="w-full rounded-2xl bg-[#63ffb4] text-[#080c10] font-black text-sm py-4 hover:bg-[#4dffa8] active:scale-95 transition-all"
          >
            Sign Out & Register as Founder
          </button>
          <button
            onClick={() => navigate("/explore")}
            className="w-full rounded-2xl border border-white/10 bg-white/5 text-white/50 text-sm py-3 hover:text-white hover:bg-white/8 transition-all"
          >
            ← Back to Explore
          </button>
        </div>
      </div>
    </div>
  );
}