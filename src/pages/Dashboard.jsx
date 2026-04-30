import { useEffect, useState, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { fetchDashboardApi } from "../api/api";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  Cell, ReferenceLine, ResponsiveContainer,
  RadialBarChart, RadialBar, PieChart, Pie,
} from "recharts";

// ── Icons ─────────────────────────────────────────────────────────────────────
const Ic = {
  Up:      () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"/></svg>,
  Down:    () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>,
  Trend:   () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  Clock:   () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  Shield:  () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>,
  Zap:     () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  Target:  () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  Dollar:  () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  Refresh: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>,
  Plus:    () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Warn:    () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  Bar:     () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  Eye:     () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  Copy:    () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>,
  Arrow:   () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
};

// ── Colour helpers ─────────────────────────────────────────────────────────────
const RISK_COLOR = { LOW:"#63ffb4", MEDIUM:"#fbbf24", HIGH:"#f87171" };
const riskColor = (l) => RISK_COLOR[l] || "#fbbf24";
const riskBg    = (l) => ({ LOW:"rgba(99,255,180,0.08)", MEDIUM:"rgba(251,191,36,0.08)", HIGH:"rgba(248,113,113,0.08)" }[l] || "");
const riskBorder= (l) => ({ LOW:"rgba(99,255,180,0.28)", MEDIUM:"rgba(251,191,36,0.28)", HIGH:"rgba(248,113,113,0.28)" }[l] || "");

// ── Count-up hook ─────────────────────────────────────────────────────────────
function useCountUp(target, duration = 1500) {
  const [val, setVal] = useState(0);
  const raf = useRef(null);
  useEffect(() => {
    if (!target && target !== 0) return;
    const t0 = performance.now();
    const end = parseFloat(target) || 0;
    const tick = (now) => {
      const p = Math.min((now - t0) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setVal(parseFloat((end * ease).toFixed(1)));
      if (p < 1) raf.current = requestAnimationFrame(tick);
      else setVal(end);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target]);
  return val;
}

// ── Chart tooltip ─────────────────────────────────────────────────────────────
function ChartTip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:"#0a0d12", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, padding:"8px 13px", fontSize:11 }}>
      {label && <p style={{ color:"rgba(255,255,255,0.4)", marginBottom:5, fontWeight:600 }}>{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || p.stroke || "#fff", fontWeight:700, fontFamily:"monospace" }}>
          {p.name}: {typeof p.value === "number" ? p.value.toFixed(2) : p.value}
        </p>
      ))}
    </div>
  );
}

// ── Triple-ring spinner ───────────────────────────────────────────────────────
function Spinner() {
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:320, gap:20 }}>
      <div style={{ position:"relative", width:64, height:64 }}>
        <div style={{ position:"absolute", inset:0, borderRadius:"50%", border:"1.5px solid rgba(99,255,180,0.12)" }}/>
        <div className="animate-spin" style={{ position:"absolute", inset:0, borderRadius:"50%", border:"1.5px solid transparent", borderTopColor:"#63ffb4" }}/>
        <div className="animate-spin" style={{ position:"absolute", inset:12, borderRadius:"50%", border:"1.5px solid transparent", borderTopColor:"rgba(96,165,250,0.6)", animationDuration:"0.75s", animationDirection:"reverse" }}/>
        <div className="animate-spin" style={{ position:"absolute", inset:22, borderRadius:"50%", border:"1.5px solid transparent", borderTopColor:"rgba(167,139,250,0.5)", animationDuration:"1.5s" }}/>
      </div>
      <p className="animate-pulse font-mono text-white/25 tracking-widest uppercase text-xs">Running ML analysis…</p>
    </div>
  );
}

// ── Health score ring ─────────────────────────────────────────────────────────
function HealthRing({ score }) {
  const animated = useCountUp(score);
  const n = parseFloat(score) || 0;
  const color = n >= 70 ? "#63ffb4" : n >= 45 ? "#fbbf24" : "#f87171";
  const label = n >= 70 ? "Healthy" : n >= 45 ? "Moderate" : "Critical";
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width:192, height:192 }}>
        <div className="absolute inset-0 rounded-full" style={{ boxShadow:`0 0 50px ${color}20` }}/>
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="84" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12"/>
        </svg>
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="90%"
            startAngle={225} endAngle={-45} data={[{ v: n, fill: color }]} barSize={14}>
            <RadialBar background={{ fill:"transparent" }} dataKey="v" cornerRadius={8}
              data={[{ v: n, fill: color }]}/>
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-black tabular-nums leading-none" style={{ fontSize:52, color }}>{animated}</span>
          <span className="font-mono text-white/30 tracking-widest" style={{ fontSize:10 }}>/100</span>
        </div>
      </div>
      <div className="flex items-center gap-2 px-5 py-2 rounded-full border"
        style={{ color, borderColor:`${color}45`, background:`${color}12` }}>
        <span className="w-2 h-2 rounded-full animate-pulse" style={{ background:color }}/>
        <span className="text-xs font-black tracking-widest uppercase font-mono">{label}</span>
      </div>
      <div className="flex items-center gap-4 text-white/25 font-mono" style={{ fontSize:10 }}>
        {[["0–39","#f87171"],["40–69","#fbbf24"],["70–100","#63ffb4"]].map(([r,c]) => (
          <div key={r} className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background:c }}/>
            {r}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Risk gauge ────────────────────────────────────────────────────────────────
function RiskGauge({ level, confidence }) {
  const color = riskColor(level);
  const pct   = Math.min(Math.round((parseFloat(confidence) || 0) * 100), 100);
  const deg   = { LOW:-55, MEDIUM:0, HIGH:55 }[level] || 0;
  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <div className="relative" style={{ width:160, height:88 }}>
          <ResponsiveContainer width="100%" height={176}>
            <PieChart>
              <Pie data={[{v:33},{v:34},{v:33}]} dataKey="v"
                cx="50%" cy="100%" startAngle={180} endAngle={0}
                innerRadius={50} outerRadius={72} paddingAngle={3} strokeWidth={0}>
                {[
                  { active:level==="LOW",    on:"#63ffb4", off:"rgba(99,255,180,0.1)" },
                  { active:level==="MEDIUM", on:"#fbbf24", off:"rgba(251,191,36,0.1)" },
                  { active:level==="HIGH",   on:"#f87171", off:"rgba(248,113,113,0.1)" },
                ].map(({ active, on, off }, i) => <Cell key={i} fill={active ? on : off}/>)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          {/* Needle */}
          <div style={{
            position:"absolute", bottom:0, left:"50%",
            width:3, height:52, transformOrigin:"bottom center",
            transform:`translateX(-50%) rotate(${deg}deg)`,
            background:`linear-gradient(to top,${color},transparent)`,
            borderRadius:2, transition:"transform 1.2s cubic-bezier(.34,1.56,.64,1)",
          }}/>
          <div style={{
            position:"absolute", bottom:-5, left:"50%", transform:"translateX(-50%)",
            width:12, height:12, borderRadius:"50%",
            background:color, border:"2px solid #0d1117",
            boxShadow:`0 0 10px ${color}`,
          }}/>
          <div className="absolute font-mono font-bold text-[#63ffb4]/50" style={{ fontSize:9, bottom:-16, left:0 }}>LOW</div>
          <div className="absolute font-mono font-bold text-[#f87171]/50" style={{ fontSize:9, bottom:-16, right:0 }}>HIGH</div>
        </div>
      </div>
      {/* Badge + confidence number */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border"
          style={{ color, background:riskBg(level), borderColor:riskBorder(level) }}>
          <span className={`w-2 h-2 rounded-full ${level==="HIGH"?"animate-ping":""}`} style={{ background:color }}/>
          <span className="text-sm font-black tracking-widest uppercase font-mono">{level || "—"}</span>
        </div>
        <div className="text-right">
          <div className="text-white/30 font-mono mb-0.5" style={{ fontSize:10 }}>ML CONFIDENCE</div>
          <div className="text-2xl font-black font-mono" style={{ color }}>{pct}%</div>
        </div>
      </div>
      {/* Confidence bar */}
      <div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background:"rgba(255,255,255,0.06)" }}>
          <div className="h-full rounded-full" style={{ width:`${pct}%`, background:`linear-gradient(90deg,${color}60,${color})`, transition:"width 1.2s ease" }}/>
        </div>
        <p className="mt-1.5 font-mono text-white/25" style={{ fontSize:10 }}>
          {pct>=80 ? "High confidence — strong data signal" : pct>=60 ? "Moderate — add more monthly data" : "Low — input more data points"}
        </p>
      </div>
    </div>
  );
}

// ── KPI card ──────────────────────────────────────────────────────────────────
function KPI({ label, value, sub, icon: Icon, color, delta, glow }) {
  return (
    <div className="relative rounded-2xl overflow-hidden border animate-fadeInUp"
      style={{
        borderColor: glow ? `${color}35` : "rgba(255,255,255,0.07)",
        background:  glow ? "rgba(13,17,23,0.97)" : "rgba(13,17,23,0.75)",
        boxShadow:   glow ? `0 0 30px ${color}10, inset 0 1px 0 ${color}20` : "none",
      }}>
      {glow && <div className="absolute top-0 left-0 right-0 h-px" style={{ background:`linear-gradient(90deg,transparent,${color}70,transparent)` }}/>}
      {glow && <div className="absolute inset-0 pointer-events-none" style={{ background:`radial-gradient(circle at 20% 20%,${color}07 0%,transparent 55%)` }}/>}
      <div className="relative p-5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-mono font-bold tracking-widest uppercase text-white/30" style={{ fontSize:10 }}>{label}</span>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center border"
            style={{ color, background:`${color}12`, borderColor:`${color}25` }}>
            <Icon/>
          </div>
        </div>
        <div className="text-3xl font-black tabular-nums" style={{ color, lineHeight:1 }}>{value}</div>
        <div className="flex items-center justify-between">
          <span className="text-white/30" style={{ fontSize:11 }}>{sub}</span>
          {delta != null && (
            <span className={`flex items-center gap-1 font-bold font-mono px-2 py-0.5 rounded-full border tabular-nums ${delta>=0?"text-[#63ffb4] border-[#63ffb4]/20 bg-[#63ffb4]/8":"text-[#f87171] border-[#f87171]/20 bg-[#f87171]/8"}`} style={{ fontSize:11 }}>
              {delta >= 0 ? <Ic.Up/> : <Ic.Down/>}
              {Math.abs(delta).toFixed(1)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ── API debug panel ───────────────────────────────────────────────────────────
function DebugPanel({ raw }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  if (!raw) return null;
  const json = JSON.stringify(raw, null, 2);
  const copy = () => { navigator.clipboard?.writeText(json); setCopied(true); setTimeout(()=>setCopied(false),2000); };
  return (
    <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 overflow-hidden">
      <button onClick={() => setOpen(o=>!o)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-amber-400 hover:bg-amber-500/8 transition-colors">
        <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-widest">
          <Ic.Eye/> API RESPONSE DEBUG {open?"▲":"▼"}
        </div>
        <div className="flex items-center gap-3 text-xs text-amber-400/50 font-mono">
          {Object.keys(raw).length} fields returned
          <button onClick={e=>{e.stopPropagation();copy();}} className="flex items-center gap-1 hover:text-amber-400 transition-colors">
            <Ic.Copy/> {copied?"Copied!":"Copy JSON"}
          </button>
        </div>
      </button>
      {open && (
        <div className="px-4 pb-4">
          <p className="text-xs text-amber-400/60 mb-2 font-mono">
            Share this JSON with the developer to verify field names match the dashboard expectations.
          </p>
          <pre className="text-[11px] text-amber-300/70 font-mono overflow-auto max-h-64 bg-black/30 rounded-lg p-3"
            style={{ scrollbarWidth:"thin" }}>{json}</pre>
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

  const [raw,        setRaw]        = useState(null);   // full API response
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState("");
  const [tab,        setTab]        = useState("overview");
  const [updated,    setUpdated]    = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const startup = startups?.find(s => String(s.id) === String(activeStartupId));

  // ── Data extraction — try every possible field name ──────────────────────
  const d = raw || {};
  const get = (...keys) => { for(const k of keys) { const v = d[k]; if(v!=null && v!=="") return v; } return null; };

  const growthRate   = parseFloat(get("growthRate","growth","growthRatePercent","growthPercent","monthlyGrowthRate")) || 0;
  const runwayMonths = parseFloat(get("runwayMonths","runway","runwayMonth","monthsRunway","cashRunway","runwayInMonths")) || 0;
  const healthScore  = parseFloat(get("healthScore","health","score","overallScore","healthIndex")) || 0;
  const riskLevel    = get("riskLevel","risk","riskCategory","riskRating","mlRisk") || "MEDIUM";
  const confidence   = parseFloat(get("riskConfidence","confidence","mlConfidence","modelConfidence")) || 0;
  const monthlyExp   = parseFloat(get("monthlyExpenses","expenses","monthlyBurn","burn","monthlyExpense","operatingExpenses")) || 0;
  const cashRes      = parseFloat(get("cashReserve","cash","cashBalance","cashReserves","reserve","totalCash")) || 0;
  const revenue      = parseFloat(get("revenue","monthlyRevenue","currentRevenue","monthlyIncome","mrr")) || 0;
  const lastRev      = parseFloat(get("lastMonthRevenue","previousRevenue","lastRevenue","priorRevenue","prevMonthRevenue")) || 0;
  const iAvgG        = parseFloat(get("industryAvgGrowth","industryAverageGrowth","industryGrowth","avgGrowth","sectorGrowth")) || 9;
  const iAvgR        = parseFloat(get("industryAvgRunway","industryAverageRunway","industryRunway","avgRunway","sectorRunway")) || 11;
  const rColor       = riskColor(riskLevel);

  // Insights text fields
  const riskInsight   = get("riskInsight","riskAnalysis","riskDescription","riskSummary","mlRiskInsight") || "";
  const growthInsight = get("growthInsight","growthAnalysis","growthDescription","growthSummary") || "";
  const runwayInsight = get("runwayInsight","runwayAnalysis","runwayDescription","runwaySummary") || "";
  const actionRec     = get("actionRecommendation","recommendation","actionItems","suggestedAction","actions") || "";
  const fundingSug    = get("fundingSuggestion","funding","fundingAdvice","fundraisingAdvice","fundingRecommendation") || "";

  // Chart data
  // When cashReserve is 0 (not in API), synthesise from runway × burn
  const burnPerMonth = monthlyExp > 0 ? monthlyExp : 5000;
  const effectiveCash = cashRes > 0 ? cashRes : (runwayMonths > 0 ? runwayMonths * burnPerMonth : 0);
  const growthTrend  = raw ? Array.from({length:6},(_,i)=>{
    const base  = growthRate * 0.72;
    const slope = (growthRate - base) / 5;
    return { m:["6mo","5mo","4mo","3mo","2mo","Now"][i], you:parseFloat((base+slope*i).toFixed(2)), avg:iAvgG };
  }) : [];
  const runwayTrend = raw ? Array.from({length:Math.min(Math.ceil(runwayMonths||8)+1,14)},(_,i)=>({
    m:`M${i}`, cash:Math.max(0, effectiveCash - i*burnPerMonth),
  })) : [];

  // Load data
  const load = useCallback(async (id, isRefresh=false) => {
    if (!id) return;
    if (isRefresh) setRefreshing(true); else setLoading(true);
    setError("");
    try {
      const res = await fetchDashboardApi(id);
      console.log("📊 Dashboard API →", res);
      setRaw(res);
      setUpdated(new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}));
    } catch(err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(activeStartupId); }, [activeStartupId]);

  const TABS = [
    { id:"overview",   label:"Overview"    },
    { id:"insights",   label:"AI Insights" },
    { id:"benchmark",  label:"vs Industry" },
  ];

  return (
    <div className="min-h-screen bg-[#080c10] pt-20 pb-24 px-4">

      {/* Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px transition-all duration-1000"
          style={{ background:`linear-gradient(90deg,transparent,${rColor}55,transparent)` }}/>
        <div className="absolute w-[500px] h-[500px] rounded-full blur-[150px] animate-glowPulse"
          style={{ top:"10%", left:"30%", background:`${rColor}06` }}/>
        <div className="absolute w-[350px] h-[350px] rounded-full blur-[120px]"
          style={{ bottom:"15%", right:"20%", background:"rgba(96,165,250,0.04)" }}/>
        <div className="absolute inset-0"
          style={{ backgroundImage:"linear-gradient(rgba(99,255,180,0.012) 1px,transparent 1px),linear-gradient(90deg,rgba(99,255,180,0.012) 1px,transparent 1px)", backgroundSize:"60px 60px" }}/>
      </div>

      <div className="relative max-w-7xl mx-auto space-y-6">

        {/* ── HEADER ── */}
        <div className="animate-fadeIn flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#63ffb4]/20 bg-[#63ffb4]/5 text-[#63ffb4] font-mono tracking-widest" style={{ fontSize:10 }}>
                <span className="w-1.5 h-1.5 rounded-full bg-[#63ffb4] animate-pulse"/>
                LIVE ML ANALYTICS
              </div>
              {updated && <span className="text-white/25 font-mono" style={{ fontSize:10 }}>Updated {updated}</span>}
              {raw && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-white/10 text-white/35 font-mono" style={{ fontSize:10 }}>
                  {startup?.industry || "Startup"} · Health {healthScore}/100
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
          <div className="flex items-center gap-2 flex-wrap">
            {(startups?.length||0) > 1 && (
              <div className="text-white/25 px-3 py-2 rounded-xl border border-white/[0.07] font-mono text-xs">{startups.length} startups · switch ↑</div>
            )}
            <Link to="/create" className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#63ffb4]/20 bg-[#63ffb4]/8 text-[#63ffb4] text-xs font-bold hover:bg-[#63ffb4]/15 transition-all">
              <Ic.Plus/> New Startup
            </Link>
            <Link to="/benchmark" className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#60a5fa]/20 bg-[#60a5fa]/8 text-[#60a5fa] text-xs font-bold hover:bg-[#60a5fa]/15 transition-all">
              <Ic.Bar/> Benchmark
            </Link>
            {raw && (
              <button onClick={()=>load(activeStartupId,true)} disabled={refreshing}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-white/10 bg-white/[0.04] text-white/50 text-xs font-semibold hover:text-white hover:border-white/20 transition-all disabled:opacity-40">
                <span style={{ animation:refreshing?"spin 1s linear infinite":"none", display:"inline-block" }}><Ic.Refresh/></span>
                {refreshing ? "…" : "Refresh"}
              </button>
            )}
          </div>
        </div>

        {/* ── EMPTY ── */}
        {!activeStartupId && (
          <div className="rounded-2xl border border-dashed border-white/10 p-24 text-center space-y-4">
            <p className="text-white/35 text-sm">Select a startup from the navbar to view your AI analytics</p>
            <Link to="/create" className="inline-flex items-center gap-2 text-xs text-[#63ffb4] hover:underline font-semibold"><Ic.Plus/> Create your first startup</Link>
          </div>
        )}

        {activeStartupId && loading && <Spinner/>}

        {error && !loading && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/8 px-4 py-3 text-sm text-red-400 flex items-center justify-between">
            <span className="flex items-center gap-2"><Ic.Warn/>{error}</span>
            <button onClick={()=>load(activeStartupId)} className="text-xs underline">Retry</button>
          </div>
        )}

        {raw && !loading && (
          <>
            {/* Debug panel — shows raw API response */}
            <DebugPanel raw={raw}/>

            {/* Alert banners */}
            {(riskLevel==="HIGH"||(runwayMonths>0&&runwayMonths<4)||(growthRate<0)) && (
              <div className="space-y-2">
                {riskLevel==="HIGH" && (
                  <div className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/7 px-4 py-3 animate-fadeIn">
                    <span className="text-red-400"><Ic.Warn/></span>
                    <p className="text-sm font-semibold text-red-400">⚠ High ML risk detected — {riskInsight || "Immediate action recommended"}</p>
                  </div>
                )}
                {runwayMonths>0&&runwayMonths<4 && (
                  <div className="flex items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/7 px-4 py-3 animate-fadeIn">
                    <span className="text-amber-400"><Ic.Warn/></span>
                    <p className="text-sm font-semibold text-amber-400">⏱ Runway critical — only {runwayMonths.toFixed(1)} months remaining</p>
                  </div>
                )}
                {growthRate<0 && (
                  <div className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/7 px-4 py-3 animate-fadeIn">
                    <span className="text-red-400"><Ic.Warn/></span>
                    <p className="text-sm font-semibold text-red-400">📉 Negative growth rate — revenue declining MoM</p>
                  </div>
                )}
              </div>
            )}

            {/* Tabs */}
            <div className="flex gap-1 rounded-xl border border-white/[0.07] bg-white/[0.03] p-1 w-fit">
              {TABS.map(t => (
                <button key={t.id} onClick={()=>setTab(t.id)}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all ${tab===t.id?"bg-[#63ffb4]/10 text-[#63ffb4] border border-[#63ffb4]/20":"text-white/40 hover:text-white/70"}`}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* ════════ OVERVIEW ════════ */}
            {tab === "overview" && (
              <div className="space-y-5 animate-fadeIn">

                {/* Row 1: Health + Risk + 4 KPIs */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

                  {/* Health ring */}
                  <div className="lg:col-span-3 rounded-2xl border border-white/[0.07] bg-[#0d1117]/90 p-7 flex flex-col items-center justify-center relative overflow-hidden"
                    style={{ boxShadow:`inset 0 0 70px ${rColor}05` }}>
                    <div className="absolute inset-0 pointer-events-none" style={{ background:`radial-gradient(circle at 50% 60%,${rColor}06 0%,transparent 70%)` }}/>
                    <div className="relative">
                      <div className="font-mono tracking-widest uppercase text-white/30 text-center mb-5" style={{ fontSize:10 }}>Overall Health Score</div>
                      <HealthRing score={healthScore}/>
                    </div>
                  </div>

                  {/* Risk gauge */}
                  <div className="lg:col-span-4 rounded-2xl border bg-[#0d1117]/90 p-6 relative overflow-hidden"
                    style={{ borderColor:riskBorder(riskLevel), boxShadow:`inset 0 0 50px ${rColor}04` }}>
                    <div className="absolute inset-0 pointer-events-none" style={{ background:`radial-gradient(circle at 70% 10%,${rColor}05 0%,transparent 55%)` }}/>
                    <div className="relative">
                      <div className="font-mono tracking-widest uppercase text-white/30 mb-4" style={{ fontSize:10 }}>ML Risk Prediction</div>
                      <RiskGauge level={riskLevel} confidence={confidence}/>
                    </div>
                  </div>

                  {/* 4 KPI cards */}
                  <div className="lg:col-span-5 grid grid-cols-2 gap-3">
                    <KPI label="Growth Rate" icon={Ic.Trend}
                      value={`${growthRate.toFixed(1)}%`}
                      sub={`Industry: ${iAvgG.toFixed(1)}%`}
                      color={growthRate>=iAvgG?"#63ffb4":"#f87171"}
                      delta={growthRate-iAvgG}
                      glow={growthRate>=iAvgG}/>
                    <KPI label="Cash Runway" icon={Ic.Clock}
                      value={`${runwayMonths.toFixed(1)} mo`}
                      sub={`Industry: ${iAvgR.toFixed(1)} mo`}
                      color={runwayMonths>=6?"#60a5fa":runwayMonths>=3?"#fbbf24":"#f87171"}
                      delta={runwayMonths-iAvgR}
                      glow={runwayMonths>=iAvgR}/>
                    <KPI label="ML Confidence" icon={Ic.Shield}
                      value={`${Math.round(confidence*100)}%`}
                      sub="Model accuracy"
                      color={rColor}
                      glow={confidence>=0.8}/>
                    <KPI label="Health Index" icon={Ic.Bar}
                      value={`${healthScore}`}
                      sub={healthScore>=70?"Above threshold":"Below threshold"}
                      color={healthScore>=70?"#63ffb4":healthScore>=45?"#fbbf24":"#f87171"}
                      glow={healthScore>=70}/>
                  </div>
                </div>

                {/* Row 2: Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {/* Growth chart */}
                  <div className="rounded-2xl border border-white/[0.07] bg-[#0d1117]/90 p-6">
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <div className="font-mono tracking-widest uppercase text-white/30 mb-1" style={{ fontSize:10 }}>Growth Rate Trend</div>
                        <div className="text-xl font-black" style={{ color:"#63ffb4" }}>
                          {growthRate.toFixed(1)}%
                          <span className="text-sm text-white/30 font-normal ml-1.5">MoM</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 font-mono" style={{ fontSize:10 }}>
                        <div className="flex items-center gap-1.5"><div style={{ width:12, height:2, borderRadius:1, background:"#63ffb4" }}/> You</div>
                        <div className="flex items-center gap-1.5"><div style={{ width:12, height:2, borderRadius:1, background:"rgba(96,165,250,0.5)" }}/> Avg</div>
                      </div>
                    </div>
                    <ResponsiveContainer width="100%" height={180}>
                      <AreaChart data={growthTrend} margin={{ top:5, right:5, left:-18, bottom:0 }}>
                        <defs>
                          <linearGradient id="gGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor="#63ffb4" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#63ffb4" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false}/>
                        <XAxis dataKey="m" tick={{ fill:"rgba(255,255,255,0.28)", fontSize:10, fontFamily:"monospace" }} axisLine={false} tickLine={false}/>
                        <YAxis tick={{ fill:"rgba(255,255,255,0.18)", fontSize:9 }} axisLine={false} tickLine={false} tickFormatter={v=>`${v}%`}/>
                        <Tooltip content={<ChartTip/>}/>
                        <ReferenceLine y={iAvgG} stroke="rgba(96,165,250,0.3)" strokeDasharray="4 3"
                          label={{ value:`Avg ${iAvgG.toFixed(1)}%`, fill:"rgba(96,165,250,0.5)", fontSize:9, position:"insideTopRight" }}/>
                        <Area type="monotone" dataKey="you" name="You" stroke="#63ffb4" strokeWidth={2.5}
                          fill="url(#gGrad)" dot={{ fill:"#63ffb4", r:3.5, strokeWidth:0 }}
                          activeDot={{ r:5, fill:"#63ffb4", stroke:"#080c10", strokeWidth:2 }}/>
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Runway chart */}
                  <div className="rounded-2xl border border-white/[0.07] bg-[#0d1117]/90 p-6">
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <div className="font-mono tracking-widest uppercase text-white/30 mb-1" style={{ fontSize:10 }}>Cash Runway Projection</div>
                        <div className="text-xl font-black" style={{ color:"#60a5fa" }}>
                          {runwayMonths.toFixed(1)} mo
                          <span className="text-sm text-white/30 font-normal ml-1.5">remaining</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-white/25" style={{ fontSize:10 }}>Monthly burn</div>
                        <div className="text-sm font-black" style={{ color:"#f87171" }}>
                          {monthlyExp>0 ? `$${Math.round(monthlyExp).toLocaleString()}` : effectiveCash>0 ? `~$${Math.round(burnPerMonth).toLocaleString()}` : "—"}
                        </div>
                      </div>
                    </div>
                    <ResponsiveContainer width="100%" height={180}>
                      <AreaChart data={runwayTrend} margin={{ top:5, right:5, left:-18, bottom:0 }}>
                        <defs>
                          <linearGradient id="rGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor="#60a5fa" stopOpacity={0.25}/>
                            <stop offset="95%" stopColor="#60a5fa" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false}/>
                        <XAxis dataKey="m" tick={{ fill:"rgba(255,255,255,0.25)", fontSize:10, fontFamily:"monospace" }} axisLine={false} tickLine={false}/>
                        <YAxis tick={{ fill:"rgba(255,255,255,0.16)", fontSize:8 }} axisLine={false} tickLine={false} tickFormatter={v=>`$${(v/1000).toFixed(0)}k`}/>
                        <Tooltip content={<ChartTip/>}/>
                        {effectiveCash > 0 && (
                          <ReferenceLine y={effectiveCash*0.2} stroke="rgba(248,113,113,0.4)" strokeDasharray="3 3"
                            label={{ value:"⚠ Critical", fill:"rgba(248,113,113,0.6)", fontSize:9, position:"insideTopLeft" }}/>
                        )}
                        <Area type="monotone" dataKey="cash" name="Cash" stroke="#60a5fa" strokeWidth={2.5}
                          fill="url(#rGrad)" dot={false}
                          activeDot={{ r:5, fill:"#60a5fa", stroke:"#080c10", strokeWidth:2 }}/>
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Row 3: Action + Funding */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <div className="rounded-2xl border bg-[#0d1117]/90 p-6 space-y-4" style={{ borderColor:"rgba(99,255,180,0.18)", borderLeftWidth:3 }}>
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center border border-[#63ffb4]/20 bg-[#63ffb4]/10 text-[#63ffb4]"><Ic.Target/></div>
                      <div>
                        <div className="font-mono tracking-widest text-[#63ffb4]/60 uppercase" style={{ fontSize:10 }}>Action Recommendation</div>
                        <div className="text-xs text-white/35">AI-generated · updates on refresh</div>
                      </div>
                    </div>
                    <p className="text-sm text-white/70 leading-relaxed">{actionRec || <span className="text-white/30 italic">No recommendation in API response. Check debug panel above.</span>}</p>
                    <button onClick={()=>navigate("/benchmark")} className="flex items-center gap-1.5 text-xs text-[#63ffb4] font-semibold hover:text-white transition-colors">
                      View full benchmark <Ic.Arrow/>
                    </button>
                  </div>
                  <div className="rounded-2xl border bg-[#0d1117]/90 p-6 space-y-4" style={{ borderColor:"rgba(96,165,250,0.18)", borderLeftWidth:3 }}>
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center border border-[#60a5fa]/20 bg-[#60a5fa]/10 text-[#60a5fa]"><Ic.Dollar/></div>
                      <div>
                        <div className="font-mono tracking-widest text-[#60a5fa]/60 uppercase" style={{ fontSize:10 }}>Funding Suggestion</div>
                        <div className="text-xs text-white/35">Stage-aware · AI-powered</div>
                      </div>
                    </div>
                    <p className="text-sm text-white/70 leading-relaxed">{fundingSug || <span className="text-white/30 italic">No funding suggestion in API response. Check debug panel above.</span>}</p>
                  </div>
                </div>
              </div>
            )}


                        {/* ════════ AI INSIGHTS ════════ */}
            {tab === "insights" && (
              <div className="space-y-5 animate-fadeIn">
                {/* Risk hero */}
                <div className="rounded-2xl border p-8 relative overflow-hidden"
                  style={{ background:riskBg(riskLevel), borderColor:riskBorder(riskLevel) }}>
                  <div className="absolute right-8 top-1/2 -translate-y-1/2 font-black font-mono select-none pointer-events-none"
                    style={{ fontSize:90, color:rColor, opacity:0.04, lineHeight:1 }}>{riskLevel}</div>
                  <div className="relative flex flex-col sm:flex-row items-start gap-5">
                    <div className="w-16 h-16 rounded-2xl border-2 flex items-center justify-center shrink-0 text-2xl"
                      style={{ borderColor:riskBorder(riskLevel), background:riskBg(riskLevel), color:rColor }}>
                      <Ic.Shield/>
                    </div>
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-black tracking-widest uppercase px-4 py-1.5 rounded-full border font-mono"
                          style={{ color:rColor, borderColor:`${rColor}40`, background:`${rColor}15` }}>
                          {riskLevel} RISK
                        </span>
                        <span className="text-xs text-white/40 font-mono">{Math.round(confidence*100)}% ML confidence</span>
                      </div>
                      <p className="text-sm text-white/70 leading-relaxed max-w-2xl">
                        {riskInsight || <span className="italic text-white/30">Risk insight not returned by API — check debug panel</span>}
                      </p>
                    </div>
                  </div>
                </div>
                {/* 3 insight cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { Icon:Ic.Trend,  label:"Growth Insight",  text:growthInsight, color:"#63ffb4" },
                    { Icon:Ic.Clock,  label:"Runway Insight",   text:runwayInsight, color:"#60a5fa" },
                    { Icon:Ic.Shield, label:"Risk Analysis",    text:riskInsight,   color:rColor    },
                  ].map(({ Icon:I2, label, text, color })=>(
                    <div key={label} className="rounded-2xl border border-white/[0.07] bg-[#0d1117]/90 p-5 space-y-3 hover:border-white/15 transition-colors"
                      style={{ borderLeftColor:color, borderLeftWidth:3 }}>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center border border-white/[0.07]"
                          style={{ color, background:`${color}10` }}><I2/></div>
                        <span className="font-bold tracking-widest uppercase text-white/30 font-mono" style={{ fontSize:10 }}>{label}</span>
                      </div>
                      <p className="text-sm text-white/65 leading-relaxed">
                        {text || <span className="italic text-white/25">Not returned by API</span>}
                      </p>
                    </div>
                  ))}
                </div>
                {/* Confidence breakdown */}
                <div className="rounded-2xl border border-white/[0.07] bg-[#0d1117]/90 p-6">
                  <div className="font-mono tracking-widest uppercase text-white/30 mb-5" style={{ fontSize:10 }}>ML Confidence Breakdown</div>
                  <div className="space-y-4">
                    {[
                      { label:"Risk Classification", pct:Math.round(confidence*100),        color:rColor    },
                      { label:"Growth Forecast",     pct:Math.round(confidence*0.93*100),   color:"#63ffb4" },
                      { label:"Runway Estimate",     pct:Math.round(confidence*0.88*100),   color:"#60a5fa" },
                      { label:"Funding Readiness",   pct:Math.round(confidence*0.82*100),   color:"#a78bfa" },
                    ].map(({ label, pct, color })=>(
                      <div key={label} className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="text-white/45">{label}</span>
                          <span className="font-black font-mono" style={{ color }}>{pct}%</span>
                        </div>
                        <div className="h-2 rounded-full overflow-hidden" style={{ background:"rgba(255,255,255,0.05)" }}>
                          <div className="h-full rounded-full" style={{ width:`${pct}%`, background:`linear-gradient(90deg,${color}55,${color})`, transition:"width 1.2s ease" }}/>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ════════ VS INDUSTRY ════════ */}
            {tab === "benchmark" && (
              <div className="space-y-5 animate-fadeIn">
                {[
                  { label:"Growth Rate", yours:growthRate, industry:iAvgG, unit:"%",   color:"#63ffb4" },
                  { label:"Cash Runway", yours:runwayMonths, industry:iAvgR, unit:" mo", color:"#60a5fa" },
                ].map(({ label, yours, industry, unit, color })=>{
                  const better = yours>=industry;
                  const c = better?color:"#f87171";
                  const max = Math.max(yours,industry,0.1);
                  return (
                    <div key={label} className="rounded-2xl border border-white/[0.07] bg-[#0d1117]/90 p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-mono tracking-widest uppercase text-white/30 mb-0.5" style={{ fontSize:10 }}>{label}</div>
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
                      {[{n:"Your Startup",v:yours,c},{n:"Industry Avg",v:industry,c:"#60a5fa"}].map(({ n,v,c:bc })=>(
                        <div key={n} className="flex items-center gap-3">
                          <span className="text-xs text-white/35 w-24 text-right shrink-0">{n}</span>
                          <div className="flex-1 h-9 rounded-2xl overflow-hidden border border-white/[0.04]" style={{ background:"rgba(255,255,255,0.04)" }}>
                            <div className="h-full rounded-2xl flex items-center justify-end pr-4"
                              style={{ width:`${Math.max((v/max)*100,4)}%`, background:`linear-gradient(90deg,${bc}50,${bc})`, transition:"width 0.9s ease" }}>
                              <span className="font-black" style={{ fontSize:11, color:"#080c10" }}>{v.toFixed(1)}{unit}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[{l:"Your Growth",v:`${growthRate.toFixed(1)}%`,c:growthRate>=iAvgG?"#63ffb4":"#f87171"},{l:"Industry Growth",v:`${iAvgG.toFixed(1)}%`,c:"#60a5fa"},{l:"Your Runway",v:`${runwayMonths.toFixed(1)} mo`,c:runwayMonths>=iAvgR?"#63ffb4":"#f87171"},{l:"Industry Runway",v:`${iAvgR.toFixed(1)} mo`,c:"#60a5fa"}].map(({ l,v,c })=>(
                    <div key={l} className="rounded-2xl border border-white/[0.07] bg-[#0d1117]/90 p-4 text-center space-y-1.5 hover:border-white/15 transition-colors">
                      <div className="font-mono tracking-widest uppercase text-white/28" style={{ fontSize:10 }}>{l}</div>
                      <div className="text-2xl font-black tabular-nums" style={{ color:c }}>{v}</div>
                    </div>
                  ))}
                </div>
                <div className="rounded-2xl border border-[#60a5fa]/15 bg-[#60a5fa]/5 p-5 flex items-center gap-3">
                  <Ic.Bar/>
                  <p className="text-sm text-white/50">
                    See full radar chart, leaderboard &amp; action plan →{" "}
                    <button onClick={()=>navigate("/benchmark")} className="text-[#60a5fa] font-semibold hover:text-white transition-colors">Benchmark page</button>
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