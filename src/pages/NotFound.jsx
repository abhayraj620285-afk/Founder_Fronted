import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function NotFound() {
  const { token } = useAuth();
  return (
    <div className="min-h-screen bg-[#080c10] flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(99,255,180,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(99,255,180,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-[#63ffb4]/4 blur-[100px] pointer-events-none" />

      <div className="relative text-center space-y-6 animate-fadeIn">
        <div className="text-8xl font-black text-white/5 select-none tracking-tighter">404</div>
        <div className="-mt-8">
          <h1 className="text-2xl font-black text-white">Page not found</h1>
          <p className="text-sm text-white/40 mt-2">The page you're looking for doesn't exist.</p>
        </div>
        <Link
          to={token ? "/dashboard" : "/login"}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#63ffb4] text-[#080c10] font-bold text-sm hover:bg-[#4dffa8] transition-all"
        >
          ← {token ? "Back to Dashboard" : "Go to Login"}
        </Link>
      </div>
    </div>
  );
}