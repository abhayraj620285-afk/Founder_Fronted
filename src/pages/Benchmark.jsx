import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useBenchmark } from "../hooks/useApi";
import { Card, CompareBar, Spinner, ErrorBanner, DeltaBadge } from "../components/UI";
import { useEffect } from "react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
  ResponsiveContainer, Tooltip,
} from "recharts";

function PerformanceVerdict({ text }) {
  const isGood = /above|strong|excel|great|outperform|better/i.test(text ?? "");
  return (
    <div className={`flex items-center gap-3 rounded-xl px-4 py-3 border ${
      isGood
        ? "bg-[#63ffb4]/8 border-[#63ffb4]/20 text-[#63ffb4]"
        : "bg-amber-500/8 border-amber-500/20 text-amber-400"
    }`}>
      <span className="text-xl">{isGood ? "🚀" : "📊"}</span>
      <div>
        <div className="text-xs font-bold tracking-widest uppercase opacity-60 mb-0.5">Overall Performance</div>
        <div className="text-sm font-semibold">{text}</div>
      </div>
    </div>
  );
}

export default function Benchmark() {
  const { activeStartupId, startups } = useAuth();
  const toast = useToast();
  const { data, loading, error, reload } = useBenchmark(activeStartupId);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const activeStartup = startups?.find((s) => String(s.id) === String(activeStartupId));

  // Radar chart data
  const radarData = data
    ? [
        {
          metric: "Growth",
          You: data.yourGrowth ?? 0,
          Industry: data.industryAverageGrowth ?? 0,
        },
        {
          metric: "Runway",
          You: data.yourRunway ?? 0,
          Industry: data.industryAverageRunway ?? 0,
        },
      ]
    : [];

  return (
    <div className="min-h-screen bg-[#080c10] pt-20 pb-16 px-4">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(99,255,180,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(99,255,180,0.015)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none" />

      <div className="relative max-w-4xl mx-auto space-y-8 animate-fadeIn">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#60a5fa]/20 bg-[#60a5fa]/5 text-[#60a5fa] text-xs font-mono tracking-widest mb-3">
              ⊞ BENCHMARK
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white">
              {activeStartup ? `${activeStartup.name} vs Industry` : "Industry Benchmark"}
            </h1>
            <p className="text-sm text-white/40 mt-0.5">See how your startup stacks up against the market</p>
          </div>
          {data && (
            <button
              onClick={() => reload(activeStartupId)}
              className="self-start sm:self-end px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white/50 hover:text-white hover:border-white/20 transition-all font-semibold"
            >
              ↻ Refresh
            </button>
          )}
        </div>

        {!activeStartupId && (
          <div className="rounded-2xl border border-dashed border-white/10 p-16 text-center">
            <p className="text-white/40 text-sm">Select a startup from the navbar</p>
          </div>
        )}

        {activeStartupId && <ErrorBanner message={error} onDismiss={() => {}} />}
        {activeStartupId && loading && <Spinner label="Fetching benchmark data…" />}

        {data && !loading && (
          <>
            {/* Legend */}
            <div className="flex items-center gap-6">
              {[
                { color: "#63ffb4", label: "Your Startup" },
                { color: "#60a5fa", label: "Industry Average" },
              ].map(({ color, label }) => (
                <div key={label} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm" style={{ background: color }} />
                  <span className="text-xs text-white/50 font-semibold">{label}</span>
                </div>
              ))}
            </div>

            {/* Compare bars */}
            <Card className="space-y-8">
              <CompareBar
                label="Growth Rate"
                yours={data.yourGrowth}
                industry={data.industryAverageGrowth}
                unit="%"
              />
              <div className="h-px bg-white/[0.06]" />
              <CompareBar
                label="Runway"
                yours={data.yourRunway}
                industry={data.industryAverageRunway}
                unit=" mo"
              />
            </Card>

            {/* Delta score cards */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="text-center space-y-2">
                <div className="text-xs text-white/30 tracking-widest uppercase font-semibold">Growth Delta</div>
                <div className="flex items-center justify-center">
                  <DeltaBadge value={(data.yourGrowth ?? 0) - (data.industryAverageGrowth ?? 0)} unit="%" />
                </div>
                <div className="text-xs text-white/30">vs industry average</div>
              </Card>
              <Card className="text-center space-y-2">
                <div className="text-xs text-white/30 tracking-widest uppercase font-semibold">Runway Delta</div>
                <div className="flex items-center justify-center">
                  <DeltaBadge value={(data.yourRunway ?? 0) - (data.industryAverageRunway ?? 0)} unit=" mo" />
                </div>
                <div className="text-xs text-white/30">vs industry average</div>
              </Card>
            </div>

            {/* Radar chart */}
            <Card>
              <h3 className="text-xs font-bold tracking-widest uppercase text-white/30 mb-4">Radar Comparison</h3>
              <ResponsiveContainer width="100%" height={260}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.06)" />
                  <PolarAngleAxis
                    dataKey="metric"
                    tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 600 }}
                  />
                  <Tooltip
                    contentStyle={{ background: "#0d1117", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, fontSize: 12 }}
                    labelStyle={{ color: "rgba(255,255,255,0.6)" }}
                  />
                  <Radar name="You" dataKey="You" stroke="#63ffb4" fill="#63ffb4" fillOpacity={0.15} strokeWidth={2} />
                  <Radar name="Industry" dataKey="Industry" stroke="#60a5fa" fill="#60a5fa" fillOpacity={0.1} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </Card>

            {/* Verdict */}
            {data.performance && <PerformanceVerdict text={data.performance} />}
          </>
        )}
      </div>
    </div>
  );
}