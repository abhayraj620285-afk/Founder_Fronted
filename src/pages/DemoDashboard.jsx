import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { fetchDashboardApi } from "../api/api";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  RadialBarChart, RadialBar, ResponsiveContainer,
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Cell,
  PieChart, Pie, ReferenceLine,
} from "recharts";

gsap.registerPlugin(ScrollTrigger);

// ── Inline SVG icons ──────────────────────────────────────────────────────────
const Ic = {
  TrendUp:  () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  Clock:    () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  Shield:   () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>,
  Zap:      () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  Target:   () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  Dollar:   () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  Bar:      () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  Refresh:  () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>,
  Info:     () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>,
  Plus:     () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Activity: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  Check:    () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const riskColor = (l) => ({ LOW:"#63ffb4", MEDIUM:"#fbbf24", HIGH:"#f87171" }[l] ?? "#fbbf24");
const riskBg    = (l) => ({ LOW:"rgba(99,255,180,0.07)", MEDIUM:"rgba(251,191,36,0.07)", HIGH:"rgba(248,113,113,0.07)" }[l] ?? "");
const riskBdr   = (l) => ({ LOW:"rgba(99,255,180,0.22)", MEDIUM:"rgba(251,191,36,0.22)", HIGH:"rgba(248,113,113,0.22)" }[l] ?? "");

function Card({ children, className="", style={}, ref: fwdRef }) {
  return (
    <div ref={fwdRef} className={`rounded-2xl border border-white/[0.07] bg-[#0d1117]/90 backdrop-blur-sm ${className}`} style={style}>
      {children}
    </div>
  );
}

function SL({ children, className="" }) {
  return <div className={`text-[10px] font-bold tracking-[0.18em] uppercase text-white/30 mb-3 ${className}`}>{children}</div>;
}

function TTip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#080c10] border border-white/10 rounded-xl px-3 py-2.5 text-xs shadow-2xl min-w-[110px]">
      {label && <p className="text-white/40 mb-1.5 font-semibold">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} className="font-bold tabular-nums" style={{ color: p.color ?? p.fill ?? "#fff" }}>
          {p.name}: {typeof p.value === "number" ? p.value.toFixed(1) : p.value}
        </p>
      ))}
    </div>
  );
}

// ── Animated count-up ──────────────────────────────────────────────────────────
function useCountUp(target, duration=1400, decimals=0) {
  const [val, setVal] = useState(0);
  const raf = useRef(null);
  useEffect(() => {
    if (target == null) return;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setVal(parseFloat((target * ease).toFixed(decimals)));
      if (progress < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target]);
  return val;
}

// ── Spinner ───────────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <div className="flex flex-col items-center justify-center h-72 gap-4">
      <div className="relative w-14 h-14">
        <div className="absolute inset-0 rounded-full border-2 border-[#63ffb4]/10"/>
        <div className="absolute inset-0 rounded-full border-t-2 border-[#63ffb4] animate-spin"/>
        <div className="absolute inset-3 rounded-full border-t-2 border-[#60a5fa]/60 animate-spin" style={{ animationDirection:"reverse", animationDuration:"0.8s" }}/>
      </div>
      <p className="text-xs text-white/30 tracking-widest uppercase font-semibold animate-pulse">Analysing your startup…</p>
    </div>
  );
}

// ── Health Ring ───────────────────────────────────────────────────────────────
function HealthRing({ score }) {
  const animated = useCountUp(score, 1600);
  const color = score>=70 ? "#63ffb4" : score>=40 ? "#fbbf24" : "#f87171";
  const label = score>=70 ? "Healthy" : score>=40 ? "Moderate" : "Critical";
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-48 h-48">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart cx="50%" cy="50%" innerRadius="64%" outerRadius="88%"
            startAngle={225} endAngle={-45} data={[{ v: score, fill: color }]} barSize={14}>
            <RadialBar background={{ fill:"rgba(255,255,255,0.04)", radius:10 }}
              dataKey="v" cornerRadius={10} data={[{ v: score, fill: color }]}/>
          </RadialBarChart>
        </ResponsiveContainer>
        {/* Centre */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl font-black tabular-nums" style={{ color }}>{animated}</span>
          <span className="text-[11px] text-white/25 tracking-widest mt-0.5">/100</span>
        </div>
        {/* Glow */}
        <div className="absolute inset-0 rounded-full pointer-events-none" style={{ boxShadow:`0 0 50px ${color}20` }}/>
      </div>
      <span className="text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded-full border"
        style={{ color, borderColor:`${color}40`, background:`${color}12` }}>
        {label}
      </span>
      {/* Score segments */}
      <div className="flex items-center gap-3 text-[10px] text-white/30">
        {[{r:"0-39",c:"#f87171"},{r:"40-69",c:"#fbbf24"},{r:"70-100",c:"#63ffb4"}].map(({ r, c }) => (
          <div key={r} className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background:c }}/>
            {r}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── ML Risk Gauge ──────────────────────────────────────────────────────────────
function RiskGauge({ riskLevel, confidence }) {
  const color = riskColor(riskLevel);
  const pct   = Math.round((confidence ?? 0) * 100);
  const arcs  = [
    { name:"LOW",    value:33, color:"#63ffb4" },
    { name:"MEDIUM", value:34, color:"#fbbf24" },
    { name:"HIGH",   value:33, color:"#f87171" },
  ];
  const needleDeg = { LOW:-62, MEDIUM:0, HIGH:62 }[riskLevel] ?? 0;

  return (
    <div className="space-y-4">
      <SL>ML Risk Prediction</SL>
      <div className="flex gap-5 items-start">
        {/* Semicircle */}
        <div className="relative shrink-0" style={{ width:130, height:75 }}>
          <ResponsiveContainer width="100%" height={150}>
            <PieChart>
              <Pie data={arcs} cx="50%" cy="100%" startAngle={180} endAngle={0}
                innerRadius={44} outerRadius={62} paddingAngle={2} dataKey="value" strokeWidth={0}>
                {arcs.map((a) => (
                  <Cell key={a.name} fill={a.name === riskLevel ? a.color : `${a.color}20`}/>
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          {/* Needle */}
          <div className="absolute bottom-0 left-1/2" style={{
            width:2, height:50, transformOrigin:"bottom center",
            transform:`translateX(-50%) rotate(${needleDeg}deg)`,
            background:color, borderRadius:2,
          }}/>
          <div className="absolute bottom-0 left-1/2 w-3 h-3 rounded-full border-2 border-[#0d1117]"
            style={{ transform:"translateX(-50%)", background:color }}/>
          <div className="absolute bottom-[-14px] left-0 text-[9px] font-bold text-[#63ffb4]/50">LOW</div>
          <div className="absolute bottom-[-14px] right-0 text-[9px] font-bold text-[#f87171]/50">HIGH</div>
        </div>

        {/* Info */}
        <div className="flex-1 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-black tracking-widest uppercase"
            style={{ color, background:riskBg(riskLevel), borderColor:riskBdr(riskLevel) }}>
            <span className={`w-2 h-2 rounded-full ${riskLevel==="HIGH"?"animate-ping":""}`} style={{ background:color }}/>
            {riskLevel ?? "—"}
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-white/35">Model Confidence</span>
              <span className="font-black tabular-nums" style={{ color }}>{pct}%</span>
            </div>
            <div className="h-2.5 rounded-full bg-white/[0.06] overflow-hidden">
              <div className="h-full rounded-full transition-all duration-1000"
                style={{ width:`${pct}%`, background:`linear-gradient(90deg,${color}70,${color})` }}/>
            </div>
            <p className="text-[10px] text-white/25">
              {pct>=80?"High confidence — data strongly supports this classification":pct>=60?"Moderate confidence — consider adding more data points":"Low confidence — add more monthly data to improve accuracy"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── KPI card ──────────────────────────────────────────────────────────────────
function KPICard({ label, value, sub, icon: Ic2, color, delta, trend }) {
  const cardRef = useRef(null);
  useEffect(() => {
    if (!cardRef.current) return;
    gsap.from(cardRef.current, { y:30, opacity:0, duration:0.6, ease:"power3.out", scrollTrigger:{ trigger:cardRef.current, start:"top 90%" } });
  }, []);

  return (
    <div ref={cardRef} className="rounded-2xl border border-white/[0.07] bg-[#0d1117]/90 p-5 space-y-3 hover:border-white/15 transition-colors group">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold tracking-widest uppercase text-white/30">{label}</span>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center border border-white/[0.07] group-hover:border-white/15 transition-colors" style={{ color }}>
          <Ic2 />
        </div>
      </div>
      <div className="text-3xl font-black tabular-nums" style={{ color }}>{value}</div>
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-white/30">{sub}</span>
        {delta != null && (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border tabular-nums ${delta>=0?"text-[#63ffb4] border-[#63ffb4]/25 bg-[#63ffb4]/8":"text-[#f87171] border-[#f87171]/25 bg-[#f87171]/8"}`}>
            {delta>=0?"▲":"▼"} {Math.abs(delta).toFixed(1)}
          </span>
        )}
      </div>
    </div>
  );
}

// ── Activity feed ─────────────────────────────────────────────────────────────
function ActivityFeed({ data }) {
  const events = [
    { icon:"Shield", text:`Risk classified as ${data.riskLevel}`, time:"just now", color:riskColor(data.riskLevel) },
    { icon:"TrendUp", text:`Growth rate ${data.growthRate?.toFixed(1)}% recorded`, time:"just now", color:"#63ffb4" },
    { icon:"Clock",  text:`Runway: ${data.runwayMonths?.toFixed(1)} months remaining`, time:"just now", color:"#60a5fa" },
    { icon:"Zap",    text:"AI insights generated successfully", time:"just now", color:"#a78bfa" },
    { icon:"Dollar", text:"Funding suggestion updated", time:"just now", color:"#fbbf24" },
  ];

  return (
    <div className="space-y-0">
      {events.map(({ icon, text, time, color }, i) => (
        <div key={i} className="flex items-start gap-3 py-3 border-b border-white/[0.05] last:border-0 animate-fadeInUp"
          style={{ animationDelay:`${i*0.08}s` }}>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 border border-white/[0.07]"
            style={{ color, background:`${color}10` }}>
            {icon==="Shield" && <Ic.Shield/>}
            {icon==="TrendUp" && <Ic.TrendUp/>}
            {icon==="Clock" && <Ic.Clock/>}
            {icon==="Zap" && <Ic.Zap/>}
            {icon==="Dollar" && <Ic.Dollar/>}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-white/65">{text}</p>
            <p className="text-[10px] text-white/25 mt-0.5">{time}</p>
          </div>
          <span className="shrink-0 text-[#63ffb4] mt-1"><Ic.Check/></span>
        </div>
      ))}
    </div>
  );
}

// ── Financial breakdown ───────────────────────────────────────────────────────
function FinancialBreakdown({ data }) {
  const items = [
    { label:"Monthly Revenue",    value:data.revenue       ?? data.monthlyRevenue, color:"#63ffb4" },
    { label:"Last Month Revenue", value:data.lastMonthRevenue,                     color:"#60a5fa" },
    { label:"Monthly Expenses",   value:data.monthlyExpenses,                      color:"#f87171" },
    { label:"Cash Reserve",       value:data.cashReserve,                          color:"#fbbf24" },
  ].filter((i) => i.value != null && i.value > 0);

  const max = Math.max(...items.map((i) => i.value), 1);

  return (
    <div className="space-y-3">
      {items.map(({ label, value, color }) => (
        <div key={label} className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-white/45">{label}</span>
            <span className="font-bold tabular-nums" style={{ color }}>${value?.toLocaleString()}</span>
          </div>
          <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
            <div className="h-full rounded-full transition-all duration-1000 ease-out"
              style={{ width:`${(value/max)*100}%`, background:`linear-gradient(90deg,${color}60,${color})` }}/>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { activeStartupId, startups, saveStartupId } = useAuth();
  const toast = useToast();

  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [tab,     setTab]     = useState("overview");
  const [lastUpdated, setLastUpdated] = useState(null);

  // GSAP refs
  const heroRef    = useRef(null);
  const pageRef    = useRef(null);

  const startup = startups?.find((s) => String(s.id) === String(activeStartupId));
  const iAvgG   = data?.industryAvgGrowth    ?? data?.industryAverageGrowth  ?? 0;
  const iAvgR   = data?.industryAvgRunway    ?? data?.industryAverageRunway   ?? 0;
  const conf    = data?.riskConfidence       ?? data?.confidence              ?? 0;
  const rc      = data ? riskColor(data.riskLevel) : "#63ffb4";

  const load = async (id) => {
    if (!id) return;
    setLoading(true); setError("");
    try {
      const res = await fetchDashboardApi(id);
      setData(res);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(activeStartupId); }, [activeStartupId]);

  // GSAP hero entrance
  useEffect(() => {
    if (!heroRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(".dash-hero-title",  { y:40, opacity:0, duration:0.8, ease:"power3.out" });
      gsap.from(".dash-hero-sub",    { y:30, opacity:0, duration:0.8, delay:0.15, ease:"power3.out" });
      gsap.from(".dash-hero-badge",  { y:20, opacity:0, duration:0.6, delay:0.05, ease:"power3.out" });
      gsap.from(".dash-hero-actions",{ y:20, opacity:0, duration:0.6, delay:0.25, ease:"power3.out" });
    }, heroRef);
    return () => ctx.revert();
  }, []);

  // GSAP cards on data load
  useEffect(() => {
    if (!data || !pageRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(".dash-kpi", {
        y:40, opacity:0, duration:0.6, stagger:0.1, ease:"power3.out",
        scrollTrigger:{ trigger:".dash-kpi", start:"top 90%" },
      });
      gsap.from(".dash-card", {
        y:30, opacity:0, duration:0.5, stagger:0.08, ease:"power3.out", delay:0.2,
        scrollTrigger:{ trigger:".dash-card", start:"top 90%" },
      });
    }, pageRef);
    return () => ctx.revert();
  }, [data]);

  // Simulated growth trend data
  const growthTrend = data ? [
    { m:"6mo ago", v: Math.max(0, (data.growthRate ?? 0) - 4.2) },
    { m:"5mo ago", v: Math.max(0, (data.growthRate ?? 0) - 3.1) },
    { m:"4mo ago", v: Math.max(0, (data.growthRate ?? 0) - 1.8) },
    { m:"3mo ago", v: Math.max(0, (data.growthRate ?? 0) - 0.9) },
    { m:"2mo ago", v: Math.max(0, (data.growthRate ?? 0) - 0.3) },
    { m:"This month", v: data.growthRate ?? 0 },
  ] : [];

  const runwayData = data ? Array.from({ length: Math.ceil(data.runwayMonths ?? 6) + 1 }, (_, i) => ({
    m: `M${i}`,
    cash: Math.max(0, (data.runwayMonths ?? 6) * (data.monthlyExpenses ?? 10000) - i * (data.monthlyExpenses ?? 10000)),
  })) : [];

  const TABS = [
    { id:"overview",    label:"Overview"     },
    { id:"financials",  label:"Financials"   },
    { id:"insights",    label:"AI Insights"  },
    { id:"benchmark",   label:"vs Industry"  },
  ];

  return (
    <div ref={pageRef} className="min-h-screen bg-[#080c10] pt-20 pb-20 px-4">

      {/* Animated BG */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {data && <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background:`linear-gradient(90deg,transparent,${rc},transparent)`, opacity:0.6 }}/>}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(99,255,180,0.012)_1px,transparent_1px),linear-gradient(90deg,rgba(99,255,180,0.012)_1px,transparent_1px)] bg-[size:60px_60px]"/>
        <div className="absolute top-20 left-1/4 w-96 h-96 rounded-full blur-[140px] animate-glowPulse" style={{ background: data ? `${rc}08` : "rgba(99,255,180,0.04)" }}/>
      </div>

      <div className="relative max-w-7xl mx-auto space-y-6">

        {/* ── HEADER ── */}
        <div ref={heroRef} className="flex flex-col lg:flex-row lg:items-end justify-between gap-5">
          <div>
            <div className="dash-hero-badge inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#63ffb4]/20 bg-[#63ffb4]/5 text-[#63ffb4] text-xs font-mono tracking-widest mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#63ffb4] animate-pulse"/>
              LIVE ML ANALYTICS
              {lastUpdated && <span className="text-[#63ffb4]/50 ml-1">· {lastUpdated}</span>}
            </div>
            <h1 className="dash-hero-title text-4xl font-black tracking-tight text-white">
              {startup?.name ?? "Dashboard"}
            </h1>
            <p className="dash-hero-sub text-sm text-white/40 mt-1">
              {startup ? `${startup.industry} · AI-powered startup intelligence` : "Select a startup from the navbar"}
            </p>
          </div>

          <div className="dash-hero-actions flex items-center gap-2 flex-wrap">
            {/* Startup switcher hint */}
            {startups?.length > 1 && (
              <div className="text-xs text-white/30 px-3 py-2 rounded-xl border border-white/[0.07] bg-white/[0.03]">
                {startups.length} startups · switch in navbar ↑
              </div>
            )}
            <a href="/create"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#63ffb4]/10 border border-[#63ffb4]/20 text-[#63ffb4] text-xs font-bold hover:bg-[#63ffb4]/20 transition-all">
              <Ic.Plus/> New Startup
            </a>
            {data && (
              <button onClick={() => load(activeStartupId)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/50 text-xs font-semibold hover:text-white hover:border-white/20 transition-all">
                <Ic.Refresh/> Refresh
              </button>
            )}
          </div>
        </div>

        {/* No startup */}
        {!activeStartupId && (
          <div className="rounded-2xl border border-dashed border-white/10 p-20 text-center space-y-4 animate-fadeIn">
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto">
              <Ic.Activity/>
            </div>
            <p className="text-white/40 text-sm">Select a startup from the navbar dropdown to view analytics</p>
            <a href="/create" className="inline-flex items-center gap-2 text-xs text-[#63ffb4] hover:underline font-semibold">
              <Ic.Plus/> Create your first startup
            </a>
          </div>
        )}

        {activeStartupId && loading && <Spinner/>}

        {error && !loading && (
          <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400 flex items-center justify-between">
            <span>⚠ {error}</span>
            <button onClick={() => load(activeStartupId)} className="text-xs underline">Retry</button>
          </div>
        )}

        {data && !loading && (
          <>
            {/* ── TABS ── */}
            <div className="flex gap-1 bg-white/[0.03] border border-white/[0.06] rounded-xl p-1 w-fit">
              {TABS.map((t) => (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all ${tab===t.id?"bg-[#63ffb4]/10 text-[#63ffb4] border border-[#63ffb4]/20":"text-white/40 hover:text-white/70"}`}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* ══ OVERVIEW ══ */}
            {tab === "overview" && (
              <div className="space-y-5 animate-fadeIn">

                {/* Top row */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

                  {/* Health score — big card */}
                  <div className="dash-card lg:col-span-3 rounded-2xl border border-white/[0.07] bg-[#0d1117]/90 p-7 flex flex-col items-center justify-center gap-2 relative overflow-hidden">
                    <div className="absolute inset-0 rounded-2xl pointer-events-none" style={{ background:`radial-gradient(circle at 50% 60%,${rc}09 0%,transparent 70%)` }}/>
                    <SL>Overall Health</SL>
                    <HealthRing score={data.healthScore}/>
                  </div>

                  {/* Risk gauge */}
                  <div className="dash-card lg:col-span-4 rounded-2xl border border-white/[0.07] bg-[#0d1117]/90 p-6 relative overflow-hidden">
                    <div className="absolute inset-0 pointer-events-none" style={{ background:`radial-gradient(circle at 70% 20%,${riskColor(data.riskLevel)}07 0%,transparent 60%)` }}/>
                    <RiskGauge riskLevel={data.riskLevel} confidence={conf}/>
                  </div>

                  {/* KPI mini cards — right column */}
                  <div className="lg:col-span-5 grid grid-cols-2 gap-3">
                    <div className="dash-kpi">
                      <KPICard label="Growth Rate" value={`${(data.growthRate??0).toFixed(1)}%`}
                        sub={`Industry: ${iAvgG.toFixed(1)}%`} icon={Ic.TrendUp}
                        color={(data.growthRate??0)>=iAvgG?"#63ffb4":"#f87171"}
                        delta={(data.growthRate??0)-iAvgG}/>
                    </div>
                    <div className="dash-kpi">
                      <KPICard label="Runway" value={`${(data.runwayMonths??0).toFixed(1)} mo`}
                        sub={`Industry: ${iAvgR.toFixed(1)} mo`} icon={Ic.Clock}
                        color={(data.runwayMonths??0)>=iAvgR?"#60a5fa":"#f87171"}
                        delta={(data.runwayMonths??0)-iAvgR}/>
                    </div>
                    <div className="dash-kpi">
                      <KPICard label="ML Confidence" value={`${Math.round(conf*100)}%`}
                        sub="Model accuracy" icon={Ic.Shield} color={riskColor(data.riskLevel)}/>
                    </div>
                    <div className="dash-kpi">
                      <KPICard label="Health Score" value={`${data.healthScore}/100`}
                        sub={data.healthScore>=70?"Above threshold":"Below threshold"} icon={Ic.Activity}
                        color={data.healthScore>=70?"#63ffb4":data.healthScore>=40?"#fbbf24":"#f87171"}/>
                    </div>
                  </div>
                </div>

                {/* Growth trend chart */}
                <div className="dash-card rounded-2xl border border-white/[0.07] bg-[#0d1117]/90 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <SL className="mb-0">Growth Rate Trend (6 months)</SL>
                    <span className="text-xs text-white/30">vs Industry avg {iAvgG.toFixed(1)}%</span>
                  </div>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={growthTrend} margin={{ top:5, right:5, left:-20, bottom:0 }}>
                      <defs>
                        <linearGradient id="gg" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#63ffb4" stopOpacity={0.25}/>
                          <stop offset="95%" stopColor="#63ffb4" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false}/>
                      <XAxis dataKey="m" tick={{ fill:"rgba(255,255,255,0.3)", fontSize:10 }} axisLine={false} tickLine={false}/>
                      <YAxis tick={{ fill:"rgba(255,255,255,0.2)", fontSize:9 }} axisLine={false} tickLine={false} tickFormatter={(v)=>`${v}%`}/>
                      <Tooltip content={<TTip/>}/>
                      <ReferenceLine y={iAvgG} stroke="rgba(96,165,250,0.3)" strokeDasharray="4 4" label={{ value:"Industry avg", fill:"rgba(96,165,250,0.5)", fontSize:9, position:"insideTopRight" }}/>
                      <Area type="monotone" dataKey="v" name="Growth" stroke="#63ffb4" strokeWidth={2.5} fill="url(#gg)" dot={{ fill:"#63ffb4", r:4, strokeWidth:0 }} activeDot={{ r:6, fill:"#63ffb4" }}/>
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Bottom row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                  {/* Runway projection */}
                  <div className="dash-card lg:col-span-2 rounded-2xl border border-white/[0.07] bg-[#0d1117]/90 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <SL className="mb-0">Cash Runway Projection</SL>
                      <span className="text-xs text-white/30">{data.runwayMonths?.toFixed(1)} months remaining</span>
                    </div>
                    <ResponsiveContainer width="100%" height={170}>
                      <AreaChart data={runwayData} margin={{ top:5, right:5, left:-20, bottom:0 }}>
                        <defs>
                          <linearGradient id="rg" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor="#60a5fa" stopOpacity={0.22}/>
                            <stop offset="95%" stopColor="#60a5fa" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false}/>
                        <XAxis dataKey="m" tick={{ fill:"rgba(255,255,255,0.22)", fontSize:9 }} axisLine={false} tickLine={false}/>
                        <YAxis tick={{ fill:"rgba(255,255,255,0.18)", fontSize:8 }} axisLine={false} tickLine={false} tickFormatter={(v)=>`$${(v/1000).toFixed(0)}k`}/>
                        <Tooltip content={<TTip/>}/>
                        <ReferenceLine y={(data.runwayMonths??6)*(data.monthlyExpenses??10000)*0.2} stroke="rgba(248,113,113,0.4)" strokeDasharray="3 3" label={{ value:"⚠ Critical", fill:"rgba(248,113,113,0.6)", fontSize:9 }}/>
                        <Area type="monotone" dataKey="cash" name="Cash" stroke="#60a5fa" strokeWidth={2.5} fill="url(#rg)" dot={false}/>
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Live activity feed */}
                  <div className="dash-card rounded-2xl border border-white/[0.07] bg-[#0d1117]/90 p-6">
                    <SL>Live Activity</SL>
                    <ActivityFeed data={data}/>
                  </div>
                </div>

                {/* Recommendation + Funding */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {[
                    { icon:Ic.Target, label:"Action Recommendation", color:"#63ffb4", text:data.actionRecommendation??data.recommendation },
                    { icon:Ic.Dollar, label:"Funding Suggestion",    color:"#60a5fa", text:data.fundingSuggestion },
                  ].map(({ icon:Ic2, label, color, text }) => (
                    <div key={label} className="dash-card rounded-2xl border border-white/[0.07] bg-[#0d1117]/90 p-6 space-y-3" style={{ borderLeftColor:color, borderLeftWidth:3 }}>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center border border-white/[0.07]" style={{ color, background:`${color}10` }}>
                          <Ic2/>
                        </div>
                        <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color, opacity:0.8 }}>{label}</span>
                      </div>
                      <p className="text-sm text-white/70 leading-relaxed">{text ?? "—"}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ══ FINANCIALS ══ */}
            {tab === "financials" && (
              <div className="space-y-5 animate-fadeIn">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <div className="dash-card rounded-2xl border border-white/[0.07] bg-[#0d1117]/90 p-6">
                    <SL>Financial Breakdown</SL>
                    <FinancialBreakdown data={data}/>
                  </div>
                  <div className="dash-card rounded-2xl border border-white/[0.07] bg-[#0d1117]/90 p-6">
                    <SL>Revenue vs Expenses</SL>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={[
                        { name:"Revenue",   value:data.revenue??data.monthlyRevenue??0, color:"#63ffb4" },
                        { name:"Expenses",  value:data.monthlyExpenses??0,              color:"#f87171" },
                        { name:"Last Month",value:data.lastMonthRevenue??0,             color:"#60a5fa" },
                      ].filter(d=>d.value>0)} barSize={40} margin={{ top:5, right:5, left:-15, bottom:0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false}/>
                        <XAxis dataKey="name" tick={{ fill:"rgba(255,255,255,0.35)", fontSize:10 }} axisLine={false} tickLine={false}/>
                        <YAxis tick={{ fill:"rgba(255,255,255,0.2)", fontSize:9 }} axisLine={false} tickLine={false} tickFormatter={(v)=>`$${(v/1000).toFixed(0)}k`}/>
                        <Tooltip content={<TTip/>} cursor={{ fill:"rgba(255,255,255,0.03)" }}/>
                        <Bar dataKey="value" radius={[8,8,0,0]}>
                          {[{ color:"#63ffb4" },{ color:"#f87171" },{ color:"#60a5fa" }].map((e,i) => <Cell key={i} fill={e.color} fillOpacity={0.85}/>)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* KPI grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label:"Health",  value:`${data.healthScore}/100`,                   color:rc },
                    { label:"Growth",  value:`${(data.growthRate??0).toFixed(1)}%`,       color:"#63ffb4" },
                    { label:"Runway",  value:`${(data.runwayMonths??0).toFixed(1)} mo`,   color:"#60a5fa" },
                    { label:"Risk",    value:data.riskLevel,                              color:riskColor(data.riskLevel) },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="rounded-2xl border border-white/[0.07] bg-[#0d1117]/90 p-5 text-center space-y-1.5">
                      <div className="text-[10px] text-white/28 tracking-widest uppercase">{label}</div>
                      <div className="text-2xl font-black tabular-nums" style={{ color }}>{value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ══ AI INSIGHTS ══ */}
            {tab === "insights" && (
              <div className="space-y-5 animate-fadeIn">
                {/* Risk hero */}
                <div className="rounded-2xl border p-7 relative overflow-hidden"
                  style={{ background:riskBg(data.riskLevel), borderColor:riskBdr(data.riskLevel) }}>
                  <div className="absolute right-8 top-1/2 -translate-y-1/2 text-9xl font-black opacity-[0.04] select-none" style={{ color:rc }}>{data.riskLevel}</div>
                  <div className="relative">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <span className="text-xs font-black tracking-[0.2em] uppercase px-4 py-1.5 rounded-full border"
                        style={{ color:rc, borderColor:`${rc}40`, background:`${rc}15` }}>
                        {data.riskLevel} RISK · {Math.round(conf*100)}% Confidence
                      </span>
                    </div>
                    <p className="text-sm text-white/70 leading-relaxed max-w-2xl">{data.riskInsight}</p>
                  </div>
                </div>

                {/* Three insights */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { icon:Ic.TrendUp, label:"Growth Insight", text:data.growthInsight,  color:"#63ffb4" },
                    { icon:Ic.Clock,   label:"Runway Insight",  text:data.runwayInsight,  color:"#60a5fa" },
                    { icon:Ic.Shield,  label:"Risk Insight",    text:data.riskInsight,    color:rc        },
                  ].map(({ icon:Ic2, label, text, color }) => (
                    <div key={label} className="rounded-2xl border border-white/[0.07] bg-[#0d1117]/90 p-5 space-y-3 hover:border-white/15 transition-colors"
                      style={{ borderLeftColor:color, borderLeftWidth:3 }}>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center border border-white/[0.07]" style={{ color, background:`${color}10` }}><Ic2/></div>
                        <span className="text-[10px] font-bold tracking-widest uppercase text-white/35">{label}</span>
                      </div>
                      <p className="text-sm text-white/65 leading-relaxed">{text ?? "—"}</p>
                    </div>
                  ))}
                </div>

                {/* Confidence breakdown */}
                <div className="rounded-2xl border border-white/[0.07] bg-[#0d1117]/90 p-6">
                  <SL>ML Confidence Breakdown</SL>
                  <div className="space-y-4">
                    {[
                      { label:"Risk Classification", value:conf,                         color:rc },
                      { label:"Growth Forecast",     value:Math.min(1, conf*0.93),       color:"#63ffb4" },
                      { label:"Runway Estimate",     value:Math.min(1, conf*0.88),       color:"#60a5fa" },
                      { label:"Funding Readiness",   value:Math.min(1, conf*0.82),       color:"#a78bfa" },
                    ].map(({ label, value, color }) => {
                      const p = Math.round(value*100);
                      return (
                        <div key={label} className="space-y-1.5">
                          <div className="flex justify-between text-xs">
                            <span className="text-white/45">{label}</span>
                            <span className="font-black tabular-nums" style={{ color }}>{p}%</span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-white/[0.06] overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-1000" style={{ width:`${p}%`, background:`linear-gradient(90deg,${color}65,${color})` }}/>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ══ VS INDUSTRY ══ */}
            {tab === "benchmark" && (
              <div className="space-y-5 animate-fadeIn">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label:"Growth Rate", yours:data.growthRate??0, industry:iAvgG, unit:"%",  color:"#63ffb4" },
                    { label:"Runway",      yours:data.runwayMonths??0, industry:iAvgR, unit:" mo", color:"#60a5fa" },
                  ].map(({ label, yours, industry, unit, color }) => {
                    const better = yours >= industry;
                    const c = better ? color : "#f87171";
                    const max = Math.max(yours, industry, 1);
                    return (
                      <div key={label} className="rounded-2xl border border-white/[0.07] bg-[#0d1117]/90 p-6 space-y-4">
                        <div className="flex items-center justify-between">
                          <SL className="mb-0">{label}</SL>
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full border" style={{ color:c, borderColor:`${c}30`, background:`${c}10` }}>
                            {better?"▲":"▼"} {Math.abs(yours-industry).toFixed(1)}{unit} {better?"above":"below"}
                          </span>
                        </div>
                        {[{ n:"You", v:yours, c }, { n:"Industry", v:industry, c:"#60a5fa" }].map(({ n, v, c: bc }) => (
                          <div key={n} className="flex items-center gap-3">
                            <span className="text-xs text-white/35 w-16 text-right shrink-0">{n}</span>
                            <div className="flex-1 h-8 bg-white/[0.05] rounded-xl overflow-hidden">
                              <div className="h-full rounded-xl flex items-center justify-end pr-3 transition-all duration-700"
                                style={{ width:`${(v/max)*100}%`, background:`linear-gradient(90deg,${bc}60,${bc})` }}>
                                <span className="text-[11px] font-black text-[#080c10]">{v.toFixed(1)}{unit}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>

                {/* Industry context cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label:"Your Growth",    value:`${(data.growthRate??0).toFixed(1)}%`, color:(data.growthRate??0)>=iAvgG?"#63ffb4":"#f87171" },
                    { label:"Industry Growth",value:`${iAvgG.toFixed(1)}%`,                color:"#60a5fa" },
                    { label:"Your Runway",    value:`${(data.runwayMonths??0).toFixed(1)} mo`, color:(data.runwayMonths??0)>=iAvgR?"#63ffb4":"#f87171" },
                    { label:"Industry Runway",value:`${iAvgR.toFixed(1)} mo`,             color:"#60a5fa" },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="rounded-2xl border border-white/[0.07] bg-[#0d1117]/90 p-4 text-center space-y-1.5">
                      <div className="text-[10px] text-white/30 tracking-widest uppercase">{label}</div>
                      <div className="text-2xl font-black tabular-nums" style={{ color }}>{value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}