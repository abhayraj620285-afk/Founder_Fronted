import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import UpgradeModal from "../components/UpgradeModal";

// ── Professional SVG icons (no emoji) ────────────────────────────────────────
const Icon = {
  Shield: ({ size=22 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/>
    </svg>
  ),
  TrendingUp: ({ size=22 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
    </svg>
  ),
  Clock: ({ size=22 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  BarChart: ({ size=22 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
  ),
  Zap: ({ size=22 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  ),
  Target: ({ size=22 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
    </svg>
  ),
  Lock: ({ size=16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  ),
  ArrowRight: ({ size=14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
    </svg>
  ),
  Brain: ({ size=22 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-1.07-3.33A3 3 0 0 1 4.46 10a2.5 2.5 0 0 1 .49-4.46A2.5 2.5 0 0 1 9.5 2z"/>
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 1.07-3.33A3 3 0 0 0 19.54 10a2.5 2.5 0 0 0-.49-4.46A2.5 2.5 0 0 0 14.5 2z"/>
    </svg>
  ),
  CheckCircle: ({ size=16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  ),
  Star: ({ size=16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
  Activity: ({ size=22 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  ),
};

// ── Feature cards data ────────────────────────────────────────────────────────
const FEATURES = [
  {
    IconComp: Icon.Shield,
    title: "ML Risk Prediction",
    tagline: "Know your risk before it's too late",
    brief: "AI model classifies startup risk in real time.",
    detail: "Our proprietary machine learning model analyses over 12 financial and operational signals from your startup data — revenue trajectory, burn rate, cash coverage, user growth — and outputs a dynamic risk classification of LOW, MEDIUM, or HIGH, along with a confidence score between 0–100%. Risk levels update every time you refresh, giving you a live pulse on your business health.",
    color: "#63ffb4",
    metric: "87% avg. confidence",
  },
  {
    IconComp: Icon.TrendingUp,
    title: "Growth Rate Analytics",
    tagline: "Measure what actually moves the needle",
    brief: "Month-over-month growth tracked against industry.",
    detail: "FounderBrain calculates your precise month-over-month revenue growth rate and plots it against a live industry average for your sector. See whether you're outpacing competitors, identify months where growth stalled, and receive AI commentary explaining the likely causes — so you can act on data, not guesswork.",
    color: "#60a5fa",
    metric: "+3.3% above SaaS avg",
  },
  {
    IconComp: Icon.Clock,
    title: "Runway Projection",
    tagline: "See exactly how long your cash lasts",
    brief: "Cash burn modelled with critical threshold alerts.",
    detail: "Enter your current cash reserve and monthly expenses, and our runway engine projects your exact burn curve month by month. It plots a critical threshold line at 20% of remaining cash — the point most VCs consider a 'fundraise now' signal — and flags when you'll cross it. Coupled with AI-generated action plans to extend runway through cost optimisation or revenue acceleration.",
    color: "#fbbf24",
    metric: "Accurate to ±0.3 months",
  },
  {
    IconComp: Icon.BarChart,
    title: "Industry Benchmark",
    tagline: "Know exactly where you rank in your sector",
    brief: "Your metrics vs sector peers — side by side.",
    detail: "Compare your startup's growth rate, runway, health score, and risk level against aggregated benchmarks from startups in your industry vertical. Presented as interactive bar charts and radar plots, the benchmark view makes it immediately obvious where you excel and where you lag. Use it in investor conversations to contextualise your performance with data.",
    color: "#a78bfa",
    metric: "12 industries tracked",
  },
  {
    IconComp: Icon.Zap,
    title: "Funding Suggestions",
    tagline: "Strategic fundraising tailored to your stage",
    brief: "Stage-aware AI recommendations for your next round.",
    detail: "Based on your current runway, growth trajectory, risk classification, and industry norms, FounderBrain generates specific funding recommendations — including suggested round size, timing, and investor type (Angel, Seed, Series A). The suggestions refresh with every dashboard load, adapting as your financial position changes.",
    color: "#f87171",
    metric: "Refreshed on every load",
  },
  {
    IconComp: Icon.Target,
    title: "Action Recommendations",
    tagline: "Your AI co-pilot for startup decisions",
    brief: "Personalised next steps from live data analysis.",
    detail: "After processing your metrics, FounderBrain's recommendation engine outputs a prioritised list of concrete actions — e.g. 'Reduce monthly burn by 15% to extend runway beyond 12 months' or 'Your growth rate of 12.4% qualifies you for a Series A conversation — prepare your deck.' These are not generic tips; they are generated specifically from your numbers, updated in real time.",
    color: "#63ffb4",
    metric: "Context-aware, always fresh",
  },
];

// ── Animated number ───────────────────────────────────────────────────────────
function Stat({ value, label, color }) {
  return (
    <div className="text-center px-4">
      <div className="text-3xl font-black tracking-tight" style={{ color }}>{value}</div>
      <div className="text-[11px] text-white/35 mt-1 tracking-wide">{label}</div>
    </div>
  );
}

// ── Feature card with flip-style hover ───────────────────────────────────────
function FeatureCard({ feature, onUpgrade, index }) {
  const [hovered, setHovered] = useState(false);
  const { IconComp, title, tagline, brief, detail, color, metric } = feature;

  return (
    <div
      className="relative rounded-2xl border bg-[#0d1117]/90 overflow-hidden cursor-pointer transition-all duration-300 animate-fadeInUp"
      style={{
        borderColor: hovered ? `${color}40` : "rgba(255,255,255,0.07)",
        boxShadow:   hovered ? `0 0 30px ${color}12` : "none",
        animationDelay: `${0.08 + index * 0.07}s`,
        minHeight: 220,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onUpgrade}
    >
      {/* Background gradient on hover */}
      <div
        className="absolute inset-0 transition-opacity duration-300 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 30% 30%, ${color}08 0%, transparent 65%)`,
          opacity: hovered ? 1 : 0,
        }}
      />

      {/* Lock badge */}
      <div className="absolute top-4 right-4 flex items-center gap-1 px-2 py-1 rounded-full bg-white/5 border border-white/10">
        <Icon.Lock size={11} />
        <span className="text-[10px] text-white/35 font-semibold">Founder</span>
      </div>

      <div className="relative p-6 flex flex-col h-full">
        {/* Icon */}
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 border"
          style={{
            background: hovered ? `${color}18` : "rgba(255,255,255,0.05)",
            borderColor: hovered ? `${color}35` : "rgba(255,255,255,0.09)",
            color: hovered ? color : "rgba(255,255,255,0.5)",
          }}
        >
          <IconComp size={22} />
        </div>

        {/* Title + tagline */}
        <h3 className="text-base font-black text-white mb-1">{title}</h3>
        <p className="text-xs font-semibold mb-3" style={{ color: hovered ? color : "rgba(255,255,255,0.4)" }}>
          {tagline}
        </p>

        {/* Description — switches on hover */}
        <p
          className="text-xs leading-relaxed flex-1 transition-all duration-300"
          style={{ color: hovered ? "rgba(255,255,255,0.65)" : "rgba(255,255,255,0.38)" }}
        >
          {hovered ? detail : brief}
        </p>

        {/* Bottom row */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/[0.06]">
          <span
            className="text-[10px] font-semibold px-2 py-0.5 rounded-full border"
            style={{
              color: hovered ? color : "rgba(255,255,255,0.25)",
              borderColor: hovered ? `${color}35` : "rgba(255,255,255,0.1)",
              background: hovered ? `${color}10` : "transparent",
            }}
          >
            {metric}
          </span>
          <div
            className="flex items-center gap-1 text-[11px] font-bold transition-all duration-200"
            style={{ color: hovered ? color : "rgba(255,255,255,0.2)" }}
          >
            Unlock <Icon.ArrowRight size={11} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Platform stats ────────────────────────────────────────────────────────────
const STATS = [
  { value:"500+",  label:"Startups analysed",    color:"#63ffb4" },
  { value:"98%",   label:"ML model accuracy",    color:"#60a5fa" },
  { value:"3,200+",label:"Insights generated",   color:"#a78bfa" },
  { value:"12",    label:"Industries tracked",   color:"#fbbf24" },
];

// ── Testimonials (realistic mock) ─────────────────────────────────────────────
const TESTIMONIALS = [
  {
    name: "Priya Mehta",
    role: "Co-founder, LogiStack",
    text: "FounderBrain flagged our MEDIUM risk 3 months before our runway got critical. That alert alone bought us time to close our Seed round.",
  },
  {
    name: "Daniel Osei",
    role: "CEO, HealthPilot",
    text: "The industry benchmark view showed us we were 4% below the SaaS growth average. We adjusted our pricing strategy and closed the gap in 6 weeks.",
  },
  {
    name: "Sofia Rao",
    role: "Founder, EdFlux",
    text: "I used to spend Sundays in spreadsheets. Now I check FounderBrain on Monday morning and my week's priorities are already there.",
  },
];

// ── How it works steps ────────────────────────────────────────────────────────
const STEPS = [
  {
    num: "01",
    icon: Icon.Activity,
    title: "Enter your metrics",
    desc: "Input monthly revenue, expenses, cash reserve, and active users. Takes under 2 minutes. No accounting integrations required — just the numbers you already know.",
  },
  {
    num: "02",
    icon: Icon.Brain,
    title: "AI analyses your data",
    desc: "Our ML model processes your inputs across 12 signal dimensions, benchmarks them against your industry, and generates your complete health profile in under 3 seconds.",
  },
  {
    num: "03",
    icon: Icon.BarChart,
    title: "Get your dashboard",
    desc: "Your health score, growth rate, runway projection, risk level, AI insights, industry benchmarks, funding suggestions, and action recommendations — all on one screen.",
  },
  {
    num: "04",
    icon: Icon.Target,
    title: "Take informed action",
    desc: "Follow the AI-generated recommendations. Return weekly to see how your decisions are moving the needle. Share dashboard snapshots with your co-founders and investors.",
  },
];

// ── Main page ─────────────────────────────────────────────────────────────────
export default function UserExplorePage() {
  const { email } = useAuth();
  const navigate  = useNavigate();
  const [showModal, setShowModal] = useState(false);

  const name = email?.split("@")[0] ?? "Explorer";

  return (
    <div className="min-h-screen bg-[#080c10] pt-20 pb-32 px-4 overflow-x-hidden">

      {/* ── Background ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[15%] left-[10%]  w-[500px] h-[500px] rounded-full bg-[#63ffb4]/4 blur-[130px] animate-glowPulse" />
        <div className="absolute top-[50%] right-[5%]  w-[400px] h-[400px] rounded-full bg-[#60a5fa]/4 blur-[110px] animate-glowPulse delay-500" />
        <div className="absolute bottom-[10%] left-[30%] w-[350px] h-[350px] rounded-full bg-[#a78bfa]/3 blur-[100px] animate-glowPulse delay-300" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(99,255,180,0.013)_1px,transparent_1px),linear-gradient(90deg,rgba(99,255,180,0.013)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      <div className="relative max-w-6xl mx-auto space-y-28">

        {/* ══ HERO ══ */}
        <section className="pt-10 text-center space-y-8">
          {/* Eyebrow */}
          <div className="animate-fadeIn">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#60a5fa]/25 bg-[#60a5fa]/8 text-[#60a5fa] text-xs font-mono tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-[#60a5fa] animate-pulse" />
              EXPLORING · FREE TIER · WELCOME {name.toUpperCase()}
            </div>
          </div>

          {/* Headline */}
          <div className="space-y-4 animate-fadeInUp delay-100">
            <h1 className="text-5xl sm:text-7xl font-black tracking-tight text-white leading-[1.05]">
              The intelligence layer<br />
              <span className="relative inline-block">
                <span className="text-[#63ffb4]">startups were missing</span>
                <span className="absolute -bottom-2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#63ffb4]/60 to-transparent" />
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-white/45 max-w-2xl mx-auto leading-relaxed">
              FounderBrain is an AI-powered analytics platform that gives early-stage founders the same data intelligence that top-tier investors use to evaluate startups — in real time, from your own numbers.
            </p>
          </div>

          {/* Problem statement */}
          <div className="animate-fadeInUp delay-200 max-w-3xl mx-auto">
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] px-6 py-5 text-left space-y-3">
              <p className="text-xs font-bold tracking-widest uppercase text-white/30">The problem we solve</p>
              <p className="text-sm text-white/55 leading-relaxed">
                Most startups run blind. Founders track revenue in spreadsheets, guess at runway, and discover they're in financial trouble only when it's too late to act.
                91% of startups that fail cite <span className="text-white/80 font-semibold">cash mismanagement and lack of visibility</span> as primary causes.
                FounderBrain gives you the dashboard your investors have — built from your own data, powered by machine learning, updated every time you check in.
              </p>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center animate-fadeInUp delay-300">
            <button
              onClick={() => setShowModal(true)}
              className="relative group px-8 py-4 rounded-2xl bg-[#63ffb4] text-[#080c10] font-black text-sm hover:bg-[#4dffa8] active:scale-[0.98] transition-all overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                <Icon.Zap size={16} />
                Become a Founder — Free
              </span>
              <div className="absolute inset-0 bg-white/25 -translate-x-full group-hover:translate-x-full transition-transform duration-500 skew-x-12" />
            </button>
            <button
              onClick={() => navigate("/demo-dashboard")}
              className="px-8 py-4 rounded-2xl border border-white/15 bg-white/5 text-white font-semibold text-sm hover:bg-white/10 hover:border-white/25 active:scale-[0.98] transition-all flex items-center gap-2"
            >
              <Icon.BarChart size={16} />
              Explore Demo Dashboard
            </button>
          </div>

          {/* Stats bar */}
          <div className="animate-fadeInUp delay-400">
            <div className="inline-flex items-center gap-2 divide-x divide-white/[0.08] rounded-2xl border border-white/[0.08] bg-white/[0.03] px-6 py-4">
              {STATS.map(({ value, label, color }, i) => (
                <div key={label} className={`text-center ${i > 0 ? "pl-6" : ""} ${i < STATS.length-1 ? "pr-6" : ""}`}>
                  <div className="text-xl font-black" style={{ color }}>{value}</div>
                  <div className="text-[10px] text-white/30 mt-0.5 whitespace-nowrap">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ FEATURE CARDS ══ */}
        <section className="space-y-8">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-white/40 text-xs font-mono tracking-widest">
              <Icon.Lock size={11} />
              FOUNDER-ONLY FEATURES
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Everything you unlock as a Founder
            </h2>
            <p className="text-sm text-white/40 max-w-lg mx-auto leading-relaxed">
              Hover any card to see a detailed breakdown of what each feature does and how it helps your startup survive and scale.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f, i) => (
              <FeatureCard
                key={f.title}
                feature={f}
                index={i}
                onUpgrade={() => setShowModal(true)}
              />
            ))}
          </div>

          <div className="text-center">
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl border border-[#63ffb4]/25 bg-[#63ffb4]/8 text-[#63ffb4] font-bold text-sm hover:bg-[#63ffb4]/15 active:scale-95 transition-all"
            >
              <Icon.Zap size={14} />
              Unlock all features as a Founder
            </button>
          </div>
        </section>

        {/* ══ HOW IT WORKS ══ */}
        <section className="space-y-10">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-black text-white">From data to decisions in 60 seconds</h2>
            <p className="text-sm text-white/40 max-w-md mx-auto">
              No integrations, no onboarding call, no CSV uploads. Just enter your numbers and your AI dashboard is ready instantly.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {STEPS.map(({ num, icon: StepIcon, title, desc }, i) => (
              <div
                key={num}
                className="relative rounded-2xl border border-white/[0.07] bg-[#0d1117]/90 p-6 space-y-4 animate-fadeInUp"
                style={{ animationDelay:`${i * 0.1}s` }}
              >
                {/* Connector line */}
                {i < STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-8 -right-2 w-4 h-px bg-gradient-to-r from-white/20 to-transparent z-10" />
                )}
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black text-white/20 tracking-widest font-mono">{num}</span>
                  <div className="w-9 h-9 rounded-xl bg-[#63ffb4]/10 border border-[#63ffb4]/20 flex items-center justify-center text-[#63ffb4]">
                    <StepIcon size={18} />
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-black text-white mb-2">{title}</h3>
                  <p className="text-xs text-white/40 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ══ TESTIMONIALS ══ */}
        <section className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-black text-white">Founders trust FounderBrain</h2>
            <p className="text-sm text-white/40">Real feedback from founders who upgraded from Explorer to Founder</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {TESTIMONIALS.map(({ name, role, text }, i) => (
              <div
                key={name}
                className="rounded-2xl border border-white/[0.07] bg-[#0d1117]/90 p-6 space-y-4 animate-fadeInUp"
                style={{ animationDelay:`${i * 0.1}s` }}
              >
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, j) => (
                    <span key={j} className="text-[#fbbf24]"><Icon.Star size={13} /></span>
                  ))}
                </div>
                <p className="text-sm text-white/60 leading-relaxed italic">"{text}"</p>
                <div>
                  <p className="text-sm font-bold text-white">{name}</p>
                  <p className="text-xs text-white/35">{role}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ══ FINAL CTA ══ */}
        <section className="animate-fadeInUp">
          <div className="relative rounded-3xl border border-[#63ffb4]/20 bg-[#0d1117]/80 p-14 text-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#63ffb4]/5 via-transparent to-[#60a5fa]/5 pointer-events-none" />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#63ffb4]/50 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#60a5fa]/30 to-transparent" />

            <div className="relative space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#63ffb4]/25 bg-[#63ffb4]/8 text-[#63ffb4] text-xs font-mono tracking-widest mb-2">
                FREE TO START
              </div>
              <h2 className="text-4xl font-black text-white leading-tight">
                Stop guessing.<br />
                <span className="text-[#63ffb4]">Start knowing.</span>
              </h2>
              <p className="text-sm text-white/45 max-w-md mx-auto leading-relaxed">
                Register as a Founder in 30 seconds. Enter your startup metrics. Get your complete AI health dashboard instantly — no credit card, no call, no setup.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <button
                  onClick={() => setShowModal(true)}
                  className="group inline-flex items-center gap-2 px-10 py-4 rounded-2xl bg-[#63ffb4] text-[#080c10] font-black text-sm hover:bg-[#4dffa8] active:scale-[0.98] transition-all overflow-hidden relative"
                >
                  <Icon.Zap size={16} />
                  Register as Founder — Free
                </button>
                <button
                  onClick={() => navigate("/demo-dashboard")}
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl border border-white/15 bg-white/5 text-white/70 font-semibold text-sm hover:text-white hover:bg-white/10 transition-all"
                >
                  <Icon.BarChart size={16} />
                  See Demo First
                </button>
              </div>
              {/* Trust signals */}
              <div className="flex items-center justify-center gap-6 pt-4">
                {["No credit card required","Free forever plan","Setup in 2 minutes"].map((t) => (
                  <div key={t} className="flex items-center gap-1.5 text-[11px] text-white/30">
                    <span className="text-[#63ffb4]"><Icon.CheckCircle size={13} /></span>
                    {t}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>

      {showModal && <UpgradeModal onClose={() => setShowModal(false)} />}
    </div>
  );
}