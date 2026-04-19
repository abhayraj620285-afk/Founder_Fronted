import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRole } from "../hooks/useRole";

/**
 * UpgradeBanner — shown to USER role on all pages.
 * Dismissible but reappears on next page.
 */
export default function UpgradeBanner() {
  const { isUser } = useRole();
  const [dismissed, setDismissed] = useState(false);
  const navigate = useNavigate();

  if (!isUser || dismissed) return null;

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 w-full max-w-xl px-4 animate-fadeInUp">
      <div className="relative rounded-2xl border border-[#63ffb4]/25 bg-[#080c10]/95 backdrop-blur-xl px-5 py-4 shadow-2xl overflow-hidden">
        {/* Shimmer sweep */}
        <div className="absolute inset-0 animate-shimmer pointer-events-none" />
        {/* Green left accent */}
        <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl bg-gradient-to-b from-[#63ffb4] to-[#63ffb4]/30" />

        <div className="flex items-center gap-4 pl-2">
          <div className="relative shrink-0">
            <div className="w-10 h-10 rounded-xl bg-[#63ffb4]/15 border border-[#63ffb4]/30 flex items-center justify-center text-lg">
              🚀
            </div>
            <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#63ffb4] animate-pulse" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white">Unlock Full Access</p>
            <p className="text-xs text-white/45 truncate">
              Become a Founder to create startups and view real AI analytics
            </p>
          </div>

          <button
            onClick={() => navigate("/upgrade")}
            className="shrink-0 px-4 py-2 rounded-xl bg-[#63ffb4] text-[#080c10] text-xs font-black hover:bg-[#4dffa8] active:scale-95 transition-all"
          >
            Upgrade →
          </button>

          <button
            onClick={() => setDismissed(true)}
            className="shrink-0 text-white/20 hover:text-white/50 transition-colors text-lg leading-none"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}