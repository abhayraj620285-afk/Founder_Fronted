import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { fetchBenchmarkApi } from "../api/api";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
  ResponsiveContainer, Tooltip, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Cell,
  PieChart, Pie,
} from "recharts";

gsap.registerPlugin(ScrollTrigger);

// ── SVG Icons ─────────────────────────────────────────────────────────────────
const Ic = {
  TrendUp:  () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  TrendDn:  () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>,
  Clock:    () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  Award:    () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>,
  Bar:      () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  Radar:    () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"/><polygon points="12 7 17 10 17 15 12 18 7 15 7 10 12 7"/><circle cx="12" cy="12" r="1"/></svg>,
  Refresh:  () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>,
  Check:    () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  Warning:  () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  Info:     () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>,
};

function TTip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#080c10] border border-white/10 rounded-xl px-3 py-2.5 text-xs shadow-2xl">
      {label && <p className="text-white/40 mb-1.5 font-semibold">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} className="font-bold tabular-nums" style={{ color:p.color??p.stroke??"#fff" }}>
          {p.name}: {typeof p.value === "number" ? p.value.toFixed(1) : p.value}
        </p>
      ))}
    </div>
  );
}

function SL({ children, className="" }) {
  return <div className={`text-[10px] font-bold tracking-[0.18em] uppercase text-white/30 mb-3 ${className}`}>{children}</div>;
}

function Spinner() {
  return (
    <div className="flex flex-col items-center justify-center h-72 gap-4">
      <div className="relative w-14 h-14">
        <div className="absolute inset-0 rounded-full border-2 border-[#60a5fa]/10"/>
        <div className="absolute inset-0 rounded-full border-t-2 border-[#60a5fa] animate-spin"/>
        <div className="absolute inset-3 rounded-full border-t-2 border-[#63ffb4]/60 animate-spin" style={{ animationDirection:"reverse", animationDuration:"0.8s" }}/>
      </div>
      <p className="text-xs text-white/30 tracking-widest uppercase font-semibold animate-pulse">Loading benchmarks…</p>
    </div>
  );
}

// ── Performance score ring ────────────────────────────────────────────────────
function PerformanceRing({ score, label, color }) {
  const [displayed, setDisplayed] = useState(0);
  useEffect(() => {
    const steps = 60;
    const inc = score / steps;
    let cur = 0;
    const interval = setInterval(() => {
      cur += inc;
      if (cur >= score) { setDisplayed(score); clearInterval(interval); }
      else setDisplayed(Math.floor(cur));
    }, 1200 / steps);
    return () => clearInterval(interval);
  }, [score]);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-36 h-36">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={[{ v:score }, { v:100-score }]} dataKey="v" cx="50%" cy="50%"
              innerRadius={48} outerRadius={62} startAngle={90} endAngle={-270} strokeWidth={0}>
              <Cell fill={color}/>
              <Cell fill="rgba(255,255,255,0.04)"/>
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-black" style={{ color }}>{displayed}</span>
          <span className="text-[10px] text-white/25">/100</span>
        </div>
      </div>
      <div className="text-center">
        <div className="text-sm font-bold text-white">{label}</div>
        <div className="text-[10px] text-white/30 mt-0.5">Performance Score</div>
      </div>
    </div>
  );
}

// ── Animated compare bar ──────────────────────────────────────────────────────
function CompareBar({ label, yours, industry, unit, animate }) {
  const better = (yours??0) >= (industry??0);
  const color  = better ? "#63ffb4" : "#f87171";
  const max    = Math.max(yours??0, industry??0, 1);

  const barRef = useRef(null);
  useEffect(() => {
    if (!barRef.current || !animate) return;
    gsap.from(barRef.current.querySelectorAll(".bar-fill"), {
      width:0, duration:1.2, ease:"power3.out", stagger:0.15,
    });
  }, [animate]);

  return (
    <div ref={barRef} className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-white/75">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs font-black tabular-nums" style={{ color }}>
            {yours?.toFixed(1)}{unit}
          </span>
          <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${better?"text-[#63ffb4] border-[#63ffb4]/25 bg-[#63ffb4]/8":"text-[#f87171] border-[#f87171]/25 bg-[#f87171]/8"}`}>
            {better ? <Ic.Check/> : <Ic.Warning/>}
            {better ? "Above avg" : "Below avg"}
          </span>
        </div>
      </div>

      {[
        { label:"You",      val:yours??0,    color, pct:((yours??0)/max)*100 },
        { label:"Industry", val:industry??0, color:"#60a5fa", pct:((industry??0)/max)*100 },
      ].map(({ label:n, val, color:c, pct }) => (
        <div key={n} className="flex items-center gap-3">
          <span className="text-xs text-white/35 w-16 text-right shrink-0">{n}</span>
          <div className="flex-1 h-9 bg-white/[0.05] rounded-2xl overflow-hidden relative">
            <div className="bar-fill h-full rounded-2xl flex items-center justify-end pr-4 transition-none"
              style={{ width:`${Math.max(pct,4)}%`, background:`linear-gradient(90deg,${c}55,${c})` }}>
              <span className="text-[11px] font-black text-[#080c10] whitespace-nowrap">{val.toFixed(1)}{unit}</span>
            </div>
          </div>
        </div>
      ))}

      <div className="flex items-center gap-2 text-[10px] text-white/30">
        <div className="flex-1 h-px bg-white/[0.06]"/>
        <span>Delta: <span className="font-bold" style={{ color }}>
          {better?"+":""}{((yours??0)-(industry??0)).toFixed(1)}{unit}
        </span></span>
        <div className="flex-1 h-px bg-white/[0.06]"/>
      </div>
    </div>
  );
}

// ── Insight card ──────────────────────────────────────────────────────────────
function InsightCard({ icon:Ic2, title, text, color, good }) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-[#0d1117]/90 p-5 space-y-3 hover:border-white/15 transition-colors"
      style={{ borderLeftColor:color, borderLeftWidth:3 }}>
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center border border-white/[0.07]" style={{ color, background:`${color}10` }}><Ic2/></div>
        <span className="text-xs font-bold text-white">{title}</span>
        <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full border ${good?"text-[#63ffb4] border-[#63ffb4]/25 bg-[#63ffb4]/8":"text-[#fbbf24] border-[#fbbf24]/25 bg-[#fbbf24]/8"}`}>
          {good ? "✓ Strong" : "⚠ Monitor"}
        </span>
      </div>
      <p className="text-sm text-white/60 leading-relaxed">{text}</p>
    </div>
  );
}

// ── Main Benchmark ────────────────────────────────────────────────────────────
export default function Benchmark() {
  const { activeStartupId, startups } = useAuth();
  const toast = useToast();

  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [tab,     setTab]     = useState("compare");
  const [barsReady, setBarsReady] = useState(false);

  const pageRef = useRef(null);
  const heroRef = useRef(null);

  const startup = startups?.find((s) => String(s.id) === String(activeStartupId));

  const load = async (id) => {
    if (!id) return;
    setLoading(true); setError(""); setBarsReady(false);
    try {
      const res = await fetchBenchmarkApi(id);
      setData(res);
      setTimeout(() => setBarsReady(true), 300);
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
      gsap.from(".bm-title", { y:40, opacity:0, duration:0.8, ease:"power3.out" });
      gsap.from(".bm-sub",   { y:30, opacity:0, duration:0.8, delay:0.15, ease:"power3.out" });
      gsap.from(".bm-badge", { y:20, opacity:0, duration:0.6, delay:0.05, ease:"power3.out" });
    }, heroRef);
    return () => ctx.revert();
  }, []);

  // GSAP cards stagger when data loads
  useEffect(() => {
    if (!data || !pageRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(".bm-card", {
        y:35, opacity:0, duration:0.65, stagger:0.1, ease:"power3.out", delay:0.1,
        scrollTrigger:{ trigger:".bm-card", start:"top 92%" },
      });
    }, pageRef);
    return () => ctx.revert();
  }, [data]);

  // Derived
  const yourGrowth  = data?.yourGrowth         ?? 0;
  const indGrowth   = data?.industryAverageGrowth ?? 0;
  const yourRunway  = data?.yourRunway           ?? 0;
  const indRunway   = data?.industryAverageRunway ?? 0;

  const growthGood  = yourGrowth >= indGrowth;
  const runwayGood  = yourRunway >= indRunway;

  // Performance score (0–100)
  const perfScore = Math.min(100, Math.round(
    ((growthGood ? 60 : 30) + (runwayGood ? 40 : 20)) *
    (yourGrowth / Math.max(indGrowth, 1)) * 0.7 +
    Math.min(30, yourRunway * 2)
  ));

  // Radar data
  const radarData = data ? [
    { metric:"Growth",   You:yourGrowth, Industry:indGrowth },
    { metric:"Runway",   You:yourRunway, Industry:indRunway },
    { metric:"Efficiency", You: Math.min(100, yourGrowth * 4), Industry: Math.min(100, indGrowth * 4) },
    { metric:"Stability",  You: Math.min(100, yourRunway * 6), Industry: Math.min(100, indRunway * 6) },
  ] : [];

  // Leaderboard data (simulated peers)
  const leaderboard = data ? [
    { name:"Top Performer",     growth:indGrowth*1.8, runway:indRunway*1.4, color:"#63ffb4" },
    { name:"Your Startup",      growth:yourGrowth,    runway:yourRunway,    color:"#60a5fa", isYou:true },
    { name:"Industry Average",  growth:indGrowth,     runway:indRunway,     color:"#fbbf24" },
    { name:"Below Average",     growth:indGrowth*0.6, runway:indRunway*0.7, color:"#f87171" },
  ].sort((a, b) => b.growth - a.growth) : [];

  const TABS = [
    { id:"compare",    label:"Comparison"  },
    { id:"radar",      label:"Radar View"  },
    { id:"leaderboard",label:"Leaderboard" },
    { id:"insights",   label:"Insights"    },
  ];

  return (
    <div ref={pageRef} className="min-h-screen bg-[#080c10] pt-20 pb-20 px-4">

      {/* BG */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background:"linear-gradient(90deg,transparent,#60a5fa55,transparent)" }}/>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(96,165,250,0.012)_1px,transparent_1px),linear-gradient(90deg,rgba(96,165,250,0.012)_1px,transparent_1px)] bg-[size:60px_60px]"/>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 rounded-full bg-[#60a5fa]/4 blur-[130px] animate-glowPulse"/>
      </div>

      <div className="relative max-w-7xl mx-auto space-y-6">

        {/* ── HEADER ── */}
        <div ref={heroRef} className="flex flex-col lg:flex-row lg:items-end justify-between gap-5">
          <div>
            <div className="bm-badge inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#60a5fa]/20 bg-[#60a5fa]/5 text-[#60a5fa] text-xs font-mono tracking-widest mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#60a5fa] animate-pulse"/>
              INDUSTRY BENCHMARK
            </div>
            <h1 className="bm-title text-4xl font-black tracking-tight text-white">
              {startup?.name ? `${startup.name} vs Industry` : "Benchmark"}
            </h1>
            <p className="bm-sub text-sm text-white/40 mt-1">
              {startup?.industry ? `How your ${startup.industry} startup ranks against sector peers` : "Select a startup from the navbar"}
            </p>
          </div>
          {data && (
            <button onClick={() => load(activeStartupId)}
              className="self-start lg:self-end flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/50 text-xs font-semibold hover:text-white hover:border-white/20 transition-all">
              <Ic.Refresh/> Refresh
            </button>
          )}
        </div>

        {!activeStartupId && (
          <div className="rounded-2xl border border-dashed border-white/10 p-20 text-center">
            <p className="text-white/40 text-sm">Select a startup from the navbar to view benchmark data</p>
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
            {/* ── Summary row ── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Performance score */}
              <div className="bm-card rounded-2xl border border-white/[0.07] bg-[#0d1117]/90 p-6 flex flex-col items-center justify-center">
                <PerformanceRing
                  score={perfScore}
                  label={perfScore>=70?"Strong Performer":perfScore>=45?"On Track":"Needs Focus"}
                  color={perfScore>=70?"#63ffb4":perfScore>=45?"#fbbf24":"#f87171"}
                />
              </div>

              {/* Quick deltas */}
              <div className="bm-card sm:col-span-2 rounded-2xl border border-white/[0.07] bg-[#0d1117]/90 p-6">
                <SL>Performance Summary</SL>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label:"Growth Rate",   yours:yourGrowth, industry:indGrowth, unit:"%" },
                    { label:"Runway",        yours:yourRunway, industry:indRunway, unit:" mo" },
                    { label:"Growth Delta",  value:(yourGrowth-indGrowth).toFixed(1)+"%", good:growthGood },
                    { label:"Runway Delta",  value:(yourRunway-indRunway).toFixed(1)+" mo", good:runwayGood },
                  ].map(({ label, yours, industry, unit, value, good }) => (
                    <div key={label} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-1">
                      <div className="text-[10px] text-white/30 tracking-widest uppercase">{label}</div>
                      {value !== undefined ? (
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-black" style={{ color:good?"#63ffb4":"#f87171" }}>{value}</span>
                          <span className={`text-[10px] font-bold ${good?"text-[#63ffb4]":"text-[#f87171]"}`}>{good?"▲ Better":"▼ Lower"}</span>
                        </div>
                      ) : (
                        <div className="flex items-baseline gap-2">
                          <span className="text-lg font-black text-white">{yours?.toFixed(1)}{unit}</span>
                          <span className="text-xs text-white/30">vs {industry?.toFixed(1)}{unit}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Verdict */}
                {data.performance && (
                  <div className={`mt-4 flex items-center gap-3 rounded-xl border px-4 py-3 ${growthGood&&runwayGood?"border-[#63ffb4]/20 bg-[#63ffb4]/5":"border-[#fbbf24]/20 bg-[#fbbf24]/5"}`}>
                    <span className="text-xl">{growthGood&&runwayGood?"🚀":"📊"}</span>
                    <div>
                      <div className="text-[10px] text-white/30 uppercase tracking-widest mb-0.5">Overall Verdict</div>
                      <p className="text-sm font-semibold" style={{ color:growthGood&&runwayGood?"#63ffb4":"#fbbf24" }}>{data.performance}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── Tabs ── */}
            <div className="flex gap-1 bg-white/[0.03] border border-white/[0.06] rounded-xl p-1 w-fit">
              {TABS.map((t) => (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all ${tab===t.id?"bg-[#60a5fa]/10 text-[#60a5fa] border border-[#60a5fa]/20":"text-white/40 hover:text-white/70"}`}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* ══ COMPARISON ══ */}
            {tab === "compare" && (
              <div className="space-y-5 animate-fadeIn">
                {/* Legend */}
                <div className="flex items-center gap-6">
                  {[{ color:"#63ffb4",label:"Your Startup" },{ color:"#60a5fa",label:"Industry Average" }].map(({ color, label }) => (
                    <div key={label} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-sm" style={{ background:color }}/>
                      <span className="text-xs text-white/50 font-semibold">{label}</span>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <div className="bm-card rounded-2xl border border-white/[0.07] bg-[#0d1117]/90 p-6 space-y-6">
                    <CompareBar label="Growth Rate" yours={yourGrowth} industry={indGrowth} unit="%" animate={barsReady}/>
                    <div className="h-px bg-white/[0.05]"/>
                    <CompareBar label="Cash Runway" yours={yourRunway} industry={indRunway} unit=" mo" animate={barsReady}/>
                  </div>

                  {/* Bar chart */}
                  <div className="bm-card rounded-2xl border border-white/[0.07] bg-[#0d1117]/90 p-6">
                    <SL>Side-by-side Comparison</SL>
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={[
                        { name:"Growth (%)", You:yourGrowth, Industry:indGrowth },
                        { name:"Runway (mo)", You:yourRunway, Industry:indRunway },
                      ]} barSize={28} margin={{ top:5, right:5, left:-15, bottom:0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false}/>
                        <XAxis dataKey="name" tick={{ fill:"rgba(255,255,255,0.35)", fontSize:11 }} axisLine={false} tickLine={false}/>
                        <YAxis tick={{ fill:"rgba(255,255,255,0.2)", fontSize:9 }} axisLine={false} tickLine={false}/>
                        <Tooltip content={<TTip/>} cursor={{ fill:"rgba(255,255,255,0.03)" }}/>
                        <Bar dataKey="You" name="You" fill="#63ffb4" fillOpacity={0.85} radius={[6,6,0,0]}/>
                        <Bar dataKey="Industry" name="Industry" fill="#60a5fa" fillOpacity={0.65} radius={[6,6,0,0]}/>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {/* ══ RADAR ══ */}
            {tab === "radar" && (
              <div className="space-y-5 animate-fadeIn">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <div className="bm-card rounded-2xl border border-white/[0.07] bg-[#0d1117]/90 p-6">
                    <SL>Multi-dimensional Radar</SL>
                    <ResponsiveContainer width="100%" height={320}>
                      <RadarChart data={radarData}>
                        <PolarGrid stroke="rgba(255,255,255,0.07)" gridType="circle"/>
                        <PolarAngleAxis dataKey="metric" tick={{ fill:"rgba(255,255,255,0.45)", fontSize:11, fontWeight:600 }}/>
                        <Tooltip content={<TTip/>}/>
                        <Radar name="You"      dataKey="You"      stroke="#63ffb4" fill="#63ffb4" fillOpacity={0.18} strokeWidth={2.5}/>
                        <Radar name="Industry" dataKey="Industry" stroke="#60a5fa" fill="#60a5fa" fillOpacity={0.10} strokeWidth={2}/>
                      </RadarChart>
                    </ResponsiveContainer>
                    <div className="flex justify-center gap-6 mt-2">
                      {[{ color:"#63ffb4", label:"You" },{ color:"#60a5fa", label:"Industry" }].map(({ color, label }) => (
                        <div key={label} className="flex items-center gap-2 text-xs text-white/40">
                          <div className="w-3 h-1 rounded-full" style={{ background:color }}/>
                          {label}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Dimension breakdown */}
                  <div className="bm-card rounded-2xl border border-white/[0.07] bg-[#0d1117]/90 p-6">
                    <SL>Dimension Scores</SL>
                    <div className="space-y-4">
                      {radarData.map(({ metric, You, Industry }) => {
                        const good = You >= Industry;
                        const color = good ? "#63ffb4" : "#f87171";
                        const max = Math.max(You, Industry, 1);
                        return (
                          <div key={metric} className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-white/50 font-semibold">{metric}</span>
                              <div className="flex items-center gap-2">
                                <span className="font-black tabular-nums" style={{ color }}>{You.toFixed(1)}</span>
                                <span className="text-white/25">vs {Industry.toFixed(1)}</span>
                                <span className={`text-[10px] font-bold ${good?"text-[#63ffb4]":"text-[#f87171]"}`}>{good?"▲":"▼"}</span>
                              </div>
                            </div>
                            <div className="flex gap-1.5">
                              <div className="flex-1 h-2 bg-white/[0.06] rounded-full overflow-hidden">
                                <div className="h-full rounded-full" style={{ width:`${(You/max)*100}%`, background:color }}/>
                              </div>
                              <div className="flex-1 h-2 bg-white/[0.06] rounded-full overflow-hidden">
                                <div className="h-full rounded-full bg-[#60a5fa]" style={{ width:`${(Industry/max)*100}%` }}/>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Score summary */}
                    <div className="mt-6 pt-5 border-t border-white/[0.06] flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center border border-white/[0.07]" style={{ color:"#60a5fa", background:"rgba(96,165,250,0.08)" }}>
                        <Ic.Radar/>
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white">
                          {radarData.filter(d=>d.You>=d.Industry).length} of {radarData.length} dimensions above average
                        </div>
                        <div className="text-xs text-white/35">across Growth, Runway, Efficiency and Stability</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ══ LEADERBOARD ══ */}
            {tab === "leaderboard" && (
              <div className="space-y-5 animate-fadeIn">
                <div className="bm-card rounded-2xl border border-white/[0.07] bg-[#0d1117]/90 overflow-hidden">
                  <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
                    <SL className="mb-0">Growth Rate Leaderboard</SL>
                    <div className="flex items-center gap-2 text-xs text-white/25">
                      <Ic.Info/> Simulated peer positions
                    </div>
                  </div>
                  {leaderboard.map((item, i) => (
                    <div key={item.name}
                      className={`flex items-center gap-5 px-6 py-5 border-b border-white/[0.04] last:border-0 transition-colors ${item.isYou?"bg-[#63ffb4]/4 hover:bg-[#63ffb4]/6":"hover:bg-white/[0.02]"}`}>
                      {/* Rank */}
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black shrink-0 border ${item.isYou?"border-[#63ffb4]/30 bg-[#63ffb4]/10 text-[#63ffb4]":"border-white/[0.07] bg-white/[0.03] text-white/40"}`}>
                        {i+1}
                      </div>

                      {/* Name */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-bold ${item.isYou?"text-white":"text-white/65"}`}>{item.name}</span>
                          {item.isYou && (
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full border border-[#63ffb4]/30 bg-[#63ffb4]/10 text-[#63ffb4]">YOU</span>
                          )}
                        </div>
                        <div className="text-[10px] text-white/25 mt-0.5">Runway: {item.runway.toFixed(1)} mo</div>
                      </div>

                      {/* Growth bar */}
                      <div className="flex items-center gap-3 flex-1 max-w-[180px]">
                        <div className="flex-1 h-2.5 bg-white/[0.05] rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width:`${(item.growth/leaderboard[0].growth)*100}%`, background:item.color }}/>
                        </div>
                        <span className="text-sm font-black tabular-nums w-12 text-right shrink-0" style={{ color:item.color }}>
                          {item.growth.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Award card */}
                <div className={`bm-card rounded-2xl border p-6 flex items-center gap-5 ${growthGood&&runwayGood?"border-[#63ffb4]/20 bg-[#63ffb4]/5":"border-[#fbbf24]/20 bg-[#fbbf24]/5"}`}>
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border text-2xl shrink-0 ${growthGood&&runwayGood?"border-[#63ffb4]/25 bg-[#63ffb4]/10 text-[#63ffb4]":"border-[#fbbf24]/25 bg-[#fbbf24]/10 text-[#fbbf24]"}`}>
                    <Ic.Award/>
                  </div>
                  <div>
                    <div className="text-sm font-black text-white mb-1">
                      {growthGood && runwayGood ? "Above Average Performer" : growthGood ? "Growth Leader" : runwayGood ? "Runway Stable" : "Room for Improvement"}
                    </div>
                    <p className="text-xs text-white/45 leading-relaxed">
                      {growthGood && runwayGood
                        ? "Your startup outperforms the industry average on both growth rate and runway — a strong signal for investors."
                        : growthGood
                        ? "Strong growth rate, but runway is below average. Consider extending your cash position before the next raise."
                        : runwayGood
                        ? "Good runway stability, but growth rate needs acceleration. Review your acquisition and retention strategy."
                        : "Both metrics are below industry average. Focus on either reducing burn or accelerating growth before fundraising."}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ══ INSIGHTS ══ */}
            {tab === "insights" && (
              <div className="space-y-4 animate-fadeIn">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InsightCard icon={Ic.TrendUp} title="Growth Rate Analysis"
                    color={growthGood?"#63ffb4":"#f87171"} good={growthGood}
                    text={growthGood
                      ? `Your growth rate of ${yourGrowth.toFixed(1)}% outperforms the ${startup?.industry??""} industry average of ${indGrowth.toFixed(1)}% by ${(yourGrowth-indGrowth).toFixed(1)} percentage points. This positions you in the top tier of your sector. Maintain your current acquisition strategy and double down on what's driving this momentum.`
                      : `Your growth rate of ${yourGrowth.toFixed(1)}% is ${(indGrowth-yourGrowth).toFixed(1)}pp below the industry average of ${indGrowth.toFixed(1)}%. This is a signal to review your go-to-market strategy. Consider whether pricing, positioning, or channel mix adjustments could close this gap within the next quarter.`}
                  />
                  <InsightCard icon={Ic.Clock} title="Runway Analysis"
                    color={runwayGood?"#60a5fa":"#f87171"} good={runwayGood}
                    text={runwayGood
                      ? `Your runway of ${yourRunway.toFixed(1)} months exceeds the industry average of ${indRunway.toFixed(1)} months, giving you more time to hit milestones before needing to raise. This is a competitive advantage — use the additional time to improve your metrics and negotiate from a position of strength.`
                      : `Your runway of ${yourRunway.toFixed(1)} months is below the industry average of ${indRunway.toFixed(1)} months. This signals potential cash pressure ahead. We recommend beginning fundraising conversations within the next 4–6 weeks, or implementing cost optimisation to extend your runway by at least 3 months.`}
                  />
                </div>

                {/* Action items */}
                <div className="bm-card rounded-2xl border border-white/[0.07] bg-[#0d1117]/90 p-6">
                  <SL>Recommended Actions Based on Benchmark</SL>
                  <div className="space-y-3">
                    {[
                      growthGood
                        ? { color:"#63ffb4", icon:Ic.Check, text:"Continue current growth strategy — you're outperforming industry peers." }
                        : { color:"#fbbf24", icon:Ic.Warning, text:`Close the ${(indGrowth-yourGrowth).toFixed(1)}pp growth gap — review acquisition channel efficiency and conversion rates.` },
                      runwayGood
                        ? { color:"#63ffb4", icon:Ic.Check, text:"Runway is healthy — use this buffer to optimise product and strengthen investor narrative." }
                        : { color:"#f87171", icon:Ic.Warning, text:`Runway is ${(indRunway-yourRunway).toFixed(1)} months below average — start fundraising conversations or cut burn by 15–20%.` },
                      { color:"#60a5fa", icon:Ic.Info,    text:"Share this benchmark report in your next investor update to contextualise your performance data." },
                      { color:"#a78bfa", icon:Ic.Bar,     text:"Return weekly — benchmarks update with every refresh, tracking your trajectory over time." },
                    ].map(({ color, icon:Ic2, text }, i) => (
                      <div key={i} className="flex items-start gap-3 p-3.5 rounded-xl border border-white/[0.05] bg-white/[0.02]">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 border border-white/[0.07]" style={{ color, background:`${color}10` }}>
                          <Ic2/>
                        </div>
                        <p className="text-sm text-white/60 leading-relaxed">{text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}