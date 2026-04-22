import { useState } from "react";
import Logo from "../components/Logo";
import { useNavigate, Link } from "react-router-dom";
import { loginApi, getMyStartupsApi } from "../api/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const ROLE_META = {
  FOUNDER: { label:"Founder", icon:"🚀", color:"#63ffb4" },
  USER:    { label:"User",    icon:"🌐", color:"#60a5fa" },
  ADMIN:   { label:"Admin",   icon:"⚙",  color:"#f87171" },
};

export default function Login() {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  const { saveToken, saveStartupId } = useAuth();
  const toast    = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("Email and password are required."); return; }

    setLoading(true);
    try {
      // Step 1 — call backend
      const data = await loginApi(email, password);
      const accessToken  = data?.accessToken  ?? data?.token ?? data;
      const refreshToken = data?.refreshToken ?? null;

      // Step 2 — saveToken looks up role by THIS email specifically
      // Returns the correct role for this account, ignoring other accounts
      const role = saveToken(accessToken, refreshToken, email.trim().toLowerCase());

      console.log(`Login success — email: ${email} | role: ${role}`);

      const meta = ROLE_META[role] ?? ROLE_META.USER;
      toast.success(`Welcome back! Signed in as ${meta.label} ${meta.icon}`);

      // Step 3 — route by role
      if (role === "ADMIN") {
        navigate("/admin", { replace: true });

      } else if (role === "FOUNDER") {
        // Check if this founder already has startups
        try {
          const startups = await getMyStartupsApi();
          if (startups?.length > 0) {
            saveStartupId(startups[0].id);
            navigate("/dashboard", { replace: true });
          } else {
            navigate("/create", { replace: true });
          }
        } catch {
          // If API fails, check if we have a saved startup ID
          const saved = localStorage.getItem("fb_startup_id");
          navigate(saved ? "/dashboard" : "/create", { replace: true });
        }

      } else {
        // USER or unknown → explore
        navigate("/explore", { replace: true });
      }

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
        <div className="flex flex-col items-center gap-3">
          <Logo size="lg" />
          <p className="text-sm text-white/40 mt-1">Sign in to continue</p>
        </div>

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
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com" autoComplete="email"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#63ffb4]/50 focus:ring-1 focus:ring-[#63ffb4]/20 transition-all"/>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold tracking-widest uppercase text-white/40">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" autoComplete="current-password"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#63ffb4]/50 focus:ring-1 focus:ring-[#63ffb4]/20 transition-all"/>
            </div>
            <button type="submit" disabled={loading}
              className="w-full rounded-xl bg-[#63ffb4] text-[#080c10] font-bold text-sm py-3.5 hover:bg-[#4dffa8] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {loading
                ? <><div className="w-4 h-4 border-2 border-[#080c10]/30 border-t-[#080c10] rounded-full animate-spin"/>Signing in…</>
                : "Sign In →"}
            </button>
          </form>

          {/* Smart redirect info */}
          <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] px-4 py-3 space-y-1.5">
            <p className="text-[10px] text-white/25 font-semibold tracking-widest uppercase">Smart redirect after sign in</p>
            {[
              { icon:"🚀", role:"Founder", desc:"Dashboard (returning) or Create Startup (first time)", color:"#63ffb4" },
              { icon:"⚙",  role:"Admin",   desc:"Admin Panel",                                          color:"#f87171" },
              { icon:"🌐", role:"User",    desc:"Explore Page & Demo Dashboard",                        color:"#60a5fa" },
            ].map(({ icon, role, desc, color }) => (
              <div key={role} className="flex items-start gap-2 text-xs">
                <span className="shrink-0 mt-0.5">{icon}</span>
                <span className="font-semibold shrink-0" style={{ color }}>{role}</span>
                <span className="text-white/25">→ {desc}</span>
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