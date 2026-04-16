import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { fetchDashboardApi } from "../api/api";
import {
  RadialBarChart, RadialBar, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Cell, AreaChart, Area, ReferenceLine,
  PieChart, Pie,
} from "recharts";

// ── Helpers ───────────────────────────────────────────────────────────────────
const rc  = (l) => ({ LOW:"#63ffb4", MEDIUM:"#fbbf24", HIGH:"#f87171" }[l] ?? "#fbbf24");
const rbg = (l) => ({ LOW:"rgba(99,255,180,0.07)", MEDIUM:"rgba(251,191,36,0.07)", HIGH:"rgba(248,113,113,0.07)" }[l] ?? "");
const rbd = (l) => ({ LOW:"rgba(99,255,180,0.22)", MEDIUM:"rgba(251,191,36,0.22)", HIGH:"rgba(248,113,113,0.22)" }[l] ?? "");

function Card({ children, className="", style={} }) {
  return <div className={`rounded-2xl border border-white/[0.07] bg-[#0d1117]/90 backdrop-blur-sm ${className}`} style={style}>{children}</div>;
}
function SLabel({ children }) {
  return <div className="text-[10px] font-bold tracking-[0.16em] uppercase text-white/30 mb-3">{children}</div>;
}
function TTip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0d1117] border border-white/10 rounded-xl px-3 py-2 text-xs shadow-xl">
      {label && <p className="text-white/40 mb-0.5">{label}</p>}
      <p className="font-black text-white">{payload[0]?.name ?? payload[0]?.dataKey}: {payload[0]?.value?.toLocaleString()}</p>
    </div>
  );
}
function Spinner() {
  return (
    <div className="flex flex-col items-center justify-center h-72 gap-4">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-2 border-[#63ffb4]/10"/>
        <div className="absolute inset-0 rounded-full border-t-2 border-[#63ffb4] animate-spin"/>
      </div>
      <span className="text-xs text-white/30 tracking-widest uppercase font-semibold">Loading ML insights…</span>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function HealthRing({ score }) {
  const color = score>=70?"#63ffb4":score>=40?"#fbbf24":"#f87171";
  const tag   = score>=70?"Healthy":score>=40?"Moderate":"Critical";
  return (
    <Card className="p-6 flex flex-col items-center justify-center relative overflow-hidden" style={{minHeight:220}}>
      <div className="absolute inset-0 rounded-2xl pointer-events-none" style={{background:`radial-gradient(circle at 50% 65%,${color}08 0%,transparent 70%)`}}/>
      <SLabel>Health Score</SLabel>
      <div className="relative w-40 h-40">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart cx="50%" cy="50%" innerRadius="68%" outerRadius="88%" startAngle={220} endAngle={-40} data={[{value:score??0,fill:color}]} barSize={12}>
            <RadialBar background={{fill:"rgba(255,255,255,0.04)",radius:10}} dataKey="value" cornerRadius={10} data={[{value:score??0,fill:color}]}/>
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-black tabular-nums" style={{color}}>{score??0}</span>
          <span className="text-[10px] text-white/25 tracking-widest">/100</span>
        </div>
      </div>
      <span className="mt-2 text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full border" style={{color,borderColor:`${color}40`,background:`${color}12`}}>{tag}</span>
    </Card>
  );
}

function RiskCard({ riskLevel, riskConfidence }) {
  const color = rc(riskLevel);
  const pct   = Math.round((riskConfidence??0)*100);
  const arcs  = [{name:"LOW",value:33,color:"#63ffb4"},{name:"MEDIUM",value:34,color:"#fbbf24"},{name:"HIGH",value:33,color:"#f87171"}];
  const needleDeg = {LOW:-62,MEDIUM:0,HIGH:62}[riskLevel]??0;
  return (
    <Card className="p-6 relative overflow-hidden" style={{minHeight:220}}>
      <div className="absolute inset-0 rounded-2xl pointer-events-none" style={{background:`radial-gradient(circle at 75% 25%,${color}07 0%,transparent 60%)`}}/>
      <SLabel>ML Risk Prediction</SLabel>
      <div className="flex gap-4 items-start">
        {/* Gauge */}
        <div className="relative shrink-0" style={{width:120,height:68}}>
          <ResponsiveContainer width="100%" height={136}>
            <PieChart>
              <Pie data={arcs} cx="50%" cy="100%" startAngle={180} endAngle={0} innerRadius={44} outerRadius={60} paddingAngle={2} dataKey="value" strokeWidth={0}>
                {arcs.map((a)=><Cell key={a.name} fill={a.name===riskLevel?a.color:`${a.color}20`}/>)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute bottom-0 left-1/2" style={{width:2,height:48,transformOrigin:"bottom center",transform:`translateX(-50%) rotate(${needleDeg}deg)`,background:color,borderRadius:2}}/>
          <div className="absolute bottom-0 left-1/2 w-2.5 h-2.5 rounded-full border-2 border-[#0d1117]" style={{transform:"translateX(-50%)",background:color}}/>
        </div>
        {/* Info */}
        <div className="flex-1 space-y-3 pt-1">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-sm font-black tracking-widest uppercase"
            style={{color,background:rbg(riskLevel),borderColor:rbd(riskLevel)}}>
            <span className={`w-2 h-2 rounded-full ${riskLevel==="HIGH"?"animate-ping":""}`} style={{background:color}}/>
            {riskLevel??"-"}
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-white/30">Confidence</span>
              <span className="font-black" style={{color}}>{pct}%</span>
            </div>
            <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
              <div className="h-full rounded-full transition-all duration-1000" style={{width:`${pct}%`,background:`linear-gradient(90deg,${color}70,${color})`}}/>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

function GrowthBar({ yourGrowth, industryAvg }) {
  const better = (yourGrowth??0) >= (industryAvg??0);
  const data = [
    {name:"Your Growth",  value:yourGrowth??0, color:better?"#63ffb4":"#f87171"},
    {name:"Industry Avg", value:industryAvg??0, color:"#60a5fa"},
  ];
  return (
    <Card className="p-6" style={{minHeight:220}}>
      <SLabel>Growth Rate vs Industry</SLabel>
      <ResponsiveContainer width="100%" height={145}>
        <BarChart data={data} barSize={34} margin={{top:4,right:4,left:-22,bottom:0}}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false}/>
          <XAxis dataKey="name" tick={{fill:"rgba(255,255,255,0.35)",fontSize:10}} axisLine={false} tickLine={false}/>
          <YAxis tick={{fill:"rgba(255,255,255,0.22)",fontSize:9}} axisLine={false} tickLine={false} tickFormatter={(v)=>`${v}%`}/>
          <Tooltip content={<TTip/>} cursor={{fill:"rgba(255,255,255,0.03)"}}/>
          <ReferenceLine y={industryAvg} stroke="rgba(96,165,250,0.25)" strokeDasharray="4 4"/>
          <Bar dataKey="value" radius={[8,8,0,0]}>
            {data.map((d,i)=><Cell key={i} fill={d.color} fillOpacity={0.85}/>)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="text-[10px] text-white/30 text-center mt-1">
        {better ? `▲ ${((yourGrowth??0)-(industryAvg??0)).toFixed(1)}% above industry` : `▼ ${((industryAvg??0)-(yourGrowth??0)).toFixed(1)}% below industry`}
      </div>
    </Card>
  );
}

function RunwayArea({ runwayMonths, industryAvg, monthlyExpenses }) {
  const est    = (runwayMonths??6)*(monthlyExpenses??10000);
  const months = Math.min(Math.ceil(runwayMonths??6)+1, 18);
  const data   = Array.from({length:months},(_,i)=>({m:`M${i}`,cash:Math.max(0,est-i*(monthlyExpenses??10000))}));
  return (
    <Card className="p-6" style={{minHeight:220}}>
      <SLabel>Cash Runway Projection</SLabel>
      <div className="flex items-baseline gap-2 mb-3">
        <span className="text-3xl font-black text-[#60a5fa]">{runwayMonths?.toFixed(1)}</span>
        <span className="text-sm text-white/30">months</span>
        <span className="ml-auto text-xs text-white/25">Industry: {industryAvg} mo</span>
      </div>
      <ResponsiveContainer width="100%" height={110}>
        <AreaChart data={data} margin={{top:2,right:4,left:-22,bottom:0}}>
          <defs>
            <linearGradient id="rg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#60a5fa" stopOpacity={0.22}/>
              <stop offset="95%" stopColor="#60a5fa" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false}/>
          <XAxis dataKey="m" tick={{fill:"rgba(255,255,255,0.22)",fontSize:9}} axisLine={false} tickLine={false}/>
          <YAxis tick={{fill:"rgba(255,255,255,0.18)",fontSize:8}} axisLine={false} tickLine={false} tickFormatter={(v)=>`$${(v/1000).toFixed(0)}k`}/>
          <Tooltip content={<TTip/>}/>
          <ReferenceLine y={est*0.2} stroke="rgba(248,113,113,0.35)" strokeDasharray="3 3"/>
          <Area type="monotone" dataKey="cash" stroke="#60a5fa" strokeWidth={2} fill="url(#rg)" dot={false}/>
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
}

function InsightCard({ icon, label, text, color }) {
  return (
    <div className="rounded-xl p-4 space-y-2 border border-white/[0.06] bg-white/[0.02]"
      style={{borderLeftColor:color,borderLeftWidth:3}}>
      <div className="flex items-center gap-2">
        <span>{icon}</span>
        <span className="text-[10px] font-bold tracking-[0.14em] uppercase text-white/35">{label}</span>
      </div>
      <p className="text-sm text-white/70 leading-relaxed">{text||"—"}</p>
    </div>
  );
}

function ActionBox({ icon, label, text, color }) {
  return (
    <Card className="p-5 space-y-2" style={{borderLeftColor:color,borderLeftWidth:3}}>
      <div className="flex items-center gap-2">
        <span className="text-lg">{icon}</span>
        <span className="text-[10px] font-bold tracking-[0.14em] uppercase" style={{color,opacity:0.7}}>{label}</span>
      </div>
      <p className="text-sm text-white/72 leading-relaxed">{text||"—"}</p>
    </Card>
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

  const startup = startups?.find((s) => String(s.id) === String(activeStartupId));

  const load = async (id) => {
    if (!id) return;
    setLoading(true); setError("");
    try {
      const res = await fetchDashboardApi(id);
      setData(res);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(activeStartupId); }, [activeStartupId]);

  const riskColor    = data ? rc(data.riskLevel)  : "#63ffb4";
  const iAvgG        = data?.industryAvgGrowth    ?? data?.industryAverageGrowth ?? 0;
  const iAvgR        = data?.industryAvgRunway    ?? data?.industryAverageRunway  ?? 0;
  const confidence   = data?.riskConfidence       ?? data?.confidence             ?? 0;
  const recommendation = data?.actionRecommendation ?? data?.recommendation       ?? "";

  const TABS = [
    {id:"overview",  label:"Overview"},
    {id:"insights",  label:"AI Insights"},
    {id:"benchmark", label:"Benchmark"},
  ];

  return (
    <div className="min-h-screen bg-[#080c10] pt-20 pb-16 px-4">
      <div className="fixed inset-0 bg-[linear-gradient(rgba(99,255,180,0.012)_1px,transparent_1px),linear-gradient(90deg,rgba(99,255,180,0.012)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none"/>
      {data && <div className="fixed top-0 left-0 right-0 h-[2px] pointer-events-none z-40" style={{background:`linear-gradient(90deg,transparent,${riskColor},transparent)`,opacity:0.5}}/>}

      <div className="relative max-w-6xl mx-auto space-y-6 animate-fadeIn">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#63ffb4]/20 bg-[#63ffb4]/5 text-[#63ffb4] text-xs font-mono tracking-widest">
                <span className="w-1.5 h-1.5 rounded-full bg-[#63ffb4] animate-pulse"/>
                LIVE ANALYTICS · STEP 2 OF 2
              </div>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white">
              {startup?.name ?? "Dashboard"}
            </h1>
            <p className="text-sm text-white/40 mt-0.5">
              {startup ? `${startup.industry} · ML-powered health monitoring` : "Select a startup from the navbar dropdown"}
            </p>
          </div>
          {data && (
            <div className="flex items-center gap-2 self-start sm:self-end">
              <a href="/create" className="px-4 py-2 rounded-xl bg-[#63ffb4]/10 border border-[#63ffb4]/20 text-xs text-[#63ffb4] hover:bg-[#63ffb4]/20 transition-all font-semibold">
                + New Startup
              </a>
              <button onClick={() => load(activeStartupId)} className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white/50 hover:text-white transition-all font-semibold">
                ↻ Refresh
              </button>
            </div>
          )}
        </div>

        {/* No startup */}
        {!activeStartupId && (
          <div className="rounded-2xl border border-dashed border-white/10 p-20 text-center space-y-4">
            <div className="text-5xl">🧠</div>
            <p className="text-white/40 text-sm">No startup selected. Create one to see your analytics.</p>
            <a href="/create" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#63ffb4] text-[#080c10] font-bold text-sm hover:bg-[#4dffa8] transition-all">
              🚀 Create Your Startup
            </a>
          </div>
        )}

        {activeStartupId && loading && <Spinner/>}

        {error && !loading && (
          <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400 flex items-center gap-2">
            ⚠ {error}
            <button onClick={() => load(activeStartupId)} className="ml-auto text-xs underline">Retry</button>
          </div>
        )}

        {data && !loading && (
          <>
            {/* Tabs */}
            <div className="flex gap-1 bg-white/[0.03] border border-white/[0.06] rounded-xl p-1 w-fit">
              {TABS.map((t) => (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${tab===t.id?"bg-[#63ffb4]/10 text-[#63ffb4] border border-[#63ffb4]/20":"text-white/40 hover:text-white/70"}`}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* ══ OVERVIEW ══ */}
            {tab === "overview" && (
              <div className="space-y-4">
                {/* 4-col grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <HealthRing score={data.healthScore}/>
                  <RiskCard riskLevel={data.riskLevel} riskConfidence={confidence}/>
                  <GrowthBar yourGrowth={data.growthRate} industryAvg={iAvgG}/>
                  <RunwayArea runwayMonths={data.runwayMonths} industryAvg={iAvgR} monthlyExpenses={data.monthlyExpenses??10000}/>
                </div>

                {/* KPI strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    {label:"Health Score",  value:`${data.healthScore}/100`,             color:data.healthScore>=70?"#63ffb4":"#fbbf24"},
                    {label:"Growth Rate",   value:`${(data.growthRate??0).toFixed(1)}%`, color:"#63ffb4"},
                    {label:"Runway",        value:`${(data.runwayMonths??0).toFixed(1)} mo`, color:"#60a5fa"},
                    {label:"Risk Level",    value:data.riskLevel,                        color:riskColor},
                  ].map(({label,value,color})=>(
                    <Card key={label} className="p-4 text-center space-y-1">
                      <div className="text-[10px] text-white/28 tracking-widest uppercase">{label}</div>
                      <div className="text-xl font-black tabular-nums" style={{color}}>{value}</div>
                    </Card>
                  ))}
                </div>

                {/* Recommendation + Funding */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <ActionBox icon="🎯" label="Action Recommendation" color="#63ffb4" text={recommendation}/>
                  <ActionBox icon="💰" label="Funding Suggestion"    color="#60a5fa" text={data.fundingSuggestion}/>
                </div>
              </div>
            )}

            {/* ══ AI INSIGHTS ══ */}
            {tab === "insights" && (
              <div className="space-y-4">
                {/* Risk banner */}
                <div className="rounded-2xl border p-6 relative overflow-hidden"
                  style={{background:rbg(data.riskLevel),borderColor:rbd(data.riskLevel)}}>
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 text-8xl font-black opacity-[0.04] select-none" style={{color:riskColor}}>{data.riskLevel}</div>
                  <div className="relative">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <span className="text-xs font-black tracking-[0.2em] uppercase px-3 py-1 rounded-full border"
                        style={{color:riskColor,borderColor:`${riskColor}40`,background:`${riskColor}15`}}>
                        {data.riskLevel} RISK
                      </span>
                      <span className="text-xs text-white/30">ML confidence: {Math.round(confidence*100)}%</span>
                    </div>
                    <p className="text-sm text-white/65 leading-relaxed max-w-xl">{data.riskInsight}</p>
                  </div>
                </div>

                {/* Three insight cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <InsightCard icon="📈" label="Growth Insight" text={data.growthInsight}  color="#63ffb4"/>
                  <InsightCard icon="🛤"  label="Runway Insight" text={data.runwayInsight}  color="#60a5fa"/>
                  <InsightCard icon="⚡"  label="Risk Insight"   text={data.riskInsight}    color={riskColor}/>
                </div>

                {/* Confidence bars */}
                <Card className="p-6">
                  <SLabel>ML Confidence Breakdown</SLabel>
                  <div className="space-y-4">
                    {[
                      {label:"Risk Classification", value:confidence,                    color:riskColor},
                      {label:"Growth Forecast",     value:Math.min(1,(confidence)*0.92), color:"#63ffb4"},
                      {label:"Runway Estimate",     value:Math.min(1,(confidence)*0.87), color:"#60a5fa"},
                    ].map(({label,value,color})=>{
                      const p = Math.round(value*100);
                      return (
                        <div key={label} className="space-y-1.5">
                          <div className="flex justify-between text-xs">
                            <span className="text-white/45">{label}</span>
                            <span className="font-black tabular-nums" style={{color}}>{p}%</span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-white/[0.06] overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-1000" style={{width:`${p}%`,background:`linear-gradient(90deg,${color}65,${color})`}}/>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <ActionBox icon="🎯" label="Action Recommendation" color="#63ffb4" text={recommendation}/>
                  <ActionBox icon="💰" label="Funding Suggestion"    color="#60a5fa" text={data.fundingSuggestion}/>
                </div>
              </div>
            )}

            {/* ══ BENCHMARK ══ */}
            {tab === "benchmark" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <GrowthBar yourGrowth={data.growthRate} industryAvg={iAvgG}/>
                  <RunwayArea runwayMonths={data.runwayMonths} industryAvg={iAvgR} monthlyExpenses={data.monthlyExpenses??10000}/>
                </div>

                {/* Compare table */}
                <Card className="p-6">
                  <SLabel>Industry Comparison</SLabel>
                  {[
                    {label:"Growth Rate", yours:data.growthRate??0,    industry:iAvgG, unit:"%"},
                    {label:"Runway",      yours:data.runwayMonths??0,  industry:iAvgR, unit:" mo"},
                  ].map(({label,yours,industry,unit})=>{
                    const better = yours>=industry;
                    const color  = better?"#63ffb4":"#f87171";
                    return (
                      <div key={label} className="flex items-center justify-between py-3 border-b border-white/[0.05] last:border-0">
                        <span className="text-sm text-white/50">{label}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-white tabular-nums">{yours.toFixed(1)}{unit}</span>
                          <span className="text-xs text-white/25">vs {industry.toFixed(1)}{unit}</span>
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full border tabular-nums"
                            style={{color,borderColor:`${color}30`,background:`${color}10`}}>
                            {better?"▲":"▼"} {Math.abs(yours-industry).toFixed(1)}{unit}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </Card>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}