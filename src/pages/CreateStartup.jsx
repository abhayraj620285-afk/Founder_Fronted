import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createStartupApi } from "../api/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { Card, ErrorBanner } from "../components/UI";

const INDUSTRIES = [
  "SaaS","FinTech","HealthTech","EdTech","E-Commerce",
  "AI/ML","CleanTech","PropTech","FoodTech","Logistics","Other",
];

const FIELDS = [
  { key: "revenue",          label: "Monthly Revenue",    placeholder: "50000",  prefix: "$" },
  { key: "lastMonthRevenue", label: "Last Month Revenue", placeholder: "45000",  prefix: "$" },
  { key: "monthlyExpenses",  label: "Monthly Expenses",   placeholder: "30000",  prefix: "$" },
  { key: "cashReserve",      label: "Cash Reserve",       placeholder: "200000", prefix: "$" },
  { key: "users",            label: "Active Users",       placeholder: "1200",   prefix: "#" },
];

export default function CreateStartup() {
  const { addStartup }  = useAuth();
  const toast           = useToast();
  const navigate        = useNavigate();

  const [form, setForm] = useState({
    name: "", industry: "",
    revenue: "", lastMonthRevenue: "", monthlyExpenses: "", cashReserve: "", users: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name || !form.industry) { setError("Startup name and industry are required."); return; }

    setLoading(true);
    try {
      const payload = {
        name: form.name, industry: form.industry,
        revenue:          parseFloat(form.revenue)          || 0,
        lastMonthRevenue: parseFloat(form.lastMonthRevenue) || 0,
        monthlyExpenses:  parseFloat(form.monthlyExpenses)  || 0,
        cashReserve:      parseFloat(form.cashReserve)      || 0,
        users:            parseInt(form.users)              || 0,
      };
      const result = await createStartupApi(payload);
      const startup = result?.data ?? result;
      addStartup(startup);
      toast.success(`"${form.name}" created! Redirecting to dashboard…`);
      setTimeout(() => navigate("/dashboard"), 1200);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080c10] pt-20 pb-16 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(99,255,180,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(99,255,180,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />

      <div className="relative max-w-2xl mx-auto space-y-8 animate-fadeIn">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#63ffb4]/20 bg-[#63ffb4]/5 text-[#63ffb4] text-xs font-mono tracking-widest mb-4">
            ✦ NEW STARTUP
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white">Register Your Startup</h1>
          <p className="text-sm text-white/40 mt-1">Provide your metrics to unlock AI-powered insights</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            <ErrorBanner message={error} onDismiss={() => setError("")} />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold tracking-widest uppercase text-white/40">Startup Name *</label>
                <input
                  value={form.name} onChange={set("name")} placeholder="Acme Corp"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#63ffb4]/50 focus:ring-1 focus:ring-[#63ffb4]/20 transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold tracking-widest uppercase text-white/40">Industry *</label>
                <select
                  value={form.industry} onChange={set("industry")}
                  className="w-full bg-[#0d1117] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#63ffb4]/50 transition-all"
                >
                  <option value="">Select industry…</option>
                  {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-white/[0.06]" />
              <span className="text-xs text-white/30 tracking-widest font-semibold uppercase">Financial Metrics</span>
              <div className="flex-1 h-px bg-white/[0.06]" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {FIELDS.map(({ key, label, placeholder, prefix }) => (
                <div key={key} className="space-y-1.5">
                  <label className="text-xs font-semibold tracking-widest uppercase text-white/40">{label}</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 text-sm font-mono">{prefix}</span>
                    <input
                      type="number" min="0" value={form[key]} onChange={set(key)} placeholder={placeholder}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#63ffb4]/50 focus:ring-1 focus:ring-[#63ffb4]/20 transition-all"
                    />
                  </div>
                </div>
              ))}
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full rounded-xl bg-[#63ffb4] text-[#080c10] font-bold text-sm py-3.5 tracking-wide hover:bg-[#4dffa8] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <><div className="w-4 h-4 border-2 border-[#080c10]/30 border-t-[#080c10] rounded-full animate-spin" />Analyzing…</>
              ) : "Create Startup & Analyze →"}
            </button>
          </form>
        </Card>
      </div>
    </div>
  );
}