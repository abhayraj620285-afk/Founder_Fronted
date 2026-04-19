import { useState } from "react";
import { useNavigate } from "react-router-dom";
import UpgradeModal from "../components/UpgradeModal";
import {
  RadialBarChart, RadialBar, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell,
  AreaChart, Area,
} from "recharts";

// ── All static demo data — zero API calls ─────────────────────────────────────
const D = {
  name:        "DemoStartup Inc.",
  industry:    "SaaS",
  healthScore: 74,
  growthRate:  12.4,
  runway:      8.3,
  risk:        "MEDIUM",
  confidence:  0.87,
  iAvgGrowth:  9.1,
  iAvgRunway:  11.0,
  growthInsight:  "Growth is strong at 12.4% MoM, outpacing SaaS industry average of 9.1%. Maintain current acquisition channels and double down on top-performing marketing.",
  runwayInsight:  "Runway of 8.3 months is below the industry average of 11 months. Consider reducing burn rate or accelerating fundraising conversations.",
  riskInsight:    "Medium operational risk detected. Key concerns: below-average runway and increasing competition in the SaaS segment. Focus on retention.",
  recommendation: "Focus on reducing churn and improving net revenue retention. Explore enterprise contracts to stabilise and extend runway.",
  funding:        "Consider a Seed round of $1.5M–$2M to extend runway to 18 months and fund go-to-market expansion into new verticals.",
};

const GROWTH_BARS = [
  { m:"Oct", you:8.1,  ind:9.1 },{ m:"Nov", you:9.4,  ind:9.0 },
  { m:"Dec", you:10.2, ind:9.2 },{ m:"Jan", you:11.0, ind:9.1 },
  { m:"Feb", you:11.8, ind:9.3 },{ m:"Mar", you:12.4, ind:9.1 },
];

const RUNWAY_AREA = [
  {m:"M0",c:200000},{m:"M1",c:175000},{m:"M2",c:150000},
  {m:"M3",c:125000},{m:"M4",c:100000},{m:"M5",c:75000},
  {m:"M6",c:50000}, {m:"M7",c:28000}, {m:"M8",c:10000},
];

function TTip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0d1117] border border-white/10 rounded-xl px-3 py-2 text-xs shadow-xl">
      {label && <p className="text-white/40 mb-1">{label}</p>}
      {payload.map((p) => (
        <p key={p.name} className="font-bold" style={{ color:p.color ?? p.fill }}>{p.name}: {p.value?.toFixed?.(1)}{p.name==="you"||p.name==="ind"?"%":""}</p>
      ))}
    </div>
  );
}

function DemoTag() {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[#60a5fa]/30 bg-[#60a5fa]/10 text-[#60a5fa] text-[10px] font-black tracking-widest uppercase">
      <span className="w-1.5 h-1.5 rounded-full bg-[#60a5fa] animate-pulse" />
      DEMO DATA — NOT REAL
    </span>
  );
}

function Card({ children, className="" }) {
  return <div className={`rounded-2xl border border-white/[0.07] bg-[#0d1117]/90 p-6 ${className}`}>{children}</div>;
}

function SL({ children }) {
  return <div className="text-[10px] font-bold tracking-[0.16em] uppercase text-white/30 mb-3">{children}</div>;
}

function InsightCard({ icon, label, text, color }) {
  return (
    <div className="rounded-xl p-4 space-y-2 border border-white/[0.06] bg-white/[0.02]" style={{ borderLeftColor:color, borderLeftWidth:3 }}>
      <div className="flex items-center gap-2">
        <span>{icon}</span>
        <span className="text-[10px] font-bold tracking-widest uppercase text-white/35">{label}</span>
      </div>
      <p className="text-sm text-white/65 leading-relaxed">{text}</p>
    </div>
  );
}

export default function DemoDashboard() {
  const navigate    = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [tab, setTab]             = useState("overview");

  return (
    <div className="min-h-screen bg-[#080c10] pt-20 pb-32 px-4">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background:"linear-gradient(90deg,transparent,#fbbf2550,transparent)" }} />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(99,255,180,0.012)_1px,transparent_1px),linear-gradient(90deg,rgba(99,255,180,0.012)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      <div className="relative max-w-6xl mx-auto space-y-6 animate-fadeIn">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <DemoTag />
            </div>
            <h1 className="text-3xl font-black text-white">{D.name}</h1>
            <p className="text-sm text-white/40 mt-0.5">{D.industry} · Sample analytics preview</p>
          </div>
          <button onClick={() => setShowModal(true)}
            className="self-start sm:self-end px-5 py-2.5 rounded-xl bg-[#63ffb4] text-[#080c10] text-xs font-black hover:bg-[#4dffa8] active:scale-95 transition-all">
            🔓 Unlock Real Data
          </button>
        </div>

        {/* Upgrade ribbon */}
        <div className="rounded-xl border border-[#63ffb4]/20 bg-[#63ffb4]/5 px-5 py-3 flex items-center gap-3">
          <span>⚡</span>
          <p className="text-sm text-white/60 flex-1">
            You're viewing <span className="text-[#63ffb4] font-semibold">demo data</span>. Become a Founder to connect your real startup and see live AI analytics.
          </p>
          <button onClick={() => setShowModal(true)} className="shrink-0 text-xs font-black text-[#63ffb4] hover:text-white transition-colors">
            Upgrade →
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white/[0.03] border border-white/[0.06] rounded-xl p-1 w-fit">
          {["overview","insights","benchmark"].map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold tracking-wide capitalize transition-all ${tab===t?"bg-[#63ffb4]/10 text-[#63ffb4] border border-[#63ffb4]/20":"text-white/40 hover:text-white/70"}`}>
              {t}
            </button>
          ))}
        </div>

        {/* ══ OVERVIEW ══ */}
        {tab === "overview" && (
          <div className="space-y-4 animate-fadeIn">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

              {/* Health Ring */}
              <Card className="flex flex-col items-center py-6 relative overflow-hidden">
                <div className="absolute inset-0 rounded-2xl" style={{ background:"radial-gradient(circle at 50% 65%,#63ffb415 0%,transparent 70%)" }} />
                <SL>Health Score</SL>
                <div className="relative w-36 h-36">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart cx="50%" cy="50%" innerRadius="68%" outerRadius="88%"
                      startAngle={220} endAngle={-40} data={[{v:D.healthScore,fill:"#63ffb4"}]} barSize={12}>
                      <RadialBar background={{fill:"rgba(255,255,255,0.04)"}} dataKey="v" cornerRadius={10} data={[{v:D.healthScore,fill:"#63ffb4"}]}/>
                    </RadialBarChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black text-[#63ffb4]">{D.healthScore}</span>
                    <span className="text-[10px] text-white/25">/100</span>
                  </div>
                </div>
                <span className="mt-2 text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full border border-[#63ffb4]/30 bg-[#63ffb4]/10 text-[#63ffb4]">Healthy</span>
              </Card>

              {/* Risk */}
              <Card>
                <SL>ML Risk Prediction</SL>
                <div className="space-y-3 pt-1">
                  <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-[#fbbf24]/25 bg-[#fbbf24]/10 text-[#fbbf24] text-sm font-black tracking-widest">
                    <span className="w-2 h-2 rounded-full bg-[#fbbf24] animate-pulse" />
                    MEDIUM
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-white/35">Confidence</span>
                      <span className="font-black text-[#fbbf24]">87%</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                      <div className="h-full w-[87%] rounded-full bg-gradient-to-r from-[#fbbf24]/60 to-[#fbbf24]" />
                    </div>
                  </div>
                  <p className="text-[10px] text-white/30">Moderate risk — monitor runway closely</p>
                </div>
              </Card>

              {/* Growth */}
              <Card>
                <SL>Growth Rate</SL>
                <div className="text-4xl font-black text-[#63ffb4]">{D.growthRate}%</div>
                <div className="text-xs text-white/30 mt-1 mb-3">vs {D.iAvgGrowth}% industry avg</div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#63ffb4]/25 bg-[#63ffb4]/10 text-[#63ffb4]">
                  ▲ {(D.growthRate - D.iAvgGrowth).toFixed(1)}% above avg
                </span>
              </Card>

              {/* Runway */}
              <Card>
                <SL>Cash Runway</SL>
                <div className="text-4xl font-black text-[#60a5fa]">{D.runway} mo</div>
                <div className="text-xs text-white/30 mt-1 mb-3">vs {D.iAvgRunway} mo industry avg</div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#f87171]/25 bg-[#f87171]/10 text-[#f87171]">
                  ▼ {(D.iAvgRunway - D.runway).toFixed(1)} mo below avg
                </span>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <SL>Growth Rate vs Industry (6 months)</SL>
                <ResponsiveContainer width="100%" height={170}>
                  <BarChart data={GROWTH_BARS} barSize={14} margin={{top:4,right:4,left:-22,bottom:0}}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false}/>
                    <XAxis dataKey="m" tick={{fill:"rgba(255,255,255,0.3)",fontSize:10}} axisLine={false} tickLine={false}/>
                    <YAxis tick={{fill:"rgba(255,255,255,0.2)",fontSize:9}} axisLine={false} tickLine={false} tickFormatter={(v)=>`${v}%`}/>
                    <Tooltip content={<TTip/>} cursor={{fill:"rgba(255,255,255,0.03)"}}/>
                    <Bar dataKey="you" name="you" fill="#63ffb4" fillOpacity={0.85} radius={[4,4,0,0]}/>
                    <Bar dataKey="ind" name="ind" fill="#60a5fa" fillOpacity={0.6}  radius={[4,4,0,0]}/>
                  </BarChart>
                </ResponsiveContainer>
                <div className="flex gap-4 mt-2">
                  <div className="flex items-center gap-1.5 text-[10px] text-white/35"><div className="w-2 h-2 rounded-sm bg-[#63ffb4]"/>You</div>
                  <div className="flex items-center gap-1.5 text-[10px] text-white/35"><div className="w-2 h-2 rounded-sm bg-[#60a5fa]"/>Industry</div>
                </div>
              </Card>

              <Card>
                <SL>Cash Runway Projection</SL>
                <ResponsiveContainer width="100%" height={170}>
                  <AreaChart data={RUNWAY_AREA} margin={{top:4,right:4,left:-22,bottom:0}}>
                    <defs>
                      <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#60a5fa" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="#60a5fa" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false}/>
                    <XAxis dataKey="m" tick={{fill:"rgba(255,255,255,0.22)",fontSize:9}} axisLine={false} tickLine={false}/>
                    <YAxis tick={{fill:"rgba(255,255,255,0.18)",fontSize:8}} axisLine={false} tickLine={false} tickFormatter={(v)=>`$${v/1000}k`}/>
                    <Tooltip content={<TTip/>}/>
                    <Area type="monotone" dataKey="c" name="Cash" stroke="#60a5fa" strokeWidth={2} fill="url(#cg)" dot={false}/>
                  </AreaChart>
                </ResponsiveContainer>
              </Card>
            </div>

            {/* Recommendation + Funding */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card style={{ borderLeftColor:"#63ffb4", borderLeftWidth:3 }}>
                <div className="flex items-center gap-2 mb-2"><span>🎯</span><span className="text-[10px] font-bold tracking-widest uppercase text-[#63ffb4]/70">Action Recommendation</span></div>
                <p className="text-sm text-white/65 leading-relaxed">{D.recommendation}</p>
              </Card>
              <Card style={{ borderLeftColor:"#60a5fa", borderLeftWidth:3 }}>
                <div className="flex items-center gap-2 mb-2"><span>💰</span><span className="text-[10px] font-bold tracking-widest uppercase text-[#60a5fa]/70">Funding Suggestion</span></div>
                <p className="text-sm text-white/65 leading-relaxed">{D.funding}</p>
              </Card>
            </div>
          </div>
        )}

        {/* ══ INSIGHTS ══ */}
        {tab === "insights" && (
          <div className="space-y-4 animate-fadeIn">
            <div className="rounded-2xl border p-6 relative overflow-hidden" style={{ background:"rgba(251,191,36,0.07)", borderColor:"rgba(251,191,36,0.22)" }}>
              <div className="absolute right-6 top-1/2 -translate-y-1/2 text-8xl font-black opacity-[0.04] text-[#fbbf24] select-none">MEDIUM</div>
              <div className="relative">
                <span className="text-xs font-black tracking-widest uppercase px-3 py-1 rounded-full border border-[#fbbf24]/30 bg-[#fbbf24]/15 text-[#fbbf24] mb-3 inline-block">
                  MEDIUM RISK · 87% ML Confidence
                </span>
                <p className="text-sm text-white/65 leading-relaxed max-w-xl">{D.riskInsight}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <InsightCard icon="📈" label="Growth Insight"  text={D.growthInsight}  color="#63ffb4"/>
              <InsightCard icon="🛤"  label="Runway Insight"  text={D.runwayInsight}  color="#60a5fa"/>
              <InsightCard icon="⚡"  label="Risk Insight"    text={D.riskInsight}    color="#fbbf24"/>
            </div>
          </div>
        )}

        {/* ══ BENCHMARK ══ */}
        {tab === "benchmark" && (
          <div className="space-y-4 animate-fadeIn">
            <Card className="space-y-6">
              {[
                { label:"Growth Rate", yours:D.growthRate, ind:D.iAvgGrowth, unit:"%" },
                { label:"Runway",      yours:D.runway,     ind:D.iAvgRunway, unit:" mo" },
              ].map(({ label, yours, ind, unit }) => {
                const better = yours >= ind;
                const color  = better ? "#63ffb4" : "#f87171";
                const max    = Math.max(yours, ind);
                return (
                  <div key={label} className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-white/70">{label}</span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full border" style={{ color, borderColor:`${color}30`, background:`${color}10` }}>
                        {better?"▲":"▼"} {Math.abs(yours-ind).toFixed(1)}{unit}
                      </span>
                    </div>
                    {[{n:"You",v:yours,c:color},{n:"Industry",v:ind,c:"#60a5fa"}].map(({ n, v, c }) => (
                      <div key={n} className="flex items-center gap-3">
                        <span className="text-xs text-white/35 w-14 text-right shrink-0">{n}</span>
                        <div className="flex-1 h-7 bg-white/[0.05] rounded-xl overflow-hidden">
                          <div className="h-full rounded-xl flex items-center justify-end pr-3" style={{ width:`${(v/max)*100}%`, background:`linear-gradient(90deg,${c}60,${c})` }}>
                            <span className="text-[11px] font-bold text-[#080c10]">{v.toFixed(1)}{unit}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </Card>
          </div>
        )}

        {/* Bottom CTA */}
        <div className="text-center pt-4 animate-fadeInUp delay-400">
          <p className="text-sm text-white/35 mb-3">This is demo data. Connect your real startup as a Founder.</p>
          <button onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-[#63ffb4] text-[#080c10] font-black text-sm hover:bg-[#4dffa8] active:scale-95 transition-all">
            🚀 Become a Founder & Connect My Startup
          </button>
        </div>
      </div>

      {showModal && <UpgradeModal onClose={() => setShowModal(false)} />}
    </div>
  );
}