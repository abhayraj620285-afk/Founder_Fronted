export default function SectionHeader({ tag, title, subtitle, accent = "#63ffb4", action }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
      <div>
        {tag && (
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-mono tracking-widest mb-3"
            style={{ borderColor: `${accent}30`, background: `${accent}08`, color: accent }}
          >
            {tag}
          </div>
        )}
        <h1 className="text-3xl font-black tracking-tight text-white">{title}</h1>
        {subtitle && <p className="text-sm text-white/40 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="self-start sm:self-end">{action}</div>}
    </div>
  );
}