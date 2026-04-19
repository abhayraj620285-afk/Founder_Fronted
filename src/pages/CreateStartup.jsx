import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createStartupApi } from "../api/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const INDUSTRIES = [
  "SaaS","FinTech","HealthTech","EdTech","E-Commerce",
  "AI/ML","CleanTech","PropTech","FoodTech","Logistics","Other",
];

const FIELDS = [
  { key:"revenue",          label:"Monthly Revenue",    placeholder:"50000",  prefix:"$" },
  { key:"lastMonthRevenue", label:"Last Month Revenue", placeholder:"45000",  prefix:"$" },
  { key:"monthlyExpenses",  label:"Monthly Expenses",   placeholder:"30000",  prefix:"$" },
  { key:"cashReserve",      label:"Cash Reserve",       placeholder:"200000", prefix:"$" },
  { key:"users",            label:"Active Users",       placeholder:"1200",   prefix:"#" },
];

export default function CreateStartup() {
  const { addStartup, saveStartupId } = useAuth();
  const toast    = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name:"", industry:"",
    revenue:"", lastMonthRevenue:"", monthlyExpenses:"", cashReserve:"", users:"",
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name)     { setError("Startup name is required.");  return; }
    if (!form.industry) { setError("Please select an industry."); return; }

    setLoading(true);
    try {
      const payload = {
        name:             form.name,
        industry:         form.industry,
        revenue:          parseFloat(form.revenue)          || 0,
        lastMonthRevenue: parseFloat(form.lastMonthRevenue) || 0,
        monthlyExpenses:  parseFloat(form.monthlyExpenses)  || 0,
        cashReserve:      parseFloat(form.cashReserve)      || 0,
        users:            parseInt(form.users)              || 0,
      };

      // createStartupApi returns the startup object directly (unwrapped from ApiResponse)
      // Your backend: ApiResponse<StartupResponse> → data field contains the startup
      const startup = await createStartupApi(payload);
      console.log("Created startup:", startup);

      const startupId = startup?.id;
      if (startupId) {
        saveStartupId(startupId);
        addStartup(startup);
        toast.success(`"${form.name}" created! Loading dashboard…`);
        navigate("/dashboard", { replace: true });
      } else {
        // Id not found in response — still navigate but warn
        console.warn("No startup ID in response:", startup);
        toast.success(`"${form.name}" created! Go to dashboard.`);
        navigate("/dashboard", { replace: true });
      }

    } catch (err) {
      console.error("Create startup error:", err.message);
      setError(err.message || "Failed to create startup.");
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080c10] pt-20 pb-16 px-4 relative overflow-hidden">
      <div className="fixed inset-0 bg-[linear-gradient(rgba(99,255,180,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(99,255,180,0.02)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none" />

      <div className="relative max-w-2xl mx-auto space-y-8 animate-fadeIn">

        {/* Header */}
        <div>
          <div className="flex items-center gap-1 text-[11px] mb-4">
            {["Register","Login","Create Startup","Dashboard"].map((label, i, arr) => (
              <div key={label} className="flex items-center gap-1">
                <span className={i === 2 ? "text-[#63ffb4] font-bold" : i < 2 ? "text-white/50" : "text-white/20"}>
                  {label}
                </span>
                {i < arr.length - 1 && <span className="text-white/15">→</span>}
              </div>
            ))}
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#63ffb4]/20 bg-[#63ffb4]/5 text-[#63ffb4] text-xs font-mono tracking-widest mb-3">
            🚀 FOUNDER · NEW STARTUP
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white">Register Your Startup</h1>
          <p className="text-sm text-white/40 mt-1">Fill in your startup details to unlock AI-powered analytics</p>
        </div>

        {/* Form */}
        <div className="rounded-2xl border border-white/10 bg-[#0d1117]/80 backdrop-blur-sm p-8 shadow-2xl">

          {error && (
            <div className="flex items-start gap-3 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400 mb-6">
              <span>⚠</span>
              <span className="flex-1">{error}</span>
              <button onClick={() => setError("")} className="text-red-400/40 hover:text-red-400 text-lg leading-none">×</button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Name + Industry */}
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
                  className="w-full bg-[#0d1117] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#63ffb4]/50 focus:ring-1 focus:ring-[#63ffb4]/20 transition-all"
                >
                  <option value="">Select industry…</option>
                  {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-white/[0.06]" />
              <span className="text-xs text-white/25 tracking-widest uppercase font-semibold">Financial Metrics</span>
              <div className="flex-1 h-px bg-white/[0.06]" />
            </div>

            {/* Numeric fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {FIELDS.map(({ key, label, placeholder, prefix }) => (
                <div key={key} className="space-y-1.5">
                  <label className="text-xs font-semibold tracking-widest uppercase text-white/40">{label}</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 text-sm font-mono">{prefix}</span>
                    <input
                      type="number" min="0" value={form[key]} onChange={set(key)}
                      placeholder={placeholder}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#63ffb4]/50 focus:ring-1 focus:ring-[#63ffb4]/20 transition-all"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* What happens next */}
            <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] px-4 py-3 flex items-center gap-3">
              <span className="text-lg">📊</span>
              <div>
                <div className="text-[10px] text-white/25 uppercase tracking-widest font-semibold">After submitting</div>
                <div className="text-xs text-white/50">
                  You'll be taken to your <span className="text-[#63ffb4] font-semibold">Dashboard</span> with real-time ML risk prediction and insights
                </div>
              </div>
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full rounded-xl bg-[#63ffb4] text-[#080c10] font-bold text-sm py-4 hover:bg-[#4dffa8] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading
                ? <><div className="w-4 h-4 border-2 border-[#080c10]/30 border-t-[#080c10] rounded-full animate-spin" />Analyzing with ML…</>
                : "Create Startup & Go to Dashboard →"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-white/25">
          Already have a startup?{" "}
          <Link to="/dashboard" className="text-[#63ffb4] hover:text-white transition-colors font-semibold">
            Go to Dashboard
          </Link>
        </p>
      </div>
    </div>
  );
}