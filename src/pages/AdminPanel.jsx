import { useState, useEffect } from "react";
import { getAllStartupsApi, deleteStartupApi } from "../api/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { getRoleMeta, ROLES } from "../utils/roles";

function ConfirmModal({ startup, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#0d1117] border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4 animate-fadeIn">
        <div className="flex items-center gap-3">
          <span className="text-2xl">⚠️</span>
          <h3 className="text-lg font-black text-white">Delete Startup?</h3>
        </div>
        <p className="text-sm text-white/50 leading-relaxed">
          This will permanently delete <span className="text-white font-semibold">"{startup.name}"</span> and all its data. This action cannot be undone.
        </p>
        <div className="flex gap-3 pt-1">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-white/10 text-sm text-white/50 hover:text-white hover:border-white/20 transition-all font-semibold">
            Cancel
          </button>
          <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl bg-red-500/80 hover:bg-red-500 text-white text-sm font-bold transition-all">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function StatPill({ label, value, color = "#63ffb4" }) {
  return (
    <div className="text-center">
      <div className="text-2xl font-black tabular-nums" style={{ color }}>{value}</div>
      <div className="text-[10px] text-white/30 tracking-widest uppercase">{label}</div>
    </div>
  );
}

export default function AdminPanel() {
  const { role } = useAuth();
  const toast    = useToast();
  const meta     = getRoleMeta(ROLES.ADMIN);

  const [startups,    setStartups]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState("");
  const [toDelete,    setToDelete]    = useState(null);
  const [deleting,    setDeleting]    = useState(null);

  useEffect(() => {
    getAllStartupsApi()
      .then(setStartups)
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async () => {
    if (!toDelete) return;
    setDeleting(toDelete.id);
    try {
      await deleteStartupApi(toDelete.id);
      setStartups((prev) => prev.filter((s) => s.id !== toDelete.id));
      toast.success(`"${toDelete.name}" deleted.`);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setDeleting(null);
      setToDelete(null);
    }
  };

  const filtered = startups.filter((s) =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.industry?.toLowerCase().includes(search.toLowerCase())
  );

  const industries = [...new Set(startups.map((s) => s.industry).filter(Boolean))];

  return (
    <div className="min-h-screen bg-[#080c10] pt-20 pb-16 px-4 relative overflow-hidden">
      <div className="fixed inset-0 bg-[linear-gradient(rgba(248,113,113,0.012)_1px,transparent_1px),linear-gradient(90deg,rgba(248,113,113,0.012)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none" />

      {toDelete && (
        <ConfirmModal
          startup={toDelete}
          onConfirm={handleDelete}
          onCancel={() => setToDelete(null)}
        />
      )}

      <div className="relative max-w-6xl mx-auto space-y-8 animate-fadeIn">

        {/* Header */}
        <div>
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-mono tracking-widest mb-3"
            style={{ color: meta.color, background: meta.bg, borderColor: meta.border }}
          >
            ⚙ ADMIN CONTROLS
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white">Platform Overview</h1>
          <p className="text-sm text-white/40 mt-0.5">Manage all startups across the platform</p>
        </div>

        {/* Stats row */}
        {!loading && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label:"Total Startups",  value: startups.length,                                 color:"#63ffb4" },
              { label:"Industries",      value: industries.length,                               color:"#60a5fa" },
              { label:"Avg Health",      value: startups.length ? Math.round(startups.reduce((a,s)=>a+(s.healthScore??0),0)/startups.length) : "—", color:"#fbbf24" },
              { label:"HIGH Risk",       value: startups.filter((s)=>s.riskLevel==="HIGH").length, color:"#f87171" },
            ].map(({ label, value, color }) => (
              <div key={label} className="rounded-2xl border border-white/[0.07] bg-[#0d1117]/90 p-5 text-center">
                <StatPill label={label} value={value} color={color} />
              </div>
            ))}
          </div>
        )}

        {/* Search */}
        <div className="flex gap-3">
          <div className="relative flex-1 max-w-sm">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25 text-sm">⌕</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or industry…"
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-red-400/40 focus:ring-1 focus:ring-red-400/10 transition-all"
            />
          </div>
          <div className="text-xs text-white/25 self-center">{filtered.length} result{filtered.length !== 1 ? "s" : ""}</div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center h-40 gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-[#f87171]/20 border-t-[#f87171] animate-spin" />
            <span className="text-xs text-white/30 tracking-widest uppercase">Loading startups…</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-white/25 text-sm">No startups found.</div>
        ) : (
          <div className="rounded-2xl border border-white/[0.07] bg-[#0d1117]/90 overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-4 px-5 py-3 border-b border-white/[0.06] text-[10px] font-bold tracking-widest uppercase text-white/25">
              <span>Startup</span>
              <span>Industry</span>
              <span>Health</span>
              <span>Risk</span>
              <span>Runway</span>
              <span />
            </div>

            {/* Rows */}
            {filtered.map((s, i) => {
              const riskColors = { LOW:"#63ffb4", MEDIUM:"#fbbf24", HIGH:"#f87171" };
              const rc = riskColors[s.riskLevel] ?? "#60a5fa";
              return (
                <div
                  key={s.id}
                  className={`grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-4 items-center px-5 py-4 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors ${deleting === s.id ? "opacity-40" : ""}`}
                >
                  {/* Name + ID */}
                  <div>
                    <div className="text-sm font-semibold text-white">{s.name}</div>
                    <div className="text-[10px] text-white/25 font-mono">ID: {s.id}</div>
                  </div>

                  {/* Industry */}
                  <span className="text-xs text-white/50">{s.industry ?? "—"}</span>

                  {/* Health */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-white/[0.07] overflow-hidden max-w-[60px]">
                      <div className="h-full rounded-full" style={{ width:`${s.healthScore ?? 0}%`, background: (s.healthScore??0)>=70?"#63ffb4":(s.healthScore??0)>=40?"#fbbf24":"#f87171" }} />
                    </div>
                    <span className="text-xs font-bold text-white/60">{s.healthScore ?? "—"}</span>
                  </div>

                  {/* Risk */}
                  <span
                    className="text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full border w-fit"
                    style={{ color: rc, borderColor:`${rc}30`, background:`${rc}10` }}
                  >
                    {s.riskLevel ?? "—"}
                  </span>

                  {/* Runway */}
                  <span className="text-xs text-white/50">{s.runwayMonths ? `${s.runwayMonths?.toFixed(1)} mo` : "—"}</span>

                  {/* Delete */}
                  <button
                    onClick={() => setToDelete(s)}
                    disabled={deleting === s.id}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-red-400/60 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all disabled:opacity-30"
                  >
                    {deleting === s.id ? "…" : "Delete"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}