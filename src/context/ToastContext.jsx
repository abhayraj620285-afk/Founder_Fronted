import { createContext, useContext, useState, useCallback, useRef } from "react";

const ToastContext = createContext(null);

let idCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const dismiss = useCallback((id) => {
    clearTimeout(timers.current[id]);
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const toast = useCallback(
    (message, type = "info", duration = 4000) => {
      const id = ++idCounter;
      setToasts((t) => [...t, { id, message, type }]);
      timers.current[id] = setTimeout(() => dismiss(id), duration);
      return id;
    },
    [dismiss]
  );

  const success = useCallback((m, d) => toast(m, "success", d), [toast]);
  const error   = useCallback((m, d) => toast(m, "error", d), [toast]);
  const info    = useCallback((m, d) => toast(m, "info", d), [toast]);
  const warn    = useCallback((m, d) => toast(m, "warn", d), [toast]);

  return (
    <ToastContext.Provider value={{ toast, success, error, info, warn }}>
      {children}
      {/* Toast container */}
      <div className="fixed top-4 right-4 z-[999] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <ToastItem key={t.id} {...t} onDismiss={() => dismiss(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

const STYLES = {
  success: {
    bar: "bg-[#63ffb4]",
    icon: "✓",
    iconBg: "bg-[#63ffb4]/20 text-[#63ffb4]",
    border: "border-[#63ffb4]/20",
  },
  error: {
    bar: "bg-red-500",
    icon: "✕",
    iconBg: "bg-red-500/20 text-red-400",
    border: "border-red-500/20",
  },
  warn: {
    bar: "bg-amber-400",
    icon: "⚠",
    iconBg: "bg-amber-400/20 text-amber-400",
    border: "border-amber-400/20",
  },
  info: {
    bar: "bg-blue-400",
    icon: "ℹ",
    iconBg: "bg-blue-400/20 text-blue-400",
    border: "border-blue-400/20",
  },
};

function ToastItem({ message, type, onDismiss }) {
  const s = STYLES[type] || STYLES.info;
  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 min-w-[280px] max-w-sm rounded-xl border ${s.border} bg-[#0d1117]/95 backdrop-blur-xl px-4 py-3 shadow-2xl animate-slideIn`}
    >
      <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${s.iconBg}`}>
        {s.icon}
      </span>
      <p className="flex-1 text-sm text-white/80 leading-snug">{message}</p>
      <button
        onClick={onDismiss}
        className="shrink-0 text-white/20 hover:text-white/60 transition-colors text-lg leading-none mt-0.5"
      >
        ×
      </button>
      <div className={`absolute bottom-0 left-0 h-[2px] w-full rounded-b-xl ${s.bar} opacity-60`} />
    </div>
  );
}

export const useToast = () => useContext(ToastContext);