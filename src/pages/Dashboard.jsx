import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useDashboard } from "../hooks/useApi";
import { useEffect, useState } from "react";
import {
  RadialBarChart, RadialBar, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  AreaChart, Area, PieChart, Pie, Cell,
  ReferenceLine,
} from "recharts";

// ── Color helpers ─────────────────────────────────────────────────────────────
const riskColor  = (l) => ({ LOW:"#63ffb4", MEDIUM:"#fbbf24", HIGH:"#f87171" }[l] ?? "#fbbf24");
const riskBg     = (l) => ({ LOW:"rgba(99,255,180,0.07)", MEDIUM:"rgba(251,191,36,0.07)", HIGH:"rgba(248,113,113,0.07)" }[l] ?? "");
const riskBorder = (l) => ({ LOW:"rgba(99,255,180,0.22)", MEDIUM:"rgba(251,191,36,0.22)", HIGH:"rgba(248,113,113,0.22)" }[l] ?? "");

// ── Tiny reusables ────────────────────────────────────────────────────────────
function Card({ children, className = "", style = {} }) {
  return (
    <div className={`rounded-2xl border border-white/[0.07] bg-[#0d1117]/90 backdrop-blur-sm ${className}`} style={style}>
      {children}
    </div>
  );
}
function Label({ children }) {
  return <div className="text-[10px] font-bold tracking-[0.18em] uppercase text-white/30 mb-3">{children}</div>;
}
function TTip({ active, payload, label, unit = "" }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0d1117] border border-white/10 rounded-xl px-3 py-2 text-xs shadow-xl">
      {label && <p className="text-white/40 mb-0.5">{label}</p>}
      <p className="font-black text-white">{payload[0]?.name ?? payload[0]?.dataKey}: {payload[0]?.value?.toLocaleString()}{unit}</p>
    </div>
  );
}

// ── Health Score Ring ─────────────────────────────────────────────────────────
function HealthRing({ score }) {
  const color = score >= 70 ? "#63ffb4" : score >= 40 ? "#fbbf24" : "#f87171";
  const tag   = score >= 70 ? "Healthy" : score >= 40 ? "Moderate" : "Critical";
  const data  = [{ value: score ?? 0, fill: color }];
  return (
    <Card className="p-6 flex flex-col items-center justify-center relative overflow-hidden" style={{ minHeight: 230 }}>
      <div className="absolute inset-0 rounded-2xl pointer-events-none" style={{ background: `radial-gradient(circle at 50% 65%, ${color}09 0%, transparent 70%)` }} />
      <Label>Health Score</Label>
      <div className="relative w-44 h-44">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart cx="50%" cy="50%" innerRadius="68%" outerRadius="88%" startAngle={220} endAngle={-40} data={data} barSize={13}>
            <RadialBar background={{ fill: "rgba(255,255,255,0.04)", radius: 10 }} dataKey="value" cornerRadius={10} data={data} />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-black tabular-nums" style={{ color }}>{score ?? "—"}</span>
          <span className="text-[10px] text-white/25 tracking-widest">/100</span>
        </div>
      </div>
      <span className="mt-3 text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full border" style={{ color, borderColor:`${color}40`, background:`${color}12` }}>
        {tag}
      </span>
    </Card>
  );
}

// ── ML Risk Prediction Card ───────────────────────────────────────────────────
function RiskCard({ riskLevel, confidence }) {
  const color  = riskColor(riskLevel);
  const pct    = Math.round((confidence ?? 0) * 100);
  // Semicircle gauge via PieChart
  const arcs = [
    { name:"LOW",    value:33, color:"#63ffb4" },
    { name:"MEDIUM", value:34, color:"#fbbf24" },
    { name:"HIGH",   value:33, color:"#f87171" },
  ];
  // Needle angle: LOW→0°, MEDIUM→90°, HIGH→180° mapped from -90..90
  const needleDeg = { LOW:-62, MEDIUM:0, HIGH:62 }[riskLevel] ?? 0;

  return (
    <Card className="p-6 relative overflow-hidden" style={{ minHeight: 230 }}>
      <div className="absolute inset-0 rounded-2xl pointer-events-none" style={{ background:`radial-gradient(circle at 75% 25%, ${color}07 0%, transparent 60%)` }} />
      <Label>ML Risk Prediction</Label>
      <div className="flex gap-5 items-start">
        {/* Gauge */}
        <div className="relative shrink-0" style={{ width:130, height:75 }}>
          <ResponsiveContainer width="100%" height={150}>
            <PieChart>
              <Pie data={arcs} cx="50%" cy="100%" startAngle={180} endAngle={0} innerRadius={48} outerRadius={64} paddingAngle={2} dataKey="value" strokeWidth={0}>
                {arcs.map((a) => (
                  <Cell key={a.name} fill={a.name === riskLevel ? a.color : `${a.color}20`} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          {/* Needle */}
          <div className="absolute bottom-0 left-1/2" style={{ width:2, height:52, transformOrigin:"bottom center", transform:`translateX(-50%) rotate(${needleDeg}deg)`, background:color, borderRadius:2 }} />
          <div className="absolute bottom-0 left-1/2 w-3 h-3 rounded-full border-2 border-[#0d1117]" style={{ transform:"translateX(-50%)", background:color }} />
          <div className="absolute bottom-[-4px] left-0 text-[8px] font-bold text-emerald-400/50">L</div>
          <div className="absolute bottom-[-4px] right-0 text-[8px] font-bold text-red-400/50">H</div>
        </div>

        {/* Info */}
        <div className="flex-1 space-y-3">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-sm font-black tracking-widest uppercase"
            style={{ color, background:riskBg(riskLevel), borderColor:riskBorder(riskLevel) }}
          >
            <span className={`w-2 h-2 rounded-full ${riskLevel==="HIGH"?"animate-ping":""}`} style={{ background:color }} />
            {riskLevel ?? "—"}
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-white/30">Model Confidence</span>
              <span className="font-black" style={{ color }}>{pct}%</span>
            </div>
            <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
              <div className="h-full rounded-full transition-all duration-1000" style={{ width:`${pct}%`, background:`linear-gradient(90deg,${color}70,${color})` }} />
            </div>
            <p className="text-[10px] text-white/20">
              {pct>=80 ? "High confidence" : pct>=60 ? "Moderate confidence" : "Low confidence"}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}

// ── Growth Bar Chart ──────────────────────────────────────────────────────────
function GrowthBar({ yourGrowth, industryAvg }) {
  const better = (yourGrowth ?? 0) >= (industryAvg ?? 0);
  const data = [
    { name:"Your Growth",  value: yourGrowth ?? 0,  color: better ? "#63ffb4" : "#f87171" },
    { name:"Industry Avg", value: industryAvg ?? 0, color: "#60a5fa" },
  ];
  return (
    <Card className="p-6" style={{ minHeight: 230 }}>
      <Label>Growth Rate vs Industry</Label>
      <ResponsiveContainer width="100%" height={155}>
        <BarChart data={data} barSize={36} margin={{ top:4, right:4, left:-22, bottom:0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
          <XAxis dataKey="name" tick={{ fill:"rgba(255,255,255,0.35)", fontSize:10 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill:"rgba(255,255,255,0.22)", fontSize:9 }} axisLine={false} tickLine={false} tickFormatter={(v)=>`${v}%`} />
          <Tooltip content={<TTip unit="%" />} cursor={{ fill:"rgba(255,255,255,0.03)" }} />
          <ReferenceLine y={industryAvg} stroke="rgba(96,165,250,0.25)" strokeDasharray="4 4" />
          <Bar dataKey="value" radius={[8,8,0,0]}>
            {data.map((d,i)=><Cell key={i} fill={d.color} fillOpacity={0.85} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="text-[10px] text-white/30 text-center">
        {better ? `▲ ${((yourGrowth??0)-(industryAvg??0)).toFixed(1)}% above industry` : `▼ ${((industryAvg??0)-(yourGrowth??0)).toFixed(1)}% below industry`}
      </div>
    </Card>
  );
}

// ── Runway Area Chart ─────────────────────────────────────────────────────────
function RunwayArea({ runwayMonths, industryAvg, monthlyExpenses }) {
  const estimated = (runwayMonths ?? 6) * (monthlyExpenses ?? 10000);
  const months    = Math.ceil(runwayMonths ?? 6) + 1;
  const data = Array.from({ length: months }, (_, i) => ({
    m: `M${i}`,
    cash: Math.max(0, estimated - i * (monthlyExpenses ?? 10000)),
  }));
  return (
    <Card className="p-6" style={{ minHeight: 230 }}>
      <Label>Cash Runway Projection</Label>
      <div className="flex items-baseline gap-2 mb-3">
        <span className="text-3xl font-black text-[#60a5fa]">{runwayMonths?.toFixed(1)}</span>
        <span className="text-sm text-white/30">months left</span>
        <span className="ml-auto text-xs text-white/25">Industry: {industryAvg} mo</span>
      </div>
      <ResponsiveContainer width="100%" height={120}>
        <AreaChart data={data} margin={{ top:2, right:4, left:-22, bottom:0 }}>
          <defs>
            <linearGradient id="rg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#60a5fa" stopOpacity={0.22}/>
              <stop offset="95%" stopColor="#60a5fa" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false}/>
          <XAxis dataKey="m" tick={{ fill:"rgba(255,255,255,0.22)", fontSize:9 }} axisLine={false} tickLine={false}/>
          <YAxis tick={{ fill:"rgba(255,255,255,0.18)", fontSize:8 }} axisLine={false} tickLine={false} tickFormatter={(v)=>`$${(v/1000).toFixed(0)}k`}/>
          <Tooltip content={<TTip unit="" />} />
          <ReferenceLine y={estimated*0.2} stroke="rgba(248,113,113,0.35)" strokeDasharray="3 3"/>
          <Area type="monotone" dataKey="cash" stroke="#60a5fa" strokeWidth={2} fill="url(#rg)" dot={false}/>
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
}

// ── Financial Horizontal Bar ──────────────────────────────────────────────────
function FinancialBar({ revenue, expenses, lastMonthRevenue }) {
  const data = [
    { name:"Last Rev",  value:lastMonthRevenue??0, color:"#a78bfa" },
    { name:"Revenue",   value:revenue??0,          color:"#63ffb4" },
    { name:"Expenses",  value:expenses??0,         color:"#f87171" },
  ].filter((d)=>d.value>0);
  if (!data.length) return null;
  return (
    <Card className="p-6">
      <Label>Financial Overview</Label>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={data} layout="vertical" barSize={20} margin={{ top:0, right:10, left:30, bottom:0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false}/>
          <XAxis type="number" tick={{ fill:"rgba(255,255,255,0.22)", fontSize:9 }} axisLine={false} tickLine={false} tickFormatter={(v)=>`$${(v/1000).toFixed(0)}k`}/>
          <YAxis type="category" dataKey="name" tick={{ fill:"rgba(255,255,255,0.4)", fontSize:11 }} axisLine={false} tickLine={false} width={60}/>
          <Tooltip content={<TTip />} cursor={{ fill:"rgba(255,255,255,0.03)" }}/>
          <Bar dataKey="value" radius={[0,8,8,0]}>
            {data.map((d,i)=><Cell key={i} fill={d.color} fillOpacity={0.8}/>)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}

// ── Insight card ──────────────────────────────────────────────────────────────
function InsightCard({ icon, label, text, color }) {
  return (
    <div className="rounded-xl p-4 space-y-2 border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.035] transition-colors" style={{ borderLeftColor:color, borderLeftWidth:3 }}>
      <div className="flex items-center gap-2">
        <span>{icon}</span>
        <span className="text-[10px] font-bold tracking-[0.14em] uppercase text-white/35">{label}</span>
      </div>
      <p className="text-sm text-white/70 leading-relaxed">{text||"—"}</p>
    </div>
  );
}

function ActionCard({ icon, label, text, color }) {
  return (
    <Card className="p-5 space-y-2" style={{ borderLeftColor:color, borderLeftWidth:3 }}>
      <div className="flex items-center gap-2">
        <span className="text-lg">{icon}</span>
        <span className="text-[10px] font-bold tracking-[0.14em] uppercase" style={{ color, opacity:0.7 }}>{label}</span>
      </div>
      <p className="text-sm text-white/72 leading-relaxed">{text||"—"}</p>
    </Card>
  );
}

function CompareRow({ label, yours, industry, unit }) {
  const better = (yours??0) >= (industry??0);
  const color  = better ? "#63ffb4" : "#f87171";
  const delta  = Math.abs(((yours??0)-(industry??0))).toFixed(1);
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/[0.05] last:border-0">
      <span className="text-sm text-white/50">{label}</span>
      <div className="flex items-center gap-3">
        <span className="text-sm font-bold text-white tabular-nums">{(yours??0).toFixed(1)}{unit}</span>
        <span className="text-xs text-white/25">vs {(industry??0).toFixed(1)}{unit}</span>
        <span className="text-xs font-bold px-2 py-0.5 rounded-full border tabular-nums" style={{ color, borderColor:`${color}30`, background:`${color}10` }}>
          {better?"▲":"▼"} {delta}{unit}
        </span>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-2 border-[#63ffb4]/10"/>
        <div className="absolute inset-0 rounded-full border-t-2 border-[#63ffb4] animate-spin"/>
      </div>
      <span className="text-xs text-white/30 tracking-widest uppercase font-semibold">Fetching ML insights…</span>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { activeStartupId, startups } = useAuth();
  const toast = useToast();
  const { data, loading, error, reload } = useDashboard(activeStartupId);
  const [tab, setTab] = useState("overview");

  useEffect(() => { if (error) toast.error(error); }, [error]);

  const startup = startups?.find((s) => String(s.id) === String(activeStartupId));
  const rc = riskColor(data?.riskLevel);
  const iAvgG = data?.industryAvgGrowth ?? data?.industryAverageGrowth ?? 0;
  const iAvgR = data?.industryAvgRunway ?? data?.industryAverageRunway ?? 0;
  const conf  = data?.riskConfidence  ?? data?.confidence ?? 0;

  const TABS = [
    { id:"overview",   label:"Overview"    },
    { id:"insights",   label:"AI Insights" },
    { id:"financials", label:"Financials"  },
  ];

  return (
    <div className="min-h-screen bg-[#080c10] pt-20 pb-16 px-4">
      <div className="fixed inset-0 bg-[linear-gradient(rgba(99,255,180,0.012)_1px,transparent_1px),linear-gradient(90deg,rgba(99,255,180,0.012)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none" />

      {/* Top risk accent line */}
      {data && (
        <div className="fixed top-0 left-0 right-0 h-[2px] pointer-events-none z-40" style={{ background:`linear-gradient(90deg,transparent,${rc},transparent)`, opacity:0.5 }} />
      )}

      <div className="relative max-w-6xl mx-auto space-y-6 animate-fadeIn">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#63ffb4]/20 bg-[#63ffb4]/5 text-[#63ffb4] text-xs font-mono tracking-widest mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#63ffb4] animate-pulse" />
              LIVE ANALYTICS
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white">{startup?.name ?? "Dashboard"}</h1>
            <p className="text-sm text-white/40 mt-0.5">
              {startup ? `${startup.industry} · ML-powered health monitoring` : "Select a startup from the navbar"}
            </p>
          </div>
          {data && (
            <button onClick={() => reload(activeStartupId)} className="self-start sm:self-end px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white/50 hover:text-white hover:border-white/20 transition-all font-semibold">
              ↻ Refresh
            </button>
          )}
        </div>

        {/* Empty state */}
        {!activeStartupId && (
          <div className="rounded-2xl border border-dashed border-white/10 p-20 text-center space-y-4">
            <div className="text-5xl">🧠</div>
            <p className="text-white/40 text-sm">Select a startup from the navbar dropdown</p>
            <a href="/create" className="inline-block text-xs text-[#63ffb4] hover:underline font-semibold">+ Create your first startup</a>
          </div>
        )}

        {activeStartupId && loading && <Spinner />}

        {data && !loading && (
          <>
            {/* Tabs */}
            <div className="flex gap-1 bg-white/[0.03] border border-white/[0.06] rounded-xl p-1 w-fit">
              {TABS.map((t) => (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${tab===t.id ? "bg-[#63ffb4]/10 text-[#63ffb4] border border-[#63ffb4]/20" : "text-white/40 hover:text-white/70"}`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* ══ OVERVIEW ══ */}
            {tab === "overview" && (
              <div className="space-y-4">
                {/* 4-col grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <HealthRing score={data.healthScore} />
                  <RiskCard riskLevel={data.riskLevel} confidence={conf} />
                  <GrowthBar yourGrowth={data.growthRate} industryAvg={iAvgG} />
                  <RunwayArea runwayMonths={data.runwayMonths} industryAvg={iAvgR} monthlyExpenses={data.monthlyExpenses ?? 10000} />
                </div>

                {/* Industry compare */}
                <Card className="p-6">
                  <Label>Industry Comparison</Label>
                  <CompareRow label="Growth Rate" yours={data.growthRate ?? 0} industry={iAvgG} unit="%" />
                  <CompareRow label="Runway"      yours={data.runwayMonths ?? 0} industry={iAvgR} unit=" mo" />
                </Card>

                {/* Action cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <ActionCard icon="🎯" label="Action Recommendation" color="#63ffb4" text={data.actionRecommendation ?? data.recommendation} />
                  <ActionCard icon="💰" label="Funding Suggestion"    color="#60a5fa" text={data.fundingSuggestion} />
                </div>
              </div>
            )}

            {/* ══ AI INSIGHTS ══ */}
            {tab === "insights" && (
              <div className="space-y-4">
                {/* Risk hero banner */}
                <div className="rounded-2xl border p-6 relative overflow-hidden" style={{ background:riskBg(data.riskLevel), borderColor:riskBorder(data.riskLevel) }}>
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 text-8xl font-black opacity-[0.04] select-none" style={{ color:rc }}>{data.riskLevel}</div>
                  <div className="relative">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <span className="text-xs font-black tracking-[0.2em] uppercase px-3 py-1 rounded-full border" style={{ color:rc, borderColor:`${rc}40`, background:`${rc}15` }}>
                        {data.riskLevel} RISK
                      </span>
                      <span className="text-xs text-white/30">ML confidence: {Math.round(conf*100)}%</span>
                    </div>
                    <p className="text-sm text-white/65 leading-relaxed max-w-xl">{data.riskInsight}</p>
                  </div>
                </div>

                {/* Three insight cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <InsightCard icon="📈" label="Growth Insight" text={data.growthInsight} color="#63ffb4" />
                  <InsightCard icon="🛤"  label="Runway Insight" text={data.runwayInsight} color="#60a5fa" />
                  <InsightCard icon="⚡"  label="Risk Insight"   text={data.riskInsight}   color={rc} />
                </div>

                {/* Confidence bars */}
                <Card className="p-6">
                  <Label>ML Confidence Breakdown</Label>
                  <div className="space-y-4">
                    {[
                      { label:"Risk Classification", value: conf,                                       color: rc        },
                      { label:"Growth Forecast",     value: Math.min(1, (conf??0.7)*0.92),              color: "#63ffb4" },
                      { label:"Runway Estimate",     value: Math.min(1, (conf??0.7)*0.87),              color: "#60a5fa" },
                    ].map(({ label, value, color }) => {
                      const p = Math.round(value*100);
                      return (
                        <div key={label} className="space-y-1.5">
                          <div className="flex justify-between text-xs">
                            <span className="text-white/45">{label}</span>
                            <span className="font-black tabular-nums" style={{ color }}>{p}%</span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-white/[0.06] overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-1000" style={{ width:`${p}%`, background:`linear-gradient(90deg,${color}65,${color})` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <ActionCard icon="🎯" label="Action Recommendation" color="#63ffb4" text={data.actionRecommendation ?? data.recommendation} />
                  <ActionCard icon="💰" label="Funding Suggestion"    color="#60a5fa" text={data.fundingSuggestion} />
                </div>
              </div>
            )}

            {/* ══ FINANCIALS ══ */}
            {tab === "financials" && (
              <div className="space-y-4">
                <FinancialBar
                  revenue={data.revenue ?? data.monthlyRevenue}
                  expenses={data.monthlyExpenses}
                  lastMonthRevenue={data.lastMonthRevenue}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <RunwayArea runwayMonths={data.runwayMonths} industryAvg={iAvgR} monthlyExpenses={data.monthlyExpenses ?? 10000} />
                  <GrowthBar  yourGrowth={data.growthRate} industryAvg={iAvgG} />
                </div>
                {/* KPI tiles */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label:"Health Score", value:`${data.healthScore}/100`,                color: data.healthScore>=70?"#63ffb4":"#fbbf24" },
                    { label:"Growth Rate",  value:`${data.growthRate?.toFixed(1)}%`,        color:"#63ffb4" },
                    { label:"Runway",       value:`${data.runwayMonths?.toFixed(1)} mo`,    color:"#60a5fa" },
                    { label:"Risk Level",   value: data.riskLevel,                          color: rc },
                  ].map(({ label, value, color }) => (
                    <Card key={label} className="p-4 text-center space-y-1">
                      <div className="text-[10px] text-white/28 tracking-widest uppercase">{label}</div>
                      <div className="text-xl font-black tabular-nums" style={{ color }}>{value}</div>
                    </Card>
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