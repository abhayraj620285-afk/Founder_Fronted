// Wraps every authenticated page with consistent background + max-width

export default function PageShell({ children, maxWidth = "max-w-6xl" }) {
  return (
    <div className="min-h-screen bg-[#080c10] pt-20 pb-16 px-4 relative overflow-x-hidden">
      {/* Grid background */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(99,255,180,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(99,255,180,0.015)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none" />
      <div className={`relative ${maxWidth} mx-auto space-y-8 animate-fadeIn`}>
        {children}
      </div>
    </div>
  );
}
