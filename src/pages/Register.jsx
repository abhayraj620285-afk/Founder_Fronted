import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerApi } from "../api/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function Register() {
  const [step,         setStep]         = useState(1);
  const [selectedRole, setSelectedRole] = useState("FOUNDER");
  const [email,        setEmail]        = useState("");
  const [password,     setPassword]     = useState("");
  const [confirm,      setConfirm]      = useState("");
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState("");

  const { setRoleAndPersist } = useAuth();
  const toast    = useToast();
  const navigate = useNavigate();

  const roleConfig = {
    FOUNDER: { color:"#63ffb4", bg:"rgba(99,255,180,0.10)", border:"rgba(99,255,180,0.25)", icon:"🚀", label:"Founder", desc:"Create and manage your startup analytics" },
    USER:    { color:"#60a5fa", bg:"rgba(96,165,250,0.10)", border:"rgba(96,165,250,0.25)", icon:"🌐", label:"User",    desc:"Explore the platform and view demo analytics" },
  };
  const meta = roleConfig[selectedRole];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email)               { setError("Email is required.");               return; }
    if (!password)            { setError("Password is required.");            return; }
    if (password !== confirm) { setError("Passwords do not match.");          return; }
    if (password.length < 6)  { setError("Password must be 6+ characters."); return; }

    // STEP 1: Save role FIRST — this is the single source of truth
    setRoleAndPersist(selectedRole);

    setLoading(true);
    try {
      await registerApi(email, password, selectedRole);
      toast.success(`${meta.label} account created! Please sign in.`);
      navigate("/login");
    } catch (err) {
      setError(err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080c10] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(99,255,180,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(99,255,180,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#63ffb4]/4 blur-[100px] pointer-events-none" />

      <div className="relative w-full max-w-md space-y-6 animate-fadeIn">
        <div className="text-center">
          <h1 className="text-3xl font-black tracking-tight text-white">
            Founder<span className="text-[#63ffb4]">Brain</span>
          </h1>
          <p className="text-sm text-white/40 mt-1">Create your account</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-3">
          {["Choose Role", "Create Account"].map((label, i) => {
            const isActive = i + 1 === step;
            const isDone   = i + 1 < step;
            return (
              <div key={label} className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-black transition-all ${isDone?"bg-[#63ffb4] border-[#63ffb4] text-[#080c10]":isActive?"border-[#63ffb4] text-[#63ffb4]":"border-white/20 text-white/30"}`}>
                  {isDone ? "✓" : i + 1}
                </div>
                <span className={`text-xs font-semibold ${isActive ? "text-white" : "text-white/30"}`}>{label}</span>
                {i === 0 && <span className="text-white/15 mx-1">→</span>}
              </div>
            );
          })}
        </div>

        {/* ── STEP 1: Pick role ── */}
        {step === 1 && (
          <div className="space-y-4">
            <p className="text-center text-sm text-white/40">What is your role?</p>

            {[
              { role:"FOUNDER", icon:"🚀", title:"Founder", subtitle:"I want to create and track my startup", access:["Create Startup","Dashboard","ML Insights","Benchmark"] },
              { role:"USER",    icon:"🌐", title:"User",    subtitle:"I want to explore the platform first",  access:["Explore Page","Demo Dashboard","Upgrade anytime"] },
            ].map(({ role, icon, title, subtitle, access }) => {
              const cfg = roleConfig[role];
              const isSel = selectedRole === role;
              return (
                <button key={role} type="button" onClick={() => setSelectedRole(role)}
                  className="w-full text-left rounded-2xl border p-5 transition-all"
                  style={{ background:isSel?cfg.bg:"rgba(255,255,255,0.02)", borderColor:isSel?cfg.color:"rgba(255,255,255,0.08)" }}>
                  <div className="flex items-start gap-4">
                    <div className="mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0"
                      style={{ borderColor:isSel?cfg.color:"rgba(255,255,255,0.25)" }}>
                      {isSel && <div className="w-2.5 h-2.5 rounded-full" style={{ background:cfg.color }}/>}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span>{icon}</span>
                        <span className="text-sm font-black text-white">{title}</span>
                        {isSel && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border" style={{ color:cfg.color, borderColor:`${cfg.color}40`, background:`${cfg.color}15` }}>Selected</span>}
                      </div>
                      <p className="text-xs text-white/40 mb-2">{subtitle}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {access.map((a) => (
                          <span key={a} className="text-[10px] px-2 py-0.5 rounded-full border font-medium"
                            style={isSel?{color:cfg.color,borderColor:`${cfg.color}30`,background:`${cfg.color}10`}:{color:"rgba(255,255,255,0.3)",borderColor:"rgba(255,255,255,0.08)"}}>
                            {a}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}

            <button onClick={() => setStep(2)}
              className="w-full rounded-xl font-bold text-sm py-3.5 active:scale-[0.98] transition-all"
              style={{ background:meta.color, color:"#080c10" }}>
              Continue as {meta.label} →
            </button>
            <p className="text-center text-xs text-white/30">
              Already have an account?{" "}
              <Link to="/login" className="text-[#63ffb4] font-semibold hover:text-white transition-colors">Sign in</Link>
            </p>
          </div>
        )}

        {/* ── STEP 2: Fill form ── */}
        {step === 2 && (
          <div className="space-y-4">
            <button type="button" onClick={() => { setStep(1); setError(""); }}
              className="w-full flex items-center gap-3 rounded-xl border p-3.5 hover:opacity-80 transition-opacity"
              style={{ background:meta.bg, borderColor:meta.border }}>
              <span className="text-xl">{meta.icon}</span>
              <div className="flex-1 text-left">
                <div className="text-[10px] text-white/35 tracking-widest uppercase font-semibold">Registering as</div>
                <div className="text-sm font-black" style={{ color:meta.color }}>{meta.label}</div>
              </div>
              <span className="text-xs text-white/30">← Change</span>
            </button>

            <div className="rounded-2xl border border-white/10 bg-[#0d1117]/80 p-7 shadow-2xl space-y-5">
              {error && (
                <div className="flex items-start gap-3 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
                  <span>⚠</span><span className="flex-1">{error}</span>
                  <button onClick={() => setError("")} className="text-red-400/40 hover:text-red-400 text-lg leading-none">×</button>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {[
                  { label:"Email",            value:email,    set:setEmail,    type:"email",    auto:"email",        ph:"you@example.com"   },
                  { label:"Password",         value:password, set:setPassword, type:"password", auto:"new-password", ph:"Min. 6 characters" },
                  { label:"Confirm Password", value:confirm,  set:setConfirm,  type:"password", auto:"new-password", ph:"Repeat password"   },
                ].map(({ label, value, set, type, auto, ph }) => (
                  <div key={label} className="space-y-1.5">
                    <label className="text-xs font-semibold tracking-widest uppercase text-white/40">{label}</label>
                    <input type={type} value={value} onChange={(e) => set(e.target.value)} placeholder={ph} autoComplete={auto}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#63ffb4]/50 focus:ring-1 focus:ring-[#63ffb4]/20 transition-all"/>
                  </div>
                ))}

                {/* After registration info */}
                <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] px-4 py-3 flex items-center gap-3">
                  <span>{meta.icon}</span>
                  <div>
                    <div className="text-[10px] text-white/25 uppercase tracking-widest font-semibold">After login you'll go to</div>
                    <div className="text-xs font-bold" style={{ color:meta.color }}>
                      {selectedRole === "FOUNDER" ? "→ Create Startup page" : "→ Explore Page & Demo Dashboard"}
                    </div>
                  </div>
                </div>

                <button type="submit" disabled={loading}
                  className="w-full rounded-xl font-bold text-sm py-3.5 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{ background:meta.color, color:"#080c10" }}>
                  {loading
                    ? <><div className="w-4 h-4 border-2 border-[#080c10]/30 border-t-[#080c10] rounded-full animate-spin"/>Creating…</>
                    : `Create ${meta.label} Account →`}
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