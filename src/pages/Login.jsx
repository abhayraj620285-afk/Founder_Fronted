import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginApi } from "../api/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { getRoleMeta, ROLE_HOME } from "../utils/roles";

export default function Login() {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  const { saveAuth } = useAuth();
  const toast        = useToast();
  const navigate     = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("Email and password are required."); return; }

    setLoading(true);
    try {
      const data = await loginApi(email, password);

      // saveAuth:
      //   1. Decodes JWT → tries all role fields
      //   2. Falls back to fb_role set during registration if JWT has no role
      //   3. Returns the final role string synchronously
      const role = saveAuth(data);

      const meta = getRoleMeta(role);
      toast.success(`Signed in as ${meta.label} ${meta.icon}`);

      // Navigate based on role — FOUNDER → /create, ADMIN → /admin, USER → /dashboard
      const dest = ROLE_HOME[role] ?? "/dashboard";
      console.log(`Login success — role: ${role} — navigating to: ${dest}`);
      navigate(dest, { replace: true });

    } catch (err) {
      setError(err.message || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080c10] flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(99,255,180,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(99,255,180,0.025)_1px,transparent_1px)] bg-[size:60px_60px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#63ffb4]/5 blur-[100px] pointer-events-none" />

      <div className="relative w-full max-w-sm space-y-6 animate-fadeIn">

        {/* Logo */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#63ffb4]/20 bg-[#63ffb4]/5 text-[#63ffb4] text-xs font-mono tracking-widest mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#63ffb4] animate-pulse" />
            AI-POWERED ANALYTICS
          </div>
          <h1 className="text-4xl font-black tracking-tight text-white">
            Founder<span className="text-[#63ffb4]">Brain</span>
          </h1>
          <p className="text-sm text-white/40 mt-1">Sign in to continue</p>
        </div>

        {/* Flow bar */}
        <div className="flex items-center justify-center gap-1 text-[11px]">
          {[
            { label:"Register", done:true   },
            { label:"Login",    active:true  },
            { label:"Create",   dim:true     },
            { label:"Dashboard",dim:true     },
          ].map(({ label, done, active }, i, arr) => (
            <div key={label} className="flex items-center gap-1">
              <span className={active?"text-[#63ffb4] font-bold":done?"text-white/50":"text-white/20"}>
                {label}
              </span>
              {i < arr.length - 1 && <span className="text-white/15">→</span>}
            </div>
          ))}
        </div>

        {/* Form card */}
        <div className="rounded-2xl border border-white/10 bg-[#0d1117]/80 backdrop-blur-sm p-8 shadow-2xl space-y-5">

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
                placeholder="founder@startup.com" autoComplete="email"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#63ffb4]/50 focus:ring-1 focus:ring-[#63ffb4]/20 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold tracking-widest uppercase text-white/40">Password</label>
              <input
                type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" autoComplete="current-password"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#63ffb4]/50 focus:ring-1 focus:ring-[#63ffb4]/20 transition-all"
              />
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full rounded-xl bg-[#63ffb4] text-[#080c10] font-bold text-sm py-3.5 tracking-wide hover:bg-[#4dffa8] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading
                ? <><div className="w-4 h-4 border-2 border-[#080c10]/30 border-t-[#080c10] rounded-full animate-spin"/>Signing in…</>
                : "Sign In →"}
            </button>
          </form>

          {/* Where you'll land */}
          <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] px-4 py-3 space-y-2">
            <p className="text-[10px] text-white/25 font-semibold tracking-widest uppercase">After sign in you'll go to</p>
            {[
              { icon:"🚀", role:"Founder", dest:"Create Startup page", color:"#63ffb4" },
              { icon:"⚙",  role:"Admin",   dest:"Admin Panel",          color:"#f87171" },
              { icon:"👤", role:"User",    dest:"Dashboard",            color:"#60a5fa" },
            ].map(({ icon, role, dest, color }) => (
              <div key={role} className="flex items-center gap-2 text-xs">
                <span>{icon}</span>
                <span className="font-semibold" style={{ color }}>{role}</span>
                <span className="text-white/25">→ {dest}</span>
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-white/30">
            Don't have an account?{" "}
            <Link to="/register" className="text-[#63ffb4] hover:text-white transition-colors font-semibold">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}