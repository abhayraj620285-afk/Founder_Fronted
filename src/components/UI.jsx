// ── FounderBrain shared UI primitives ────────────────────────────────────────

export function Card({ children, className = "", glow = false, accent }) {
  const glowStyle = accent
    ? { boxShadow: `0 0 40px ${accent}12` }
    : glow
    ? { boxShadow: "0 0 40px rgba(99,255,180,0.07)" }
    : {};
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-[#0d1117]/80 backdrop-blur-sm p-6 ${className}`}
      style={glowStyle}
    >
      {children}
    </div>
  );
}

// Risk badge with animated pulse for HIGH
export function RiskBadge({ level }) {
  const cfg = {
    LOW:    { bg: "bg-emerald-500/15 border-emerald-500/30 text-emerald-400", dot: "bg-emerald-400" },
    MEDIUM: { bg: "bg-amber-500/15 border-amber-500/30 text-amber-400",       dot: "bg-amber-400" },
    HIGH:   { bg: "bg-red-500/15 border-red-500/30 text-red-400",             dot: "bg-red-400" },
  };
  const c = cfg[level] || cfg.MEDIUM;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border tracking-widest uppercase ${c.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot} ${level === "HIGH" ? "animate-pulse" : ""}`} />
      {level}
    </span>
  );
}

// Animated confidence bar with tooltip
export function ConfidenceBar({ value, label = "ML Confidence" }) {
  const pct = Math.round((value ?? 0) * 100);
  const color = pct >= 70 ? "#63ffb4" : pct >= 40 ? "#fbbf24" : "#f87171";
  return (
    <div className="space-y-1.5 group relative">
      <div className="flex justify-between items-center">
        <span className="text-xs font-semibold tracking-widest uppercase text-white/40">{label}</span>
        <span className="text-xs font-bold tabular-nums" style={{ color }}>{pct}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-white/[0.08] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}99, ${color})` }}
        />
      </div>
      {/* Tooltip */}
      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#1a2030] border border-white/10 text-white/70 text-[10px] px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
        Model is {pct}% confident in this prediction
      </div>
    </div>
  );
}

// Risk gauge — color spectrum bar with needle
export function RiskGauge({ level, confidence }) {
  const positions = { LOW: 16, MEDIUM: 50, HIGH: 84 };
  const colors    = { LOW: "#63ffb4", MEDIUM: "#fbbf24", HIGH: "#f87171" };
  const pct   = positions[level] ?? 50;
  const color = colors[level]    ?? "#fbbf24";
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold tracking-widest uppercase text-white/40">Risk Level</span>
        <RiskBadge level={level} />
      </div>
      <div className="relative h-4 rounded-full overflow-visible">
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-500/50 via-amber-400/50 to-red-500/50" />
        {/* Needle */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full border-2 border-[#080c10] shadow-lg transition-all duration-700"
          style={{ left: `${pct}%`, background: color, boxShadow: `0 0 10px ${color}` }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-white/30 font-semibold tracking-widest px-1">
        <span>LOW</span><span>MEDIUM</span><span>HIGH</span>
      </div>
      <ConfidenceBar value={confidence} />
    </div>
  );
}

// Animated SVG health ring
export function HealthRing({ score }) {
  const r     = 52;
  const circ  = 2 * Math.PI * r;
  const dash  = ((score ?? 0) / 100) * circ;
  const color = (score ?? 0) >= 70 ? "#63ffb4" : (score ?? 0) >= 40 ? "#fbbf24" : "#f87171";
  const label = (score ?? 0) >= 70 ? "Healthy" : (score ?? 0) >= 40 ? "Moderate" : "At Risk";

  return (
    <div className="relative inline-flex flex-col items-center gap-2">
      <div className="relative">
        <svg width="136" height="136" className="-rotate-90">
          <circle cx="68" cy="68" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
          <circle
            cx="68" cy="68" r={r} fill="none"
            stroke={color} strokeWidth="10"
            strokeDasharray={`${dash} ${circ}`}
            strokeLinecap="round"
            style={{ transition: "stroke-dasharray 1.2s cubic-bezier(.4,0,.2,1), stroke 0.5s" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-black tabular-nums" style={{ color }}>{score ?? "—"}</span>
          <span className="text-[10px] text-white/30 tracking-widest font-semibold uppercase">/100</span>
        </div>
      </div>
      <span
        className="text-xs font-bold tracking-widest uppercase px-2 py-0.5 rounded-full border"
        style={{ color, borderColor: `${color}40`, background: `${color}12` }}
      >
        {label}
      </span>
    </div>
  );
}

// Insight card with icon, label, body
export function InsightCard({ icon, label, text, color = "#63ffb4" }) {
  return (
    <div
      className="rounded-xl p-4 space-y-2 border border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
      style={{ borderLeftColor: `${color}50`, borderLeftWidth: 2 }}
    >
      <div className="flex items-center gap-2">
        <span className="text-base">{icon}</span>
        <span className="text-xs font-bold tracking-widest uppercase text-white/40">{label}</span>
      </div>
      <p className="text-sm text-white/70 leading-relaxed">{text || "—"}</p>
    </div>
  );
}

// Stat card
export function StatCard({ label, value, sub, icon, accent = "#63ffb4" }) {
  return (
    <Card>
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-bold tracking-widest uppercase text-white/30">{label}</span>
        {icon && <span className="text-base opacity-60">{icon}</span>}
      </div>
      <div className="text-3xl font-black tracking-tight tabular-nums" style={{ color: accent }}>
        {value ?? "—"}
      </div>
      {sub && <div className="mt-1.5 text-xs text-white/30">{sub}</div>}
    </Card>
  );
}

// Startup selector dropdown
export function StartupSelector({ startups, value, onChange, loading }) {
  if (loading) return (
    <div className="flex items-center gap-2 text-xs text-white/30 px-3 py-2 rounded-xl border border-white/10 bg-white/5">
      <div className="w-3 h-3 border border-white/20 border-t-white/60 rounded-full animate-spin" />
      Loading startups…
    </div>
  );

  if (!startups?.length) return (
    <div className="text-xs text-white/30 px-3 py-2 rounded-xl border border-white/10 bg-white/5">
      No startups yet — <a href="/create" className="text-[#63ffb4] hover:underline">create one</a>
    </div>
  );

  return (
    <div className="relative">
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-white/5 border border-white/10 rounded-xl pl-4 pr-8 py-2 text-sm text-white focus:outline-none focus:border-[#63ffb4]/50 focus:ring-1 focus:ring-[#63ffb4]/20 transition-all cursor-pointer min-w-[180px]"
      >
        <option value="" disabled className="bg-[#0d1117]">Select startup…</option>
        {startups.map((s) => (
          <option key={s.id} value={String(s.id)} className="bg-[#0d1117]">
            {s.name}
          </option>
        ))}
      </select>
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none text-xs">▼</span>
    </div>
  );
}

// Full-page spinner
export function Spinner({ label = "Loading…" }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-2 border-[#63ffb4]/10" />
        <div className="absolute inset-0 rounded-full border-t-2 border-[#63ffb4] animate-spin" />
      </div>
      <span className="text-xs text-white/30 tracking-widest uppercase font-semibold">{label}</span>
    </div>
  );
}

// Inline error
export function ErrorBanner({ message, onDismiss }) {
  if (!message) return null;
  return (
    <div className="flex items-start gap-3 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
      <span className="mt-0.5 shrink-0">⚠</span>
      <span className="flex-1">{message}</span>
      {onDismiss && (
        <button onClick={onDismiss} className="shrink-0 text-red-400/40 hover:text-red-400 transition-colors text-lg leading-none">×</button>
      )}
    </div>
  );
}

export function SuccessBanner({ message }) {
  if (!message) return null;
  return (
    <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 text-sm text-emerald-400 flex items-center gap-2">
      <span>✓</span> {message}
    </div>
  );
}

// Delta badge: shows +X% or -X% with color
export function DeltaBadge({ value, unit = "%" }) {
  const positive = value >= 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded-full border ${
        positive
          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
          : "bg-red-500/10 border-red-500/20 text-red-400"
      }`}
    >
      {positive ? "▲" : "▼"} {Math.abs(value).toFixed(1)}{unit}
    </span>
  );
}

// Comparison bar for benchmark
export function CompareBar({ label, yours, industry, unit = "%" }) {
  const max    = Math.max(yours ?? 0, industry ?? 0, 1);
  const yourPct = ((yours   ?? 0) / max) * 100;
  const indPct  = ((industry ?? 0) / max) * 100;
  const better  = (yours ?? 0) >= (industry ?? 0);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-white/70">{label}</span>
        <DeltaBadge value={(yours ?? 0) - (industry ?? 0)} unit={unit} />
      </div>
      <div className="space-y-2">
        {[
          { key: "you", label: "You", pct: yourPct, val: yours, color: better ? "#63ffb4" : "#f87171" },
          { key: "ind", label: "Industry", pct: indPct, val: industry, color: "#60a5fa" },
        ].map(({ key, label: barLabel, pct, val, color }) => (
          <div key={key} className="flex items-center gap-3">
            <span className="text-xs text-white/40 w-14 text-right shrink-0">{barLabel}</span>
            <div className="flex-1 h-7 bg-white/[0.05] rounded-xl overflow-hidden">
              <div
                className="h-full rounded-xl flex items-center justify-end pr-3 transition-all duration-700"
                style={{ width: `${Math.max(pct, 5)}%`, background: `linear-gradient(90deg, ${color}60, ${color})` }}
              >
                <span className="text-[11px] font-bold text-[#080c10]">{val?.toFixed(1)}{unit}</span>
              </div>
            </div>
            <span className="text-xs font-bold w-16 shrink-0" style={{ color }}>
              {key === "you" ? (better ? "✓ Better" : "✗ Worse") : "Avg"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}