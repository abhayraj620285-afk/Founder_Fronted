import { useAuth } from "../context/AuthContext";
import { decodeToken, tokenSummary, extractRole } from "../utils/jwt";
import { getRoleMeta } from "../utils/roles";

/**
 * TokenDebug — development utility page.
 * Shows the decoded JWT payload, role, and all claims.
 * Route: /debug/token
 * ⚠ Remove this route before deploying to production.
 */
export default function TokenDebug() {
  const { token, role, email } = useAuth();
  const payload = decodeToken(token);
  const summary = tokenSummary(token);
  const meta    = getRoleMeta(role);

  if (!token) {
    return (
      <div className="min-h-screen bg-[#080c10] pt-20 flex items-center justify-center">
        <p className="text-white/30 text-sm">No token found. Please log in first.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080c10] pt-20 pb-16 px-4">
      <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn">

        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-400/20 bg-amber-400/5 text-amber-400 text-xs font-mono tracking-widest mb-3">
            🔧 DEV UTILITY — REMOVE IN PRODUCTION
          </div>
          <h1 className="text-2xl font-black text-white">JWT Token Inspector</h1>
          <p className="text-sm text-white/30 mt-1">Decoded claims from your current session token</p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label:"Role",    value: summary?.role  ?? "NOT FOUND", color: summary?.role ? meta.color : "#f87171" },
            { label:"Email",   value: summary?.email ?? "—",          color: "#60a5fa" },
            { label:"Expires", value: summary?.exp   ?? "—",          color: "#fbbf24" },
            { label:"Status",  value: summary?.expired ? "EXPIRED" : "VALID",
              color: summary?.expired ? "#f87171" : "#63ffb4" },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-xl border border-white/[0.07] bg-[#0d1117]/90 p-4 space-y-1">
              <div className="text-[10px] text-white/30 tracking-widest uppercase font-semibold">{label}</div>
              <div className="text-sm font-bold break-all" style={{ color }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Role badge */}
        <div className="rounded-xl border border-white/[0.07] bg-[#0d1117]/90 p-5 space-y-3">
          <div className="text-[10px] text-white/30 tracking-widest uppercase font-semibold">Active Role</div>
          {role ? (
            <div className="flex items-center gap-3">
              <span
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-black tracking-widest uppercase"
                style={{ color: meta.color, background: meta.bg, borderColor: meta.border }}
              >
                <span className="w-2 h-2 rounded-full" style={{ background: meta.color }} />
                {meta.label}
              </span>
              <span className="text-xs text-white/30">{meta.desc}</span>
            </div>
          ) : (
            <div className="text-sm text-red-400 font-semibold">
              ⚠ Role could not be extracted from JWT.
              Check the raw payload below and share it so the decoder can be fixed.
            </div>
          )}
        </div>

        {/* Raw payload */}
        <div className="rounded-xl border border-white/[0.07] bg-[#0d1117]/90 overflow-hidden">
          <div className="px-5 py-3 border-b border-white/[0.06] flex items-center justify-between">
            <span className="text-[10px] text-white/30 tracking-widest uppercase font-semibold">
              Raw JWT Payload — copy and paste this if role is wrong
            </span>
            <button
              onClick={() => navigator.clipboard.writeText(JSON.stringify(payload, null, 2))}
              className="text-xs text-white/30 hover:text-[#63ffb4] transition-colors font-semibold"
            >
              Copy JSON
            </button>
          </div>
          <pre className="p-5 text-xs text-[#63ffb4]/80 font-mono overflow-x-auto leading-relaxed whitespace-pre-wrap break-all">
            {JSON.stringify(payload, null, 2)}
          </pre>
        </div>

        {/* Raw token */}
        <div className="rounded-xl border border-white/[0.07] bg-[#0d1117]/90 overflow-hidden">
          <div className="px-5 py-3 border-b border-white/[0.06] flex items-center justify-between">
            <span className="text-[10px] text-white/30 tracking-widest uppercase font-semibold">Raw Token</span>
            <button
              onClick={() => navigator.clipboard.writeText(token)}
              className="text-xs text-white/30 hover:text-[#63ffb4] transition-colors font-semibold"
            >
              Copy Token
            </button>
          </div>
          <p className="p-5 text-[10px] text-white/20 font-mono break-all leading-relaxed">{token}</p>
        </div>

        <p className="text-center text-xs text-amber-400/40">
          ⚠ Remove the /debug/token route before deploying to production
        </p>
      </div>
    </div>
  );
}