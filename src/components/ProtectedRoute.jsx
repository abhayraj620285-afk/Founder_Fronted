import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { can } from "../utils/roles";

// ── Access Denied screen ──────────────────────────────────────────────────────
function AccessDenied({ role, requiredRole }) {
  return (
    <div className="min-h-screen bg-[#080c10] flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(248,113,113,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(248,113,113,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-red-500/5 blur-[100px] pointer-events-none" />

      <div className="relative text-center space-y-6 animate-fadeIn max-w-md">
        {/* Icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/20">
          <span className="text-4xl">🔒</span>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-black text-white">Access Denied</h1>
          <p className="text-sm text-white/40 leading-relaxed">
            Your current role{" "}
            <span className="text-red-400 font-semibold">({role ?? "Unknown"})</span>{" "}
            does not have permission to view this page.
            {requiredRole && (
              <> This page requires the <span className="text-[#63ffb4] font-semibold">{requiredRole}</span> role.</>
            )}
          </p>
        </div>

        {/* Current role badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20">
          <span className="w-2 h-2 rounded-full bg-red-400" />
          <span className="text-sm text-red-400 font-semibold">Role: {role ?? "None"}</span>
        </div>

        <div className="flex items-center justify-center gap-3">
          <a
            href="/dashboard"
            className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white/60 hover:text-white hover:border-white/20 transition-all font-semibold"
          >
            ← Go to Dashboard
          </a>
          <a
            href="/login"
            className="px-5 py-2.5 rounded-xl bg-[#63ffb4] text-[#080c10] text-sm font-bold hover:bg-[#4dffa8] transition-all"
          >
            Switch Account
          </a>
        </div>
      </div>
    </div>
  );
}

// ── ProtectedRoute ────────────────────────────────────────────────────────────
/**
 * Usage:
 *   <ProtectedRoute>                          → just requires login
 *   <ProtectedRoute roles={["FOUNDER"]}>     → requires FOUNDER role
 *   <ProtectedRoute roles={["ADMIN","FOUNDER"]}> → either role
 *   <ProtectedRoute feature="canCreateStartup">  → feature-flag check
 */
export default function ProtectedRoute({ children, roles, feature }) {
  const { token, role } = useAuth();

  // Not logged in → redirect to login
  if (!token) return <Navigate to="/login" replace />;

  // Feature flag check
  if (feature && !can(role, feature)) {
    return <AccessDenied role={role} requiredRole={roles?.[0]} />;
  }

  // Role check — if roles array provided, user must have one of them
  if (roles && roles.length > 0) {
    const allowed = roles.map((r) => r.toUpperCase());
    if (!allowed.includes(role?.toUpperCase())) {
      return <AccessDenied role={role} requiredRole={roles.join(" or ")} />;
    }
  }

  return children;
}