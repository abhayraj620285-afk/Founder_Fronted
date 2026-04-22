import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { fetchDashboardApi } from "../api/api";
import {
  RadialBarChart, RadialBar, ResponsiveContainer,
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, ReferenceLine,
} from "recharts";

// ─────────────────────────────────────────────────────────────────────────────
// ICONS — pure inline SVG, zero dependencies
// ─────────────────────────────────────────────────────────────────────────────
const I = {
  TrendUp:   (p={}) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  TrendDn:   (p={}) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>,
  Clock:     (p={}) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  Shield:    (p={}) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>,
  Zap:       (p={}) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  Target:    (p={}) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  Dollar:    (p={}) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  Refresh:   (p={}) => <svg width={p.s||14} height={p.s||14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>,
  Plus:      (p={}) => <svg width={p.s||14} height={p.s||14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Activity:  (p={}) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  Check:     (p={}) => <svg width={p.s||13} height={p.s||13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  Warning:   (p={}) => <svg width={p.s||14} height={p.s||14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  Layers:    (p={}) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>,
  ArrowRight:(p={}) => <svg width={p.s||13} height={p.s||13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const rc  = (l) => ({ LOW:"#63ffb4", MEDIUM:"#fbbf24", HIGH:"#f87171" }[l] || "#fbbf24");
const rbg = (l) => ({ LOW:"rgba(99,255,180,0.08)", MEDIUM:"rgba(251,191,36,0.08)", HIGH:"rgba(248,113,113,0.08)" }[l] || "");
const rbr = (l) => ({ LOW:"rgba(99,255,180,0.25)", MEDIUM:"rgba(251,191,36,0.25)", HIGH:"rgba(248,113,113,0.25)" }[l] || "");

// Count-up hook — pure RAF, no GSAP
function useCountUp(target, dur = 1600, dec = 0) {
  const [v, setV] = useState(0);
  const raf = useRef(null);
  useEffect(() => {
    if (target == null) return;
    const t0 = performance.now();
    const tick = (now) => {
      const p = Math.min((now - t0) / dur, 1);
      const e = 1 - Math.pow(1 - p, 4);
      setV(parseFloat((target * e).toFixed(dec)));
      if (p < 1) raf.current = requestAnimationFrame(tick);
      else setV(target);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target]);
  return v;
}

// Custom chart tooltip
function TTip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:"#060a0e", border:"1px solid rgba(255,255,255,0.1)", borderRadius:12, padding:"10px 14px", fontSize:12 }}>
      {label && <p style={{ color:"rgba(255,255,255,0.4)", marginBottom:6, fontWeight:600 }}>{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || p.fill || "#fff", fontWeight:700, fontFamily:"monospace" }}>
          {p.name}: {typeof p.value === "number" ? p.value.toFixed(1) : p.value}
        </p>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SPINNER — pure CSS
// ─────────────────────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <div className="flex flex-col items-center justify-center h-80 gap-5">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full" style={{ border:"1.5px solid rgba(255,255,255,0.05)" }}/>
        <div className="absolute inset-0 rounded-full animate-spin" style={{ borderTop:"1.5px solid #63ffb4", border:"1.5px solid transparent", borderTopColor:"#63ffb4" }}/>
        <div className="absolute inset-3 rounded-full" style={{ border:"1.5px solid transparent", borderTopColor:"rgba(96,165,250,0.5)", animation:"spin 0.7s linear infinite reverse" }}/>
        <div className="absolute inset-6 rounded-full animate-spin" style={{ border:"1.5px solid transparent", borderTopColor:"rgba(167,139,250,0.4)", animationDuration:"1.4s" }}/>
      </div>
      <p className="text-xs text-white/25 tracking-widest uppercase font-mono animate-pulse">Running ML analysis…</p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HEALTH RING
// ─────────────────────────────────────────────────────────────────────────────
function HealthRing({ score }) {
  const animated = useCountUp(score, 1800);
  const color = score >= 70 ? "#63ffb4" : score >= 45 ? "#fbbf24" : "#f87171";
  const label = score >= 70 ? "Healthy" : score >= 45 ? "Moderate" : "Critical";

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-48 h-48">
        <div className="absolute inset-0 rounded-full" style={{ boxShadow:`0 0 50px ${color}20` }}/>
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="84" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12"/>
        </svg>
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="90%"
            startAngle={225} endAngle={-45} data={[{ v: score, fill: color }]} barSize={14}>
            <RadialBar background={{ fill:"transparent" }} dataKey="v" cornerRadius={7}
              data={[{ v: score, fill: color }]}/>
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
          <span className="text-5xl font-black tabular-nums" style={{ color, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
            {animated}
          </span>
          <span className="text-[10px] text-white/30 tracking-widest font-mono">/100</span>
        </div>
      </div>

      {/* Status pill */}
      <div className="mt-4 flex items-center gap-2 px-5 py-2 rounded-full border"
        style={{ color, borderColor:`${color}40`, background:`${color}12` }}>
        <span className="w-2 h-2 rounded-full animate-pulse" style={{ background:color }}/>
        <span className="text-xs font-black tracking-widest uppercase font-mono">{label}</span>
      </div>

      {/* Scale */}
      <div className="mt-3 flex items-center gap-3 text-[10px] text-white/25 font-mono">
        {[{r:"0–39",c:"#f87171"},{r:"40–69",c:"#fbbf24"},{r:"70–100",c:"#63ffb4"}].map(({r,c}) => (
          <div key={r} className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background:c }}/>
            {r}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ML RISK GAUGE — semicircle + needle
// ─────────────────────────────────────────────────────────────────────────────
function RiskGauge({ level, confidence }) {
  const color = rc(level);
  const pct   = Math.round((confidence || 0) * 100);
  const needleDeg = { LOW:-55, MEDIUM:0, HIGH:55 }[level] || 0;

  return (
    <div className="space-y-4">
      {/* Semicircle */}
      <div className="flex justify-center">
        <div className="relative" style={{ width:150, height:82 }}>
          <ResponsiveContainer width="100%" height={164}>
            <PieChart>
              <Pie data={[{v:33},{v:34},{v:33}]} dataKey="v" cx="50%" cy="100%"
                startAngle={180} endAngle={0} innerRadius={48} outerRadius={70}
                paddingAngle={3} strokeWidth={0}>
                {[
                  { active: level === "LOW",    bright:"#63ffb4", dim:"rgba(99,255,180,0.12)" },
                  { active: level === "MEDIUM", bright:"#fbbf24", dim:"rgba(251,191,36,0.12)" },
                  { active: level === "HIGH",   bright:"#f87171", dim:"rgba(248,113,113,0.12)" },
                ].map(({ active, bright, dim }, i) => (
                  <Cell key={i} fill={active ? bright : dim}/>
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Needle */}
          <div style={{
            position:"absolute", bottom:0, left:"50%",
            width:3, height:50, transformOrigin:"bottom center",
            transform:`translateX(-50%) rotate(${needleDeg}deg)`,
            background:`linear-gradient(to top,${color},transparent)`,
            borderRadius:2,
            transition:"transform 1s cubic-bezier(.34,1.56,.64,1)",
          }}/>
          {/* Pivot dot */}
          <div style={{
            position:"absolute", bottom:-6, left:"50%",
            transform:"translateX(-50%)",
            width:14, height:14, borderRadius:"50%",
            background:color, border:"2px solid #0d1117",
            boxShadow:`0 0 10px ${color}`,
          }}/>
          <div className="absolute text-[9px] font-mono font-bold" style={{ bottom:-18, left:0, color:"rgba(99,255,180,0.5)" }}>LOW</div>
          <div className="absolute text-[9px] font-mono font-bold" style={{ bottom:-18, right:0, color:"rgba(248,113,113,0.5)" }}>HIGH</div>
        </div>
      </div>

      {/* Risk badge + confidence */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border"
          style={{ color, background:rbg(level), borderColor:rbr(level) }}>
          <span className={`w-2 h-2 rounded-full ${level==="HIGH"?"animate-ping":""}`} style={{ background:color }}/>
          <span className="text-sm font-black tracking-widest uppercase font-mono">{level || "—"}</span>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-white/30 font-mono mb-0.5">ML CONFIDENCE</div>
          <div className="text-2xl font-black font-mono" style={{ color }}>{pct}%</div>
        </div>
      </div>

      {/* Confidence bar */}
      <div>
        <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
          <div className="h-full rounded-full" style={{ width:`${pct}%`, background:`linear-gradient(90deg,${color}60,${color})`, transition:"width 1s ease" }}/>
        </div>
        <p className="mt-1.5 text-[10px] text-white/25 font-mono">
          {pct >= 80 ? "High confidence — strong data signal" : pct >= 60 ? "Moderate confidence — add more data" : "Low confidence — input more monthly data"}
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// KPI CARD — highlighted with glow when performing above average
// ─────────────────────────────────────────────────────────────────────────────
function KPICard({ label, value, sub, Icon, color, delta, highlight, delay = 0 }) {
  return (
    <div className="relative rounded-2xl border overflow-hidden animate-fadeInUp"
      style={{
        borderColor:   highlight ? `${color}35` : "rgba(255,255,255,0.07)",
        background:    highlight ? "rgba(13,17,23,0.97)" : "rgba(13,17,23,0.75)",
        boxShadow:     highlight ? `0 0 35px ${color}10, inset 0 1px 0 ${color}18` : "none",
        animationDelay:`${delay}s`,
        transition:    "transform 0.2s",
      }}
      onMouseEnter={e=>e.currentTarget.style.transform="scale(1.02)"}
      onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>

      {/* Top shimmer on highlighted cards */}
      {highlight && (
        <div className="absolute top-0 left-0 right-0 h-px"
          style={{ background:`linear-gradient(90deg,transparent,${color}70,transparent)` }}/>
      )}
      {highlight && (
        <div className="absolute inset-0 pointer-events-none"
          style={{ background:`radial-gradient(circle at 20% 20%,${color}07 0%,transparent 55%)` }}/>
      )}

      <div className="relative p-5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold tracking-widest uppercase text-white/30 font-mono">{label}</span>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center border"
            style={{ color, background:`${color}12`, borderColor:`${color}25` }}>
            <Icon s={17}/>
          </div>
        </div>
        <div className="text-3xl font-black tabular-nums leading-none" style={{ color }}>{value}</div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] text-white/30">{sub}</span>
          {delta != null && (
            <span className={`flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border tabular-nums ${delta>=0?"text-[#63ffb4] border-[#63ffb4]/20 bg-[#63ffb4]/8":"text-[#f87171] border-[#f87171]/20 bg-[#f87171]/8"}`}>
              {delta >= 0 ? <I.TrendUp s={10}/> : <I.TrendDn s={10}/>}
              {Math.abs(delta).toFixed(1)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ALERT BANNERS
// ─────────────────────────────────────────────────────────────────────────────
function AlertBanner({ data }) {
  const alerts = [];
  if (data.riskLevel === "HIGH")       alerts.push({ type:"danger",  msg:`⚠ High ML risk — ${data.riskInsight || "Immediate action recommended"}` });
  if ((data.runwayMonths || 0) < 4)   alerts.push({ type:"warning", msg:`⏱ Runway critical — ${(data.runwayMonths||0).toFixed(1)} months remaining` });
  if ((data.growthRate || 0) < 0)     alerts.push({ type:"danger",  msg:`📉 Negative growth — revenue declining month-over-month` });
  if (!alerts.length) return null;
  return (
    <div className="space-y-2">
      {alerts.map(({ type, msg }, i) => (
        <div key={i} className="flex items-center gap-3 rounded-xl border px-4 py-3 animate-fadeIn"
          style={{ borderColor:type==="danger"?"rgba(248,113,113,0.3)":"rgba(251,191,36,0.3)", background:type==="danger"?"rgba(248,113,113,0.07)":"rgba(251,191,36,0.07)" }}>
          <span style={{ color:type==="danger"?"#f87171":"#fbbf24" }}><I.Warning s={15}/></span>
          <p className="text-sm font-semibold" style={{ color:type==="danger"?"#f87171":"#fbbf24" }}>{msg}</p>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LIVE ACTIVITY FEED
// ─────────────────────────────────────────────────────────────────────────────
function ActivityFeed({ data }) {
  const riskColor = rc(data.riskLevel);
  const events = [
    { Icon:I.Shield,   text:`Risk classified: ${data.riskLevel || "—"}`,             sub:`${Math.round((data.riskConfidence||0)*100)}% ML confidence`,        color:riskColor   },
    { Icon:I.TrendUp,  text:`Growth: ${(data.growthRate||0).toFixed(1)}% MoM`,       sub:`Industry avg: ${(data.industryAvgGrowth||0).toFixed(1)}%`,          color:"#63ffb4"   },
    { Icon:I.Clock,    text:`Runway: ${(data.runwayMonths||0).toFixed(1)} months`,   sub:"At current burn rate",                                               color:"#60a5fa"   },
    { Icon:I.Zap,      text:"AI insights generated",                                  sub:"Funding + action recommendations ready",                            color:"#a78bfa"   },
    { Icon:I.Dollar,   text:"Financial model updated",                                sub:"P&L and cash flow analysed",                                         color:"#fbbf24"   },
    { Icon:I.Layers,   text:"Benchmark comparison run",                               sub:"12 industry signals processed",                                      color:"#60a5fa"   },
  ];
  return (
    <div>
      {events.map(({ Icon:Ic, text, sub, color }, i) => (
        <div key={i} className="flex items-start gap-3 px-2 py-2.5 rounded-xl hover:bg-white/[0.03] transition-colors animate-fadeInUp"
          style={{ animationDelay:`${i*0.07}s` }}>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 border border-white/[0.06]"
            style={{ color, background:`${color}12` }}>
            <Ic s={13}/>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-white/70 font-semibold leading-snug">{text}</p>
            <p className="text-[10px] text-white/28 font-mono mt-0.5">{sub}</p>
          </div>
          <span className="shrink-0 mt-1" style={{ color:"#63ffb4", opacity:0.6 }}><I.Check s={11}/></span>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FINANCIAL BREAKDOWN
// ─────────────────────────────────────────────────────────────────────────────
function FinancialBars({ data }) {
  const items = [
    { label:"Monthly Revenue",    value:data.revenue || data.monthlyRevenue, color:"#63ffb4" },
    { label:"Last Month Revenue", value:data.lastMonthRevenue,              color:"#60a5fa" },
    { label:"Monthly Expenses",   value:data.monthlyExpenses,               color:"#f87171" },
    { label:"Cash Reserve",       value:data.cashReserve,                   color:"#fbbf24" },
  ].filter(i => i.value && i.value > 0);

  const max = Math.max(...items.map(i => i.value), 1);
  const profit = (data.revenue || 0) - (data.monthlyExpenses || 0);

  return (
    <div className="space-y-4">
      {items.map(({ label, value, color }) => (
        <div key={label} className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-white/45 font-medium">{label}</span>
            <span className="font-black tabular-nums" style={{ color }}>${value.toLocaleString()}</span>
          </div>
          <div className="h-2.5 rounded-full bg-white/[0.05] overflow-hidden">
            <div className="h-full rounded-full" style={{ width:`${(value/max)*100}%`, background:`linear-gradient(90deg,${color}55,${color})`, transition:"width 1s ease" }}/>
          </div>
        </div>
      ))}
      {profit !== 0 && (
        <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
          <span className="text-xs text-white/40 font-mono">Monthly P&amp;L</span>
          <span className={`text-sm font-black tabular-nums ${profit>=0?"text-[#63ffb4]":"text-[#f87171]"}`}>
            {profit>=0?"+":""}{profit.toLocaleString("en-US",{ style:"currency", currency:"USD", maximumFractionDigits:0 })}
          </span>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { activeStartupId, startups } = useAuth();
  const toast    = useToast();
  const navigate = useNavigate();

  const [data,        setData]        = useState(null);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState("");
  const [tab,         setTab]         = useState("overview");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshing,  setRefreshing]  = useState(false);

  const startup = startups?.find(s => String(s.id) === String(activeStartupId));
  const iAvgG   = data?.industryAvgGrowth || data?.industryAverageGrowth || 9;
  const iAvgR   = data?.industryAvgRunway || data?.industryAverageRunway || 11;
  const conf    = data?.riskConfidence    || data?.confidence             || 0;
  const rColor  = rc(data?.riskLevel);

  const load = useCallback(async (id, isRefresh = false) => {
    if (!id) return;
    if (isRefresh) setRefreshing(true); else setLoading(true);
    setError("");
    try {
      const res = await fetchDashboardApi(id);
      setData(res);
      setLastUpdated(new Date().toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" }));
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(activeStartupId); }, [activeStartupId]);

  // Chart data derived from API
  const growthTrend = data ? Array.from({ length:6 }, (_, i) => ({
    m:    ["6mo","5mo","4mo","3mo","2mo","Now"][i],
    you:  Math.max(0, (data.growthRate||0) - (5-i)*((data.growthRate||0)*0.09)),
    avg:  iAvgG,
  })) : [];

  const runwayData = data ? Array.from({ length: Math.min(Math.ceil(data.runwayMonths||8)+1, 13) }, (_, i) => ({
    m:    `M${i}`,
    cash: Math.max(0, (data.cashReserve||0) - i*(data.monthlyExpenses||10000)),
  })) : [];

  const TABS = [
    { id:"overview",   label:"Overview",    Icon:I.Activity },
    { id:"financials", label:"Financials",  Icon:I.Dollar   },
    { id:"insights",   label:"AI Insights", Icon:I.Shield   },
    { id:"benchmark",  label:"vs Industry", Icon:I.Layers   },
  ];

  return (
    <div className="min-h-screen bg-[#080c10] pt-20 pb-24 px-4">

      {/* ── Background atmosphere ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px transition-all duration-1000"
          style={{ background:`linear-gradient(90deg,transparent,${rColor}55,transparent)` }}/>
        <div className="absolute top-24 left-1/3 w-[500px] h-[500px] rounded-full blur-[150px] animate-glowPulse"
          style={{ background:`${rColor}06` }}/>
        <div className="absolute bottom-20 right-1/4 w-[400px] h-[400px] rounded-full blur-[120px]"
          style={{ background:"rgba(96,165,250,0.04)" }}/>
        <div className="absolute inset-0"
          style={{ backgroundImage:"linear-gradient(rgba(99,255,180,0.012) 1px,transparent 1px),linear-gradient(90deg,rgba(99,255,180,0.012) 1px,transparent 1px)", backgroundSize:"60px 60px" }}/>
      </div>

      <div className="relative max-w-7xl mx-auto space-y-6">

        {/* ── HEADER ── */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 animate-fadeIn">
          <div>
            {/* Badges row */}
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#63ffb4]/20 bg-[#63ffb4]/5 text-[#63ffb4] text-[10px] font-mono tracking-widest">
                <span className="w-1.5 h-1.5 rounded-full bg-[#63ffb4] animate-pulse"/>
                LIVE ML ANALYTICS
              </div>
              {lastUpdated && <span className="text-[10px] text-white/25 font-mono">Updated {lastUpdated}</span>}
              {data && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-white/10 text-[10px] font-mono text-white/35">
                  {startup?.industry || "Startup"} · Health {data.healthScore}/100
                </div>
              )}
            </div>
            <h1 className="font-display text-4xl sm:text-5xl text-white tracking-tight">
              {startup?.name || "Dashboard"}
            </h1>
            <p className="text-sm text-white/40 mt-1.5">
              {startup ? `AI-powered intelligence for ${startup.industry || "your startup"}` : "Select a startup from the navbar"}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {(startups?.length || 0) > 1 && (
              <div className="text-xs text-white/25 px-3 py-2 rounded-xl border border-white/[0.07] font-mono">
                {startups.length} startups · switch ↑
              </div>
            )}
            <Link to="/create" className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#63ffb4]/20 bg-[#63ffb4]/8 text-[#63ffb4] text-xs font-bold hover:bg-[#63ffb4]/15 transition-all">
              <I.Plus s={13}/> New Startup
            </Link>
            <Link to="/benchmark" className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#60a5fa]/20 bg-[#60a5fa]/8 text-[#60a5fa] text-xs font-bold hover:bg-[#60a5fa]/15 transition-all">
              <I.Layers s={13}/> Benchmark
            </Link>
            {data && (
              <button onClick={() => load(activeStartupId, true)} disabled={refreshing}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-white/10 bg-white/[0.04] text-white/50 text-xs font-semibold hover:text-white hover:border-white/20 transition-all disabled:opacity-40">
                <span style={{ display:"inline-block", animation:refreshing?"spin 1s linear infinite":"none" }}><I.Refresh s={13}/></span>
                {refreshing ? "Refreshing…" : "Refresh"}
              </button>
            )}
          </div>
        </div>

        {/* ── EMPTY STATE ── */}
        {!activeStartupId && (
          <div className="rounded-2xl border border-dashed border-white/10 p-24 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center mx-auto text-white/20">
              <I.Activity s={28}/>
            </div>
            <p className="text-white/35 text-sm">Select a startup from the navbar to view your AI analytics</p>
            <Link to="/create" className="inline-flex items-center gap-2 text-xs text-[#63ffb4] hover:underline font-semibold">
              <I.Plus s={12}/> Create your first startup
            </Link>
          </div>
        )}

        {activeStartupId && loading && <Spinner/>}

        {error && !loading && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/8 px-4 py-3 text-sm text-red-400 flex items-center justify-between">
            <span className="flex items-center gap-2"><I.Warning s={14}/>{error}</span>
            <button onClick={() => load(activeStartupId)} className="text-xs underline opacity-70 hover:opacity-100">Retry</button>
          </div>
        )}

        {data && !loading && (
          <>
            {/* Alert banners */}
            <AlertBanner data={data}/>

            {/* Tabs */}
            <div className="flex gap-1 rounded-xl border border-white/[0.07] bg-white/[0.03] p-1 w-fit">
              {TABS.map(({ id, label, Icon:Ic }) => (
                <button key={id} onClick={() => setTab(id)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all ${tab===id?"bg-[#63ffb4]/10 text-[#63ffb4] border border-[#63ffb4]/20":"text-white/40 hover:text-white/70"}`}>
                  <Ic s={12}/>{label}
                </button>
              ))}
            </div>

            {/* ══ OVERVIEW ══ */}
            {tab === "overview" && (
              <div className="space-y-5">

                {/* Row 1: Health ring + Risk gauge + 4 KPIs */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

                  {/* Health score centrepiece */}
                  <div className="lg:col-span-3 rounded-2xl border border-white/[0.07] bg-[#0d1117]/90 p-7 flex flex-col items-center justify-center relative overflow-hidden animate-fadeIn"
                    style={{ boxShadow:`inset 0 0 70px ${rColor}05` }}>
                    <div className="absolute inset-0 pointer-events-none" style={{ background:`radial-gradient(circle at 50% 60%,${rColor}06 0%,transparent 70%)` }}/>
                    <div className="relative">
                      <div className="text-[10px] font-mono tracking-widest uppercase text-white/30 text-center mb-5">Overall Health Score</div>
                      <HealthRing score={data.healthScore || 0}/>
                    </div>
                  </div>

                  {/* ML Risk gauge */}
                  <div className="lg:col-span-4 rounded-2xl border bg-[#0d1117]/90 p-6 relative overflow-hidden animate-fadeIn delay-100"
                    style={{ borderColor:rbr(data.riskLevel), boxShadow:`inset 0 0 50px ${rColor}04` }}>
                    <div className="absolute inset-0 pointer-events-none" style={{ background:`radial-gradient(circle at 70% 10%,${rColor}05 0%,transparent 55%)` }}/>
                    <div className="relative">
                      <div className="text-[10px] font-mono tracking-widest uppercase text-white/30 mb-4">ML Risk Prediction</div>
                      <RiskGauge level={data.riskLevel} confidence={conf}/>
                    </div>
                  </div>

                  {/* 4 KPI cards */}
                  <div className="lg:col-span-5 grid grid-cols-2 gap-3">
                    <KPICard label="Growth Rate" Icon={I.TrendUp} delay={0.1}
                      value={`${(data.growthRate||0).toFixed(1)}%`}
                      sub={`Industry: ${iAvgG.toFixed(1)}%`}
                      color={(data.growthRate||0)>=iAvgG?"#63ffb4":"#f87171"}
                      delta={(data.growthRate||0)-iAvgG}
                      highlight={(data.growthRate||0)>=iAvgG}/>
                    <KPICard label="Cash Runway" Icon={I.Clock} delay={0.17}
                      value={`${(data.runwayMonths||0).toFixed(1)} mo`}
                      sub={`Industry: ${iAvgR.toFixed(1)} mo`}
                      color={(data.runwayMonths||0)>=6?"#60a5fa":(data.runwayMonths||0)>=3?"#fbbf24":"#f87171"}
                      delta={(data.runwayMonths||0)-iAvgR}
                      highlight={(data.runwayMonths||0)>=iAvgR}/>
                    <KPICard label="ML Confidence" Icon={I.Shield} delay={0.24}
                      value={`${Math.round(conf*100)}%`}
                      sub="Model accuracy"
                      color={rColor}
                      highlight={conf>=0.8}/>
                    <KPICard label="Health Index" Icon={I.Activity} delay={0.31}
                      value={`${data.healthScore||0}`}
                      sub={(data.healthScore||0)>=70?"Above threshold":"Below threshold"}
                      color={(data.healthScore||0)>=70?"#63ffb4":(data.healthScore||0)>=45?"#fbbf24":"#f87171"}
                      highlight={(data.healthScore||0)>=70}/>
                  </div>
                </div>

                {/* Row 2: Growth chart + Runway chart */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {/* Growth trend */}
                  <div className="rounded-2xl border border-white/[0.07] bg-[#0d1117]/90 p-6 animate-fadeIn delay-200">
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <div className="text-[10px] font-mono tracking-widest uppercase text-white/30 mb-1">Growth Rate Trend</div>
                        <div className="text-xl font-black text-[#63ffb4]">
                          {(data.growthRate||0).toFixed(1)}%
                          <span className="text-sm text-white/30 font-normal ml-1.5">MoM</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-[10px] font-mono">
                        <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 rounded bg-[#63ffb4]"/>You</div>
                        <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 rounded bg-[#60a5fa]/50"/>Avg</div>
                      </div>
                    </div>
                    <ResponsiveContainer width="100%" height={180}>
                      <AreaChart data={growthTrend} margin={{ top:5, right:5, left:-22, bottom:0 }}>
                        <defs>
                          <linearGradient id="gg" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#63ffb4" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#63ffb4" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false}/>
                        <XAxis dataKey="m" tick={{ fill:"rgba(255,255,255,0.28)", fontSize:10, fontFamily:"monospace" }} axisLine={false} tickLine={false}/>
                        <YAxis tick={{ fill:"rgba(255,255,255,0.18)", fontSize:9 }} axisLine={false} tickLine={false} tickFormatter={v=>`${v.toFixed(0)}%`}/>
                        <Tooltip content={<TTip/>}/>
                        <ReferenceLine y={iAvgG} stroke="rgba(96,165,250,0.3)" strokeDasharray="4 3"
                          label={{ value:`Avg ${iAvgG.toFixed(1)}%`, fill:"rgba(96,165,250,0.5)", fontSize:9, position:"insideTopRight" }}/>
                        <Area type="monotone" dataKey="you" name="Growth" stroke="#63ffb4" strokeWidth={2.5} fill="url(#gg)"
                          dot={{ fill:"#63ffb4", r:3.5, strokeWidth:0 }} activeDot={{ r:5, fill:"#63ffb4", stroke:"#080c10", strokeWidth:2 }}/>
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Runway projection */}
                  <div className="rounded-2xl border border-white/[0.07] bg-[#0d1117]/90 p-6 animate-fadeIn delay-300">
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <div className="text-[10px] font-mono tracking-widest uppercase text-white/30 mb-1">Cash Runway Projection</div>
                        <div className="text-xl font-black text-[#60a5fa]">
                          {(data.runwayMonths||0).toFixed(1)} mo
                          <span className="text-sm text-white/30 font-normal ml-1.5">remaining</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-white/25 font-mono">Monthly burn</div>
                        <div className="text-sm font-black text-[#f87171]">${(data.monthlyExpenses||0).toLocaleString()}</div>
                      </div>
                    </div>
                    <ResponsiveContainer width="100%" height={180}>
                      <AreaChart data={runwayData} margin={{ top:5, right:5, left:-22, bottom:0 }}>
                        <defs>
                          <linearGradient id="rg" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.25}/>
                            <stop offset="95%" stopColor="#60a5fa" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false}/>
                        <XAxis dataKey="m" tick={{ fill:"rgba(255,255,255,0.25)", fontSize:10, fontFamily:"monospace" }} axisLine={false} tickLine={false}/>
                        <YAxis tick={{ fill:"rgba(255,255,255,0.16)", fontSize:8 }} axisLine={false} tickLine={false} tickFormatter={v=>`$${(v/1000).toFixed(0)}k`}/>
                        <Tooltip content={<TTip/>}/>
                        <ReferenceLine y={(data.cashReserve||0)*0.2} stroke="rgba(248,113,113,0.4)" strokeDasharray="3 3"
                          label={{ value:"⚠ Critical", fill:"rgba(248,113,113,0.6)", fontSize:9, position:"insideTopLeft" }}/>
                        <Area type="monotone" dataKey="cash" name="Cash" stroke="#60a5fa" strokeWidth={2.5}
                          fill="url(#rg)" dot={false} activeDot={{ r:5, fill:"#60a5fa", stroke:"#080c10", strokeWidth:2 }}/>
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Row 3: Activity feed + Action + Funding */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                  {/* Live feed */}
                  <div className="rounded-2xl border border-white/[0.07] bg-[#0d1117]/90 p-5 animate-fadeIn delay-300">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#63ffb4] animate-pulse"/>
                      <span className="text-[10px] font-mono tracking-widest uppercase text-white/30">Live Analysis Feed</span>
                    </div>
                    <ActivityFeed data={data}/>
                  </div>

                  {/* Action recommendation */}
                  <div className="rounded-2xl border bg-[#0d1117]/90 p-6 space-y-4 animate-fadeIn delay-400"
                    style={{ borderColor:"rgba(99,255,180,0.18)", borderLeftWidth:3 }}>
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center border border-[#63ffb4]/20 bg-[#63ffb4]/10 text-[#63ffb4]"><I.Target s={17}/></div>
                      <div>
                        <div className="text-[10px] font-mono tracking-widest text-[#63ffb4]/60 uppercase">Action Recommendation</div>
                        <div className="text-xs text-white/35">AI-generated · updates on refresh</div>
                      </div>
                    </div>
                    <p className="text-sm text-white/70 leading-relaxed">{data.actionRecommendation || data.recommendation || "No recommendation available."}</p>
                    <button onClick={() => navigate("/benchmark")}
                      className="flex items-center gap-1.5 text-xs text-[#63ffb4] font-semibold hover:text-white transition-colors">
                      View benchmark comparison <I.ArrowRight s={11}/>
                    </button>
                  </div>

                  {/* Funding suggestion */}
                  <div className="rounded-2xl border bg-[#0d1117]/90 p-6 space-y-4 animate-fadeIn delay-500"
                    style={{ borderColor:"rgba(96,165,250,0.18)", borderLeftWidth:3 }}>
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center border border-[#60a5fa]/20 bg-[#60a5fa]/10 text-[#60a5fa]"><I.Dollar s={17}/></div>
                      <div>
                        <div className="text-[10px] font-mono tracking-widest text-[#60a5fa]/60 uppercase">Funding Suggestion</div>
                        <div className="text-xs text-white/35">Stage-aware · AI-powered</div>
                      </div>
                    </div>
                    <p className="text-sm text-white/70 leading-relaxed">{data.fundingSuggestion || "No funding suggestion available."}</p>
                    <div className="flex items-center gap-1.5 text-[10px] text-white/25 font-mono">
                      <I.Zap s={10}/> Based on runway, growth and industry benchmarks
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ══ FINANCIALS ══ */}
            {tab === "financials" && (
              <div className="space-y-5 animate-fadeIn">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <div className="rounded-2xl border border-white/[0.07] bg-[#0d1117]/90 p-6">
                    <div className="text-[10px] font-mono tracking-widest uppercase text-white/30 mb-5">Financial Breakdown</div>
                    <FinancialBars data={data}/>
                  </div>
                  <div className="rounded-2xl border border-white/[0.07] bg-[#0d1117]/90 p-6">
                    <div className="text-[10px] font-mono tracking-widest uppercase text-white/30 mb-5">Revenue vs Expenses</div>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart barSize={42} margin={{ top:5, right:5, left:-15, bottom:0 }}
                        data={[
                          { n:"Revenue",    v:data.revenue||data.monthlyRevenue||0 },
                          { n:"Expenses",   v:data.monthlyExpenses||0 },
                          { n:"Last Month", v:data.lastMonthRevenue||0 },
                        ].filter(d=>d.v>0)}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false}/>
                        <XAxis dataKey="n" tick={{ fill:"rgba(255,255,255,0.35)", fontSize:11 }} axisLine={false} tickLine={false}/>
                        <YAxis tick={{ fill:"rgba(255,255,255,0.2)", fontSize:9 }} axisLine={false} tickLine={false} tickFormatter={v=>`$${(v/1000).toFixed(0)}k`}/>
                        <Tooltip content={<TTip/>} cursor={{ fill:"rgba(255,255,255,0.02)" }}/>
                        <Bar dataKey="v" name="Amount" radius={[8,8,0,0]}>
                          {["#63ffb4","#f87171","#60a5fa"].map((c,i)=><Cell key={i} fill={c} fillOpacity={0.85}/>)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label:"Health Score", value:`${data.healthScore||0}/100`, color:rColor },
                    { label:"Growth Rate",  value:`${(data.growthRate||0).toFixed(1)}%`, color:"#63ffb4" },
                    { label:"Runway",       value:`${(data.runwayMonths||0).toFixed(1)} mo`, color:"#60a5fa" },
                    { label:"Risk Level",   value:data.riskLevel||"—", color:rColor },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="rounded-2xl border border-white/[0.07] bg-[#0d1117]/90 p-5 text-center space-y-1.5 hover:border-white/15 transition-colors">
                      <div className="text-[10px] text-white/28 tracking-widest uppercase font-mono">{label}</div>
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
                <div className="rounded-2xl border p-8 relative overflow-hidden"
                  style={{ background:rbg(data.riskLevel), borderColor:rbr(data.riskLevel) }}>
                  <div className="absolute right-8 top-1/2 -translate-y-1/2 text-[90px] font-black select-none font-mono pointer-events-none"
                    style={{ color:rColor, opacity:0.04 }}>{data.riskLevel}</div>
                  <div className="relative flex flex-col sm:flex-row items-start gap-5">
                    <div className="w-16 h-16 rounded-2xl border-2 flex items-center justify-center shrink-0"
                      style={{ borderColor:rbr(data.riskLevel), background:rbg(data.riskLevel), color:rColor }}>
                      <I.Shield s={26}/>
                    </div>
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-black tracking-widest uppercase px-4 py-1.5 rounded-full border font-mono"
                          style={{ color:rColor, borderColor:`${rColor}40`, background:`${rColor}15` }}>
                          {data.riskLevel} RISK
                        </span>
                        <span className="text-xs text-white/40 font-mono">{Math.round(conf*100)}% ML confidence</span>
                      </div>
                      <p className="text-sm text-white/70 leading-relaxed max-w-2xl">{data.riskInsight || "No risk insight available."}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { Icon:I.TrendUp, label:"Growth Insight", text:data.growthInsight,  color:"#63ffb4" },
                    { Icon:I.Clock,   label:"Runway Insight",  text:data.runwayInsight,  color:"#60a5fa" },
                    { Icon:I.Shield,  label:"Risk Analysis",   text:data.riskInsight,    color:rColor    },
                  ].map(({ Icon:Ic, label, text, color }) => (
                    <div key={label} className="rounded-2xl border border-white/[0.07] bg-[#0d1117]/90 p-5 space-y-3 hover:border-white/15 transition-colors"
                      style={{ borderLeftColor:color, borderLeftWidth:3 }}>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center border border-white/[0.07]"
                          style={{ color, background:`${color}10` }}><Ic s={15}/></div>
                        <span className="text-[10px] font-bold tracking-widest uppercase text-white/30 font-mono">{label}</span>
                      </div>
                      <p className="text-sm text-white/65 leading-relaxed">{text || "—"}</p>
                    </div>
                  ))}
                </div>

                {/* ML confidence breakdown */}
                <div className="rounded-2xl border border-white/[0.07] bg-[#0d1117]/90 p-6">
                  <div className="text-[10px] font-mono tracking-widest uppercase text-white/30 mb-5">ML Model Confidence Breakdown</div>
                  <div className="space-y-4">
                    {[
                      { label:"Risk Classification", value:conf,                  color:rColor    },
                      { label:"Growth Forecast",     value:Math.min(1,conf*0.93), color:"#63ffb4" },
                      { label:"Runway Estimate",     value:Math.min(1,conf*0.88), color:"#60a5fa" },
                      { label:"Funding Readiness",   value:Math.min(1,conf*0.82), color:"#a78bfa" },
                    ].map(({ label, value, color }) => {
                      const p = Math.round(value*100);
                      return (
                        <div key={label} className="space-y-1.5">
                          <div className="flex justify-between text-xs">
                            <span className="text-white/45">{label}</span>
                            <span className="font-black tabular-nums font-mono" style={{ color }}>{p}%</span>
                          </div>
                          <div className="h-2 rounded-full bg-white/[0.05] overflow-hidden">
                            <div className="h-full rounded-full" style={{ width:`${p}%`, background:`linear-gradient(90deg,${color}55,${color})`, transition:"width 1s ease" }}/>
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
                {[
                  { label:"Growth Rate", yours:data.growthRate||0, industry:iAvgG, unit:"%",   color:"#63ffb4" },
                  { label:"Cash Runway", yours:data.runwayMonths||0, industry:iAvgR, unit:" mo", color:"#60a5fa" },
                ].map(({ label, yours, industry, unit, color }) => {
                  const better = yours >= industry;
                  const c = better ? color : "#f87171";
                  const max = Math.max(yours, industry, 1);
                  return (
                    <div key={label} className="rounded-2xl border border-white/[0.07] bg-[#0d1117]/90 p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-[10px] font-mono tracking-widest uppercase text-white/30 mb-0.5">{label}</div>
                          <div className="text-lg font-black" style={{ color:c }}>
                            {yours.toFixed(1)}{unit}
                            <span className={`ml-3 text-xs font-bold px-2 py-0.5 rounded-full border ${better?"text-[#63ffb4] border-[#63ffb4]/25 bg-[#63ffb4]/8":"text-[#f87171] border-[#f87171]/25 bg-[#f87171]/8"}`}>
                              {better?"▲":"▼"} {Math.abs(yours-industry).toFixed(1)}{unit}
                            </span>
                          </div>
                        </div>
                        <div className="text-right text-xs text-white/30">
                          Industry avg: <span className="font-bold text-white/50">{industry.toFixed(1)}{unit}</span>
                        </div>
                      </div>
                      {[{ n:"Your Startup", val:yours, c },{ n:"Industry Avg", val:industry, c:"#60a5fa" }].map(({ n, val, c:bc }) => (
                        <div key={n} className="flex items-center gap-3">
                          <span className="text-xs text-white/35 w-24 text-right shrink-0">{n}</span>
                          <div className="flex-1 h-9 bg-white/[0.04] rounded-2xl overflow-hidden border border-white/[0.04]">
                            <div className="h-full rounded-2xl flex items-center justify-end pr-4"
                              style={{ width:`${Math.max((val/max)*100,4)}%`, background:`linear-gradient(90deg,${bc}50,${bc})`, transition:"width 0.8s ease" }}>
                              <span className="text-[11px] font-black text-[#080c10]">{val.toFixed(1)}{unit}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label:"Your Growth",    value:`${(data.growthRate||0).toFixed(1)}%`, color:(data.growthRate||0)>=iAvgG?"#63ffb4":"#f87171" },
                    { label:"Industry Growth",value:`${iAvgG.toFixed(1)}%`,                color:"#60a5fa" },
                    { label:"Your Runway",    value:`${(data.runwayMonths||0).toFixed(1)} mo`, color:(data.runwayMonths||0)>=iAvgR?"#63ffb4":"#f87171" },
                    { label:"Industry Runway",value:`${iAvgR.toFixed(1)} mo`,              color:"#60a5fa" },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="rounded-2xl border border-white/[0.07] bg-[#0d1117]/90 p-4 text-center space-y-1.5 hover:border-white/15 transition-colors">
                      <div className="text-[10px] text-white/28 tracking-widest uppercase font-mono">{label}</div>
                      <div className="text-2xl font-black tabular-nums" style={{ color }}>{value}</div>
                    </div>
                  ))}
                </div>

                <div className="rounded-2xl border border-[#60a5fa]/15 bg-[#60a5fa]/5 p-5 flex items-center gap-4">
                  <span className="text-[#60a5fa]"><I.Layers s={20}/></span>
                  <p className="text-sm text-white/50">
                    See the full benchmark with radar chart, leaderboard and action plan —{" "}
                    <button onClick={() => navigate("/benchmark")} className="text-[#60a5fa] font-semibold hover:text-white transition-colors">
                      Go to Benchmark page →
                    </button>
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}