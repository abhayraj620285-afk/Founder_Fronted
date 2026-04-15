import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerApi } from "../api/api";
import { useToast } from "../context/ToastContext";
import { ErrorBanner } from "../components/UI";

export default function Register() {
  const [form, setForm]   = useState({ email: "", password: "", confirmPassword: "", role: "USER" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const toast             = useToast();
  const navigate          = useNavigate();
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.email || !form.password) { setError("Email and password are required."); return; }
    if (form.password !== form.confirmPassword) { setError("Passwords do not match."); return; }
    if (form.password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setLoading(true);
    try {
      await registerApi(form.email, form.password, form.role);
      toast.success("Account created! Please sign in.");
      navigate("/login");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080c10] flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(99,255,180,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(99,255,180,0.025)_1px,transparent_1px)] bg-[size:60px_60px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#63ffb4]/5 blur-[100px] pointer-events-none" />

      <div className="relative w-full max-w-sm space-y-8 animate-fadeIn">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#63ffb4]/20 bg-[#63ffb4]/5 text-[#63ffb4] text-xs font-mono tracking-widest mb-4">
            ✦ CREATE ACCOUNT
          </div>
          <h1 className="text-4xl font-black tracking-tight text-white">
            Founder<span className="text-[#63ffb4]">Brain</span>
          </h1>
          <p className="text-sm text-white/40">Start your analytics journey</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0d1117]/80 backdrop-blur-sm p-8 shadow-2xl space-y-5">
          <ErrorBanner message={error} onDismiss={() => setError("")} />
          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { key: "email", label: "Email", type: "email", placeholder: "founder@startup.com" },
              { key: "password", label: "Password", type: "password", placeholder: "Min. 6 characters" },
              { key: "confirmPassword", label: "Confirm Password", type: "password", placeholder: "Repeat password" },
            ].map(({ key, label, type, placeholder }) => (
              <div key={key} className="space-y-1.5">
                <label className="text-xs font-semibold tracking-widest uppercase text-white/40">{label}</label>
                <input
                  type={type} value={form[key]} onChange={set(key)} placeholder={placeholder}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#63ffb4]/50 focus:ring-1 focus:ring-[#63ffb4]/20 transition-all"
                />
              </div>
            ))}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold tracking-widest uppercase text-white/40">Role</label>
              <select
                value={form.role} onChange={set("role")}
                className="w-full bg-[#0d1117] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#63ffb4]/50 transition-all"
              >
                <option value="USER">USER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>
            <button
              type="submit" disabled={loading}
              className="w-full rounded-xl bg-[#63ffb4] text-[#080c10] font-bold text-sm py-3 tracking-wide hover:bg-[#4dffa8] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <><div className="w-4 h-4 border-2 border-[#080c10]/30 border-t-[#080c10] rounded-full animate-spin" />Creating account…</>
              ) : "Create Account →"}
            </button>
          </form>
          <p className="text-center text-xs text-white/30">
            Already have an account?{" "}
            <Link to="/login" className="text-[#63ffb4] hover:text-white transition-colors font-semibold">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}