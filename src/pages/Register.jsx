import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerApi } from "../api/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { ROLES, getRoleMeta } from "../utils/roles";

const ROLE_ACCESS = {
  [ROLES.FOUNDER]: ["Create Startup", "Dashboard", "Benchmark", "ML Insights"],
  [ROLES.USER]:    ["Dashboard (read-only)"],
};

export default function Register() {
  const [step,         setStep]         = useState(1);
  const [selectedRole, setSelectedRole] = useState(ROLES.FOUNDER);
  const [email,        setEmail]        = useState("");
  const [password,     setPassword]     = useState("");
  const [confirm,      setConfirm]      = useState("");
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState("");

  const { saveRegistrationRole } = useAuth();
  const toast    = useToast();
  const navigate = useNavigate();
  const meta     = getRoleMeta(selectedRole);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email)               { setError("Email is required.");              return; }
    if (!password)            { setError("Password is required.");           return; }
    if (password !== confirm) { setError("Passwords do not match.");         return; }
    if (password.length < 6)  { setError("Password must be 6+ characters."); return; }

    // ── Save role to localStorage BEFORE the API call ──────────────────────
    // This ensures that even if JWT decode fails later, we still know the role
    saveRegistrationRole(selectedRole);

    setLoading(true);
    try {
      await registerApi(email, password, selectedRole);
      toast.success(`${meta.label} account created! Please sign in.`);
      navigate("/login");
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080c10] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(99,255,180,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(99,255,180,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#63ffb4]/4 blur-[100px] pointer-events-none" />

      <div className="relative w-full max-w-md space-y-6 animate-fadeIn">

        {/* Logo */}
        <div className="text-center">
          <h1 className="text-3xl font-black tracking-tight text-white">
            Founder<span className="text-[#63ffb4]">Brain</span>
          </h1>
          <p className="text-sm text-white/40 mt-1">Create your account</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2">
          {["Choose Role", "Create Account"].map((label, i) => {
            const isActive = i + 1 === step;
            const isDone   = i + 1 < step;
            return (
              <div key={label} className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-black transition-all ${
                  isDone   ? "bg-[#63ffb4] border-[#63ffb4] text-[#080c10]" :
                  isActive ? "border-[#63ffb4] text-[#63ffb4]" :
                             "border-white/20 text-white/30"
                }`}>
                  {isDone ? "✓" : i + 1}
                </div>
                <span className={`text-xs font-semibold ${isActive ? "text-white" : "text-white/30"}`}>{label}</span>
                {i === 0 && <span className="text-white/15 text-sm mx-1">→</span>}
              </div>
            );
          })}
        </div>

        {/* ══ STEP 1: Role picker ══ */}
        {step === 1 && (
          <div className="space-y-4">
            <p className="text-center text-sm text-white/40">What is your role?</p>

            <div className="space-y-3">
              {[
                {
                  role: ROLES.FOUNDER,
                  icon: "🚀",
                  title: "Founder",
                  subtitle: "I want to create and track my startup analytics",
                  color: "#63ffb4",
                },
                {
                  role: ROLES.USER,
                  icon: "👤",
                  title: "User",
                  subtitle: "I want to view startup analytics (read-only)",
                  color: "#60a5fa",
                },
              ].map(({ role, icon, title, subtitle, color }) => {
                const isSelected = selectedRole === role;
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setSelectedRole(role)}
                    className="w-full text-left rounded-2xl border p-5 transition-all duration-150"
                    style={{
                      background:  isSelected ? `${color}10` : "rgba(255,255,255,0.02)",
                      borderColor: isSelected ? color         : "rgba(255,255,255,0.08)",
                    }}
                  >
                    <div className="flex items-start gap-4">
                      {/* Radio dot */}
                      <div
                        className="mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all"
                        style={{ borderColor: isSelected ? color : "rgba(255,255,255,0.25)" }}
                      >
                        {isSelected && (
                          <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-base">{icon}</span>
                          <span className="text-sm font-black text-white">{title}</span>
                          {isSelected && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                              style={{ color, borderColor:`${color}40`, background:`${color}15` }}>
                              Selected
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-white/40 mb-2">{subtitle}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {ROLE_ACCESS[role].map((tag) => (
                            <span key={tag}
                              className="text-[10px] px-2 py-0.5 rounded-full border font-medium"
                              style={isSelected
                                ? { color, borderColor:`${color}30`, background:`${color}10` }
                                : { color:"rgba(255,255,255,0.3)", borderColor:"rgba(255,255,255,0.08)" }
                              }>
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full rounded-xl font-bold text-sm py-3.5 tracking-wide active:scale-[0.98] transition-all"
              style={{ background: meta.color, color: "#080c10" }}
            >
              Continue as {meta.label} →
            </button>

            <p className="text-center text-xs text-white/30">
              Already have an account?{" "}
              <Link to="/login" className="text-[#63ffb4] font-semibold hover:text-white transition-colors">Sign in</Link>
            </p>
          </div>
        )}

        {/* ══ STEP 2: Account form ══ */}
        {step === 2 && (
          <div className="space-y-4">
            {/* Role summary pill — click to go back */}
            <button
              type="button"
              onClick={() => { setStep(1); setError(""); }}
              className="w-full flex items-center gap-3 rounded-xl border p-3.5 text-left hover:opacity-80 transition-opacity"
              style={{ background: meta.bg, borderColor: meta.border }}
            >
              <span className="text-xl">{meta.icon}</span>
              <div className="flex-1">
                <div className="text-[10px] text-white/35 tracking-widest uppercase font-semibold">Registering as</div>
                <div className="text-sm font-black" style={{ color: meta.color }}>{meta.label}</div>
              </div>
              <span className="text-xs text-white/30">← Change</span>
            </button>

            <div className="rounded-2xl border border-white/10 bg-[#0d1117]/80 backdrop-blur-sm p-7 shadow-2xl space-y-5">

              {/* Error */}
              {error && (
                <div className="flex items-start gap-3 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
                  <span className="shrink-0">⚠</span>
                  <span className="flex-1">{error}</span>
                  <button onClick={() => setError("")} className="text-red-400/40 hover:text-red-400 text-lg leading-none">×</button>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold tracking-widest uppercase text-white/40">Email</label>
                  <input
                    type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com" autoComplete="email"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#63ffb4]/50 focus:ring-1 focus:ring-[#63ffb4]/20 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold tracking-widest uppercase text-white/40">Password</label>
                  <input
                    type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 characters" autoComplete="new-password"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#63ffb4]/50 focus:ring-1 focus:ring-[#63ffb4]/20 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold tracking-widest uppercase text-white/40">Confirm Password</label>
                  <input
                    type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Repeat password" autoComplete="new-password"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#63ffb4]/50 focus:ring-1 focus:ring-[#63ffb4]/20 transition-all"
                  />
                </div>

                {/* What happens after */}
                <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] px-4 py-3 flex items-center gap-3">
                  <span className="text-lg">{meta.icon}</span>
                  <div>
                    <div className="text-[10px] text-white/25 uppercase tracking-widest font-semibold">After login you'll go to</div>
                    <div className="text-xs font-bold" style={{ color: meta.color }}>
                      {selectedRole === ROLES.FOUNDER ? "→ Create Startup page" : "→ Dashboard"}
                    </div>
                  </div>
                </div>

                <button
                  type="submit" disabled={loading}
                  className="w-full rounded-xl font-bold text-sm py-3.5 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  style={{ background: meta.color, color: "#080c10" }}
                >
                  {loading ? (
                    <><div className="w-4 h-4 border-2 border-[#080c10]/30 border-t-[#080c10] rounded-full animate-spin" />Creating…</>
                  ) : `Create ${meta.label} Account →`}
                </button>
              </form>

              <p className="text-center text-xs text-white/30">
                Already have an account?{" "}
                <Link to="/login" className="text-[#63ffb4] font-semibold hover:text-white transition-colors">Sign in</Link>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}