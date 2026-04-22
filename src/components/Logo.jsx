/**
 * FounderBrain Logo — Variant B
 * Circuit-board icon + Instrument Serif wordmark
 *
 * Usage:
 *   <Logo />                  → default (md) — icon + stacked wordmark
 *   <Logo size="sm" />        → navbar compact — icon + inline wordmark
 *   <Logo size="lg" />        → hero / auth pages — large icon + big wordmark
 *   <Logo size="icon" />      → icon only (no wordmark)
 *   <Logo size="favicon" />   → "F" favicon square
 */

export default function Logo({ size = "md", className = "" }) {

  // ── Icon SVG ──────────────────────────────────────────────────────────────
  const Icon = ({ w = 52 }) => {
    const s = w / 52; // scale factor
    return (
      <svg
        width={w} height={w}
        viewBox="0 0 52 52"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="lb-g1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#63ffb4"/>
            <stop offset="100%" stopColor="#3dd8a0"/>
          </linearGradient>
          <linearGradient id="lb-g2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#63ffb4"/>
            <stop offset="100%" stopColor="#60a5fa"/>
          </linearGradient>
        </defs>

        {/* Rounded square background */}
        <rect x="0" y="0" width="52" height="52" rx="13"
          fill="#0d1117" stroke="url(#lb-g2)" strokeWidth="1.4"/>

        {/* Circuit traces */}
        {/* Top-left horizontal trace */}
        <line x1="9"  y1="15" x2="20" y2="15" stroke="#63ffb4" strokeWidth="1.3" strokeOpacity="0.75" strokeLinecap="round"/>
        {/* Top vertical up */}
        <line x1="20" y1="15" x2="20" y2="9"  stroke="#63ffb4" strokeWidth="1.3" strokeOpacity="0.75" strokeLinecap="round"/>
        {/* Top horizontal right */}
        <line x1="20" y1="9"  x2="33" y2="9"  stroke="#63ffb4" strokeWidth="1.3" strokeOpacity="0.75" strokeLinecap="round"/>

        {/* Right-side trace */}
        <line x1="43" y1="26" x2="33" y2="26" stroke="#60a5fa" strokeWidth="1.3" strokeOpacity="0.75" strokeLinecap="round"/>
        <line x1="33" y1="26" x2="33" y2="35" stroke="#60a5fa" strokeWidth="1.3" strokeOpacity="0.75" strokeLinecap="round"/>
        <line x1="33" y1="35" x2="22" y2="35" stroke="#60a5fa" strokeWidth="1.3" strokeOpacity="0.75" strokeLinecap="round"/>

        {/* Bottom-left trace */}
        <line x1="22" y1="35" x2="22" y2="43" stroke="#60a5fa" strokeWidth="1.3" strokeOpacity="0.6" strokeLinecap="round"/>
        <line x1="9"  y1="35" x2="18" y2="35" stroke="#63ffb4" strokeWidth="1.3" strokeOpacity="0.5" strokeLinecap="round"/>

        {/* Junction nodes */}
        <circle cx="20" cy="15" r="2.8" fill="#63ffb4"/>
        <circle cx="33" cy="9"  r="2.8" fill="#63ffb4"/>
        <circle cx="33" cy="26" r="2.8" fill="#60a5fa"/>
        <circle cx="22" cy="35" r="2.8" fill="#60a5fa"/>
        <circle cx="22" cy="43" r="2.2" fill="#60a5fa" fillOpacity="0.55"/>

        {/* Center orbit ring */}
        <circle cx="26" cy="26" r="6.5"
          fill="none" stroke="url(#lb-g2)" strokeWidth="1.5"/>

        {/* Center core dot */}
        <circle cx="26" cy="26" r="2.5" fill="url(#lb-g1)"/>
      </svg>
    );
  };

  // ── Favicon (F letter in green square) ───────────────────────────────────
  if (size === "favicon") {
    return (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <defs>
          <linearGradient id="fv-g" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#63ffb4"/>
            <stop offset="100%" stopColor="#3dd8a0"/>
          </linearGradient>
        </defs>
        <rect width="32" height="32" rx="7" fill="url(#fv-g)"/>
        <text x="16" y="23" textAnchor="middle"
          fontFamily="Georgia,'Times New Roman',serif"
          fontSize="20" fontWeight="400" fill="#0d1117">
          F
        </text>
      </svg>
    );
  }

  // ── Icon only ─────────────────────────────────────────────────────────────
  if (size === "icon") {
    return <Icon w={52} />;
  }

  // ── Small — navbar ────────────────────────────────────────────────────────
  if (size === "sm") {
    return (
      <div className={`flex items-center gap-2.5 select-none ${className}`}>
        <Icon w={32} />
        <span
          style={{ fontFamily:"'Instrument Serif', Georgia, serif", fontWeight:400, letterSpacing:"-0.01em", lineHeight:1 }}
          className="text-xl text-white"
        >
          Founder<span
            style={{ backgroundImage:"linear-gradient(135deg,#63ffb4,#60a5fa)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}
          >Brain</span>
        </span>
      </div>
    );
  }

  // ── Large — auth / hero ───────────────────────────────────────────────────
  if (size === "lg") {
    return (
      <div className={`flex flex-col items-center gap-4 select-none ${className}`}>
        <Icon w={72} />
        <div className="text-center">
          <div
            style={{ fontFamily:"'Instrument Serif', Georgia, serif", fontWeight:400, letterSpacing:"-0.02em", lineHeight:1.05 }}
            className="text-4xl text-white"
          >
            Founder
            <span style={{ backgroundImage:"linear-gradient(135deg,#63ffb4,#60a5fa)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
              Brain
            </span>
          </div>
          <div
            className="mt-2 text-[10px] tracking-[0.2em] uppercase"
            style={{ fontFamily:"'JetBrains Mono','Fira Code',monospace", color:"rgba(96,165,250,0.55)" }}
          >
            Startup Intelligence Platform
          </div>
        </div>
      </div>
    );
  }

  // ── Default (md) — hero explore page ─────────────────────────────────────
  return (
    <div className={`flex items-center gap-4 select-none ${className}`}>
      <Icon w={52} />
      <div>
        <div
          style={{ fontFamily:"'Instrument Serif', Georgia, serif", fontWeight:400, letterSpacing:"-0.015em", lineHeight:1 }}
          className="text-3xl text-white"
        >
          Founder
          <span style={{ backgroundImage:"linear-gradient(135deg,#63ffb4,#60a5fa)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
            Brain
          </span>
        </div>
        <div
          className="mt-1 text-[9px] tracking-[0.18em] uppercase"
          style={{ fontFamily:"'JetBrains Mono','Fira Code',monospace", color:"rgba(96,165,250,0.5)" }}
        >
          Startup Intelligence Platform
        </div>
      </div>
    </div>
  );
}