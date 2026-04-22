import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import UpgradeModal from "../components/UpgradeModal";
import { gsap } from "gsap";
import Logo from "../components/Logo";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// ── SVG Icons ─────────────────────────────────────────────────────────────────
const Ic = {
  Shield:    (p={}) => <svg width={p.s??22} height={p.s??22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>,
  TrendUp:   (p={}) => <svg width={p.s??22} height={p.s??22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  Clock:     (p={}) => <svg width={p.s??22} height={p.s??22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  BarChart:  (p={}) => <svg width={p.s??22} height={p.s??22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  Zap:       (p={}) => <svg width={p.s??22} height={p.s??22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  Target:    (p={}) => <svg width={p.s??22} height={p.s??22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  Lock:      (p={}) => <svg width={p.s??14} height={p.s??14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  ArrowRight:(p={}) => <svg width={p.s??14} height={p.s??14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
  Star:      (p={}) => <svg width={p.s??13} height={p.s??13} viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  Check:     (p={}) => <svg width={p.s??13} height={p.s??13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  Activity:  (p={}) => <svg width={p.s??22} height={p.s??22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  Play:      (p={}) => <svg width={p.s??16} height={p.s??16} viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>,
};

// ── Interactive Particle Canvas ───────────────────────────────────────────────
function ParticleField() {
  const canvasRef = useRef(null);
  const animRef   = useRef(null);
  const mouseRef  = useRef({ x:-999, y:-999 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let W = canvas.width  = window.innerWidth;
    let H = canvas.height = window.innerHeight;

    const resize = () => {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", (e) => { mouseRef.current = { x:e.clientX, y:e.clientY }; });

    const N = 85;
    const pts = Array.from({ length:N }, (_, i) => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random()-0.5)*0.3, vy: (Math.random()-0.5)*0.3,
      r:  Math.random()*1.6+0.4,
      op: Math.random()*0.45+0.12,
      col: i%5===0 ? "#63ffb4" : i%8===0 ? "#60a5fa" : i%13===0 ? "#a78bfa" : "rgba(255,255,255,0.7)",
    }));

    const draw = () => {
      ctx.clearRect(0,0,W,H);
      const { x:mx, y:my } = mouseRef.current;
      pts.forEach((p) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x<0) p.x=W; if (p.x>W) p.x=0;
        if (p.y<0) p.y=H; if (p.y>H) p.y=0;
        const dx=p.x-mx, dy=p.y-my, d=Math.sqrt(dx*dx+dy*dy);
        if (d<160) { const f=(160-d)/160*0.7; p.x+=dx*f*0.04; p.y+=dy*f*0.04; }
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
        ctx.fillStyle=p.col; ctx.globalAlpha=p.op; ctx.fill();
      });
      ctx.globalAlpha=1;
      for (let i=0;i<N;i++) for (let j=i+1;j<N;j++) {
        const a=pts[i],b=pts[j],dx=a.x-b.x,dy=a.y-b.y,d=Math.sqrt(dx*dx+dy*dy);
        if (d<130) { ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.strokeStyle=`rgba(99,255,180,${(1-d/130)*0.15})`; ctx.lineWidth=0.5; ctx.stroke(); }
      }
      animRef.current=requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener("resize",resize); };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" style={{ opacity:0.6 }}/>;
}

// ── Mesh gradient + grid background ──────────────────────────────────────────
function MeshBG() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <div className="absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full animate-glowPulse" style={{ background:"radial-gradient(circle,rgba(99,255,180,0.08) 0%,transparent 68%)", filter:"blur(60px)" }}/>
      <div className="absolute -bottom-60 -right-60 w-[800px] h-[800px] rounded-full animate-glowPulse delay-500" style={{ background:"radial-gradient(circle,rgba(96,165,250,0.07) 0%,transparent 68%)", filter:"blur(80px)" }}/>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full animate-glowPulse delay-300" style={{ background:"radial-gradient(circle,rgba(167,139,250,0.05) 0%,transparent 65%)", filter:"blur(70px)" }}/>
      <div className="absolute top-1/3 right-1/3 w-[280px] h-[280px] rounded-full animate-float" style={{ background:"radial-gradient(circle,rgba(99,255,180,0.05) 0%,transparent 70%)", filter:"blur(40px)", animationDuration:"9s" }}/>
      <div className="absolute bottom-1/3 left-1/5 w-[220px] h-[220px] rounded-full animate-float delay-400" style={{ background:"radial-gradient(circle,rgba(96,165,250,0.05) 0%,transparent 70%)", filter:"blur(35px)", animationDuration:"11s" }}/>
      {/* Grid */}
      <div className="absolute inset-0" style={{ backgroundImage:"linear-gradient(rgba(99,255,180,0.022) 1px,transparent 1px),linear-gradient(90deg,rgba(99,255,180,0.022) 1px,transparent 1px)", backgroundSize:"60px 60px" }}/>
      {/* Vignettes */}
      <div className="absolute top-0 left-0 right-0 h-48" style={{ background:"linear-gradient(to bottom,rgba(8,12,16,0.85),transparent)" }}/>
      <div className="absolute bottom-0 left-0 right-0 h-48" style={{ background:"linear-gradient(to top,rgba(8,12,16,0.6),transparent)" }}/>
    </div>
  );
}

// ── Floating live dashboard preview ──────────────────────────────────────────
function DashPreview() {
  return (
    <div className="relative animate-float" style={{ animationDuration:"8s" }}>
      <div className="rounded-2xl border border-white/10 bg-[#0d1117]/90 backdrop-blur-2xl p-5 w-72 shadow-2xl"
        style={{ boxShadow:"0 30px 80px rgba(0,0,0,0.55),0 0 80px rgba(99,255,180,0.07)" }}>
        {/* Logo header row */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/[0.06]">
          <Logo size="sm" />
          <div className="flex items-center gap-1 px-2 py-1 rounded-full border border-[#63ffb4]/20 bg-[#63ffb4]/8">
            <span className="w-1.5 h-1.5 rounded-full bg-[#63ffb4] animate-pulse"/>
            <span className="text-[9px] font-mono text-[#63ffb4] tracking-widest">LIVE</span>
          </div>
        </div>
        {/* Health score row */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[10px] text-white/30 font-mono tracking-widest uppercase">Health Score</p>
            <p className="text-3xl font-black text-[#63ffb4] font-display">74<span className="text-sm text-white/25 font-sans">/100</span></p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#63ffb4]/10 border border-[#63ffb4]/20 flex items-center justify-center">
            <span className="text-[#63ffb4] text-xs font-black font-mono">ML</span>
          </div>
        </div>
        <div className="mb-4 space-y-1.5">
          <div className="flex justify-between text-[10px] text-white/30 font-mono">
            <span>Risk Level</span><span className="text-[#fbbf24] font-bold">MEDIUM</span>
          </div>
          <div className="h-2 rounded-full" style={{ background:"linear-gradient(90deg,#63ffb430,#fbbf2440,#f8717130)" }}>
            <div className="h-full w-2.5 rounded-full bg-[#fbbf24] ml-[42%]"/>
          </div>
          <div className="flex justify-between text-[9px] text-white/20 font-mono"><span>LOW</span><span>HIGH</span></div>
        </div>
        {[{l:"Growth",v:78,c:"#63ffb4"},{l:"Runway",v:52,c:"#60a5fa"},{l:"Burn",v:35,c:"#f87171"}].map(({ l,v,c }) => (
          <div key={l} className="flex items-center gap-2 mb-2">
            <span className="text-[10px] text-white/30 w-12 shrink-0 font-mono">{l}</span>
            <div className="flex-1 h-1.5 rounded-full bg-white/[0.06]"><div className="h-full rounded-full" style={{ width:`${v}%`,background:c }}/></div>
            <span className="text-[10px] font-bold w-7 text-right font-mono" style={{ color:c }}>{v}%</span>
          </div>
        ))}
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/[0.06]">
          <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#63ffb4] opacity-75"/><span className="relative inline-flex rounded-full h-2 w-2 bg-[#63ffb4]"/></span>
          <span className="text-[10px] text-white/30 font-mono">Live ML analysis running</span>
        </div>
      </div>
      {/* Floating satellite cards */}
      <div className="absolute -top-7 -right-8 rounded-xl border border-white/10 bg-[#0d1117]/90 backdrop-blur-xl px-3 py-2 shadow-xl animate-float" style={{ animationDuration:"5s",animationDelay:"1.2s" }}>
        <p className="text-[9px] text-white/30 font-mono">Monthly Growth</p>
        <p className="text-sm font-black text-[#63ffb4]">+12.4%</p>
      </div>
      <div className="absolute -bottom-5 -left-7 rounded-xl border border-white/10 bg-[#0d1117]/90 backdrop-blur-xl px-3 py-2 shadow-xl animate-float" style={{ animationDuration:"6.5s",animationDelay:"2.5s" }}>
        <p className="text-[9px] text-white/30 font-mono">Runway</p>
        <p className="text-sm font-black text-[#60a5fa]">8.3 mo</p>
      </div>
    </div>
  );
}

// ── Demo stat cards (mock data section) ───────────────────────────────────────
function DemoCards() {
  const cards = [
    { label:"Health Score",   value:"74/100", sub:"Above average",      color:"#63ffb4", icon:<Ic.Activity s={18}/> },
    { label:"Growth Rate",    value:"12.4%",  sub:"vs 9.1% industry",   color:"#60a5fa", icon:<Ic.TrendUp  s={18}/> },
    { label:"Cash Runway",    value:"8.3 mo", sub:"Critical at 3 mo",   color:"#fbbf24", icon:<Ic.Clock    s={18}/> },
    { label:"Risk Level",     value:"MEDIUM", sub:"87% ML confidence",  color:"#f87171", icon:<Ic.Shield   s={18}/> },
  ];
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {cards.map(({ label, value, sub, color, icon }, i) => (
        <div key={label}
          className="relative rounded-2xl border border-white/[0.07] p-5 overflow-hidden group hover:border-white/20 transition-all duration-300 animate-fadeInUp"
          style={{ background:"rgba(13,17,23,0.75)", backdropFilter:"blur(20px)", animationDelay:`${i*0.08}s` }}>
          {/* Top accent */}
          <div className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ background:`linear-gradient(90deg,transparent,${color}60,transparent)` }}/>
          {/* Hover glow */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none rounded-2xl"
            style={{ background:`radial-gradient(circle at 50% 0%,${color}08 0%,transparent 70%)` }}/>
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] text-white/30 font-mono tracking-widest uppercase">{label}</p>
              <span className="transition-colors duration-300" style={{ color }}>{icon}</span>
            </div>
            <p className="text-2xl font-black mb-1" style={{ color }}>{value}</p>
            <p className="text-[10px] text-white/30 font-mono">{sub}</p>
          </div>
          {/* DEMO badge */}
          <div className="absolute top-2 right-2 text-[8px] font-bold font-mono text-[#60a5fa]/50 tracking-widest">DEMO</div>
        </div>
      ))}
    </div>
  );
}

// ── Feature cards ─────────────────────────────────────────────────────────────
const FEATURES = [
  { IC:Ic.Shield,   title:"ML Risk Prediction",     tagline:"Know your risk before it's too late",           brief:"AI classifies startup risk in real time with confidence scores.",                         detail:"Our ML model analyses 12+ financial and operational signals — revenue trajectory, burn rate, cash coverage, user growth — and outputs a dynamic LOW / MEDIUM / HIGH risk classification with a 0–100% confidence score. Updates live on every dashboard refresh.",    color:"#63ffb4", metric:"87% avg confidence"    },
  { IC:Ic.TrendUp,  title:"Growth Rate Analytics",   tagline:"Measure what actually moves the needle",        brief:"Month-over-month growth tracked against your industry average.",                          detail:"FounderBrain calculates your precise MoM revenue growth and plots it against a live industry average for your sector. Spot growth stalls early, understand momentum drivers, and receive AI commentary on likely causes — act on data, not instinct.",              color:"#60a5fa", metric:"+3.3% above SaaS avg"  },
  { IC:Ic.Clock,    title:"Runway Projection",        tagline:"See exactly how long your cash lasts",          brief:"Cash burn modelled month by month with critical threshold alerts.",                       detail:"Our runway engine projects your burn curve month by month and plots a critical threshold at 20% cash remaining — the point most VCs call a 'fundraise now' signal. Coupled with AI action plans to extend runway through cost optimisation or revenue acceleration.", color:"#fbbf24", metric:"Accurate to ±0.3 months" },
  { IC:Ic.BarChart, title:"Industry Benchmark",       tagline:"Know exactly where you rank in your sector",    brief:"Your metrics vs sector peers shown side by side with deltas.",                             detail:"Compare your growth rate, runway, health score and risk level against aggregated benchmarks from startups in your exact industry vertical. Presented as bar charts and radar plots — perfect for investor updates and board decks.",                               color:"#a78bfa", metric:"12 industries tracked"   },
  { IC:Ic.Zap,      title:"Funding Suggestions",      tagline:"Strategic fundraising tailored to your stage",  brief:"AI-generated round size, timing and investor-type recommendations.",                      detail:"Based on your runway, growth trajectory, risk classification and industry norms, FounderBrain generates specific funding recommendations — suggested round size, timing, and investor type (Angel, Seed, Series A). Refreshes with every dashboard load.",          color:"#f87171", metric:"Refreshed on every load" },
  { IC:Ic.Target,   title:"Action Recommendations",   tagline:"Your AI co-pilot for startup decisions",        brief:"Personalised prioritised next steps generated from your live data.",                      detail:"After processing your metrics, the recommendation engine outputs concrete actions — e.g. 'Reduce burn by 15% to extend runway beyond 12 months'. Generated specifically from your numbers, not generic tips, updated in real time.",                             color:"#63ffb4", metric:"Context-aware, always fresh" },
];

function FeatureCard({ F, onUpgrade, i }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} onClick={onUpgrade}
      className="relative rounded-2xl border overflow-hidden cursor-pointer animate-fadeInUp"
      style={{
        borderColor:    hov ? `${F.color}45` : "rgba(255,255,255,0.07)",
        background:     hov ? "rgba(13,17,23,0.97)" : "rgba(13,17,23,0.72)",
        boxShadow:      hov ? `0 20px 60px rgba(0,0,0,0.4),0 0 40px ${F.color}10,inset 0 1px 0 ${F.color}20` : "0 4px 20px rgba(0,0,0,0.2)",
        backdropFilter: "blur(24px)",
        transform:      hov ? "translateY(-5px)" : "translateY(0)",
        transition:     "border-color 0.3s,background 0.3s,box-shadow 0.3s,transform 0.3s",
        minHeight:      240,
        animationDelay: `${i * 0.08}s`,
      }}>
      {/* Top shimmer */}
      <div className="absolute top-0 left-0 right-0 h-px transition-opacity duration-300"
        style={{ background:`linear-gradient(90deg,transparent,${F.color}65,transparent)`, opacity:hov?1:0 }}/>
      {/* Corner glow */}
      <div className="absolute inset-0 pointer-events-none rounded-2xl transition-opacity duration-400"
        style={{ background:`radial-gradient(circle at 20% 15%,${F.color}10 0%,transparent 60%)`, opacity:hov?1:0 }}/>
      {/* Lock */}
      <div className="absolute top-4 right-4 flex items-center gap-1 px-2 py-1 rounded-full border border-white/10 bg-black/30 backdrop-blur-sm">
        <Ic.Lock s={11}/><span className="text-[10px] text-white/30 font-mono font-semibold">Founder</span>
      </div>
      <div className="relative p-6 flex flex-col h-full">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 border"
          style={{ background:hov?`${F.color}18`:"rgba(255,255,255,0.05)", borderColor:hov?`${F.color}35`:"rgba(255,255,255,0.08)", color:hov?F.color:"rgba(255,255,255,0.45)", boxShadow:hov?`0 0 20px ${F.color}25`:"none" }}>
          <F.IC s={22}/>
        </div>
        <h3 className="text-base font-bold text-white mb-1">{F.title}</h3>
        <p className="text-xs font-semibold mb-3 transition-colors duration-300" style={{ color:hov?F.color:"rgba(255,255,255,0.38)" }}>{F.tagline}</p>
        <p className="text-xs leading-relaxed flex-1 transition-all duration-300" style={{ color:hov?"rgba(255,255,255,0.68)":"rgba(255,255,255,0.35)" }}>
          {hov ? F.detail : F.brief}
        </p>
        <div className="flex items-center justify-between mt-4 pt-3 border-t transition-colors duration-300"
          style={{ borderColor:hov?`${F.color}20`:"rgba(255,255,255,0.05)" }}>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border font-mono transition-all duration-300"
            style={{ color:hov?F.color:"rgba(255,255,255,0.22)", borderColor:hov?`${F.color}35`:"rgba(255,255,255,0.09)", background:hov?`${F.color}10`:"transparent" }}>
            {F.metric}
          </span>
          <span className="flex items-center gap-1 text-[11px] font-bold transition-all duration-200"
            style={{ color:hov?F.color:"rgba(255,255,255,0.18)", transform:hov?"translateX(2px)":"translateX(0)" }}>
            Unlock <Ic.ArrowRight s={11}/>
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Testimonials ──────────────────────────────────────────────────────────────
const TESTIMONIALS = [
  { name:"Priya Mehta",  role:"Co-founder, LogiStack",  company:"Logistics SaaS · Seed stage",
    text:"FounderBrain flagged MEDIUM risk 3 months before our runway got critical. That alert alone bought us time to close our Seed round.",
    result:"Closed $1.2M Seed round before runway hit 3 months" },
  { name:"Daniel Osei",  role:"CEO, HealthPilot",        company:"HealthTech · Pre-revenue",
    text:"The benchmark view showed we were 4% below SaaS growth average. We adjusted our pricing strategy and closed the gap within 6 weeks.",
    result:"Growth rate improved from 8.1% to 12.4% in 6 weeks" },
  { name:"Sofia Rao",    role:"Founder, EdFlux",          company:"EdTech · Post-launch",
    text:"I used to spend Sundays in spreadsheets. Now I check FounderBrain on Monday morning and my week's priorities are right there.",
    result:"Saved 4+ hours/week on financial reporting" },
];

// ── Step card with hover-expand detail ───────────────────────────────────────
function StepCard({ num, IC, color, title, brief, detail, isLast, index }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      className="ex-step-card relative rounded-2xl border overflow-hidden cursor-default animate-fadeInUp"

      style={{
        animationDelay: `${(index ?? 0) * 0.1}s`,
        borderColor:   hov ? `${color}40` : "rgba(255,255,255,0.07)",
        background:    hov ? "rgba(13,17,23,0.98)" : "rgba(13,17,23,0.72)",
        backdropFilter:"blur(20px)",
        boxShadow:     hov ? `0 20px 50px rgba(0,0,0,0.4), 0 0 30px ${color}10` : "0 4px 20px rgba(0,0,0,0.15)",
        transform:     hov ? "translateY(-5px)" : "translateY(0)",
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}>
      {/* Top gradient border */}
      <div className="absolute top-0 left-0 right-0 h-px transition-opacity duration-300"
        style={{ background:`linear-gradient(90deg,transparent,${color}60,transparent)`, opacity:hov?1:0 }}/>
      {/* BG glow */}
      <div className="absolute inset-0 pointer-events-none rounded-2xl transition-opacity duration-400"
        style={{ background:`radial-gradient(circle at 30% 20%,${color}09 0%,transparent 65%)`, opacity:hov?1:0 }}/>
      {/* Connector arrow between steps */}
      {!isLast && (
        <div className="hidden lg:block absolute top-8 -right-3 z-20">
          <svg width="24" height="12" viewBox="0 0 24 12" fill="none">
            <path d="M0 6 H18 M14 2 L22 6 L14 10" stroke={hov?color:"rgba(255,255,255,0.15)"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
              style={{ transition:"stroke 0.3s" }}/>
          </svg>
        </div>
      )}
      <div className="relative p-6 space-y-4">
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-black text-white/20 tracking-[0.2em] font-mono">{num}</span>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-300"
            style={{
              background:  hov ? `${color}18` : "rgba(255,255,255,0.05)",
              borderColor: hov ? `${color}35` : "rgba(255,255,255,0.09)",
              color:       hov ? color        : "rgba(255,255,255,0.4)",
              boxShadow:   hov ? `0 0 16px ${color}22` : "none",
            }}>
            <IC s={20}/>
          </div>
        </div>
        <div>
          <h3 className="text-sm font-bold text-white mb-2 transition-colors duration-300"
            style={{ color: hov ? "#ffffff" : "rgba(255,255,255,0.9)" }}>{title}</h3>
          {/* Toggle brief ↔ detail on hover */}
          <p className="text-xs leading-relaxed transition-all duration-300"
            style={{ color: hov ? "rgba(255,255,255,0.65)" : "rgba(255,255,255,0.38)" }}>
            {hov ? detail : brief}
          </p>
        </div>
        {/* Hover hint */}
        <div className="flex items-center gap-1.5 transition-opacity duration-300" style={{ opacity:hov?0:1 }}>
          <div className="w-1 h-1 rounded-full" style={{ background:color }}/>
          <span className="text-[10px] text-white/20 font-mono">Hover to learn more</span>
        </div>
      </div>
    </div>
  );
}

// ── Testimonial card with hover reveal result ─────────────────────────────────
function TestimonialCard({ name, role, company, text, result, index }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      className="ex-testimonial-card relative rounded-2xl border overflow-hidden cursor-default animate-fadeInUp"

      style={{
        animationDelay: `${(index ?? 0) * 0.12}s`,
        borderColor:    hov ? "rgba(99,255,180,0.30)" : "rgba(255,255,255,0.07)",
        background:     hov ? "rgba(13,17,23,0.98)"  : "rgba(13,17,23,0.72)",
        backdropFilter: "blur(20px)",
        transform:      hov ? "translateY(-4px)"     : "translateY(0)",
        boxShadow:      hov ? "0 20px 50px rgba(0,0,0,0.35), 0 0 30px rgba(99,255,180,0.07)" : "0 4px 20px rgba(0,0,0,0.15)",
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}>
      {/* Top green shimmer */}
      <div className="absolute top-0 left-0 right-0 h-px transition-opacity duration-300"
        style={{ background:"linear-gradient(90deg,transparent,rgba(99,255,180,0.55),transparent)", opacity:hov?1:0 }}/>
      <div className="relative p-6 space-y-4">
        {/* Stars */}
        <div className="flex gap-0.5">
          {[...Array(5)].map((_,j) => <span key={j} style={{ color:"#fbbf24" }}><Ic.Star s={13}/></span>)}
        </div>
        {/* Quote */}
        <p className="text-sm leading-relaxed italic transition-all duration-300"
          style={{ color: hov ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.50)" }}>
          "{text}"
        </p>
        {/* Hover result badge */}
        <div className="overflow-hidden transition-all duration-300" style={{ maxHeight: hov ? "60px" : "0px", opacity: hov ? 1 : 0 }}>
          <div className="flex items-start gap-2 rounded-xl border border-[#63ffb4]/20 bg-[#63ffb4]/8 px-3 py-2">
            <span className="text-[#63ffb4] mt-0.5 shrink-0"><Ic.Check s={12}/></span>
            <p className="text-[11px] text-[#63ffb4] font-semibold leading-snug">{result}</p>
          </div>
        </div>
        {/* Author */}
        <div className="pt-1 border-t transition-colors duration-300"
          style={{ borderColor: hov ? "rgba(99,255,180,0.12)" : "rgba(255,255,255,0.05)" }}>
          <p className="text-sm font-bold text-white">{name}</p>
          <p className="text-xs font-mono mt-0.5 transition-colors duration-300"
            style={{ color: hov ? "rgba(255,255,255,0.45)" : "rgba(255,255,255,0.28)" }}>{role}</p>
          <p className="text-[10px] font-mono mt-0.5 transition-colors duration-300"
            style={{ color: hov ? "rgba(99,255,180,0.55)" : "rgba(255,255,255,0.20)" }}>{company}</p>
        </div>
      </div>
    </div>
  );
}

// ── Platform highlights ───────────────────────────────────────────────────────
const PLATFORM_HIGHLIGHTS = [
  { icon:<Ic.Activity s={20}/>, title:"Real-time AI engine",    desc:"Processes 12 financial signals every time you refresh. No stale data, no manual exports." },
  { icon:<Ic.BarChart s={20}/>, title:"Industry intelligence",  desc:"Benchmark your metrics against 500+ startups across 12 industries tracked in our system." },
  { icon:<Ic.Shield s={20}/>,   title:"Investor-grade reports", desc:"Dashboards you can screenshot and drop straight into your next investor update or board deck." },
];

// ── Main page ─────────────────────────────────────────────────────────────────
export default function UserExplorePage() {
  const { email } = useAuth();
  const navigate  = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const heroRef = useRef(null);
  const pageRef = useRef(null);
  const name = email?.split("@")[0] ?? "Explorer";

  // GSAP hero entrance
  useEffect(() => {
    if (!heroRef.current) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults:{ ease:"power3.out" } });
      tl.from(".ex-badge",   { y:25, opacity:0, duration:0.55 })
        .from(".ex-h1",      { y:50, opacity:0, duration:0.8  }, "-=0.25")
        .from(".ex-sub",     { y:30, opacity:0, duration:0.7  }, "-=0.5")
        .from(".ex-problem", { y:28, opacity:0, duration:0.6  }, "-=0.45")
        .from(".ex-cta",     { y:20, opacity:0, duration:0.55 }, "-=0.4")
        .from(".ex-stats",   { y:18, opacity:0, duration:0.5  }, "-=0.35")
        .from(".ex-preview", { x:70, opacity:0, duration:0.9, ease:"power2.out" }, "-=0.75");
    }, heroRef);
    return () => ctx.revert();
  }, []);

  // Scroll triggers — only for section titles (cards use CSS animations now)
  useEffect(() => {
    if (!pageRef.current) return;
    const ctx = gsap.context(() => {
      const els = Array.from(pageRef.current.querySelectorAll(".ex-sec-title,.ex-platform-card,.ex-demo-label,.ex-cta-final"));
      if (!els.length) return;
      // Group by parent section so each section animates independently
      const groups = {};
      els.forEach((el) => {
        const section = el.closest("section") || el;
        const key = section.dataset?.gsapId || Math.random();
        section.dataset.gsapId = key;
        if (!groups[key]) groups[key] = [];
        groups[key].push(el);
      });
      Object.values(groups).forEach((group) => {
        gsap.fromTo(group,
          { y: 35, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.65, ease: "power3.out",
            stagger: 0.08, clearProps: "transform,opacity",
            scrollTrigger: { trigger: group[0], start: "top 90%", once: true },
          }
        );
      });
    }, pageRef);
    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen bg-[#080c10] pt-20 pb-32 px-4 overflow-x-hidden relative">

      {/* Backgrounds */}
      <MeshBG/>
      <ParticleField/>

      <div ref={pageRef} className="relative z-10 max-w-6xl mx-auto space-y-28">

        {/* ══ HERO ══ */}
        <section ref={heroRef} className="pt-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">

            {/* Left */}
            <div className="space-y-7">
              {/* Logo mark */}
              <div className="ex-badge">
                <Logo size="md" />
              </div>

              {/* Welcome badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#60a5fa]/25 bg-[#60a5fa]/8 text-[#60a5fa] text-xs font-mono tracking-widest"
                style={{ backdropFilter:"blur(20px)" }}>
                <span className="w-1.5 h-1.5 rounded-full bg-[#60a5fa] animate-pulse"/>
                WELCOME {name.toUpperCase()} · FREE EXPLORER TIER
              </div>

              {/* Headline — Instrument Serif display font */}
              <div className="space-y-3">
                <h1 className="ex-h1 font-display text-5xl sm:text-[62px] text-white leading-[1.04] tracking-tight">
                  The intelligence layer{" "}
                  <span className="italic" style={{ backgroundImage:"linear-gradient(135deg,#63ffb4 0%,#60a5fa 55%,#a78bfa 100%)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
                    startups were missing
                  </span>
                </h1>
                <p className="ex-sub text-lg text-white/45 leading-relaxed max-w-lg">
                  FounderBrain is an AI-powered analytics platform that gives early-stage founders the same data intelligence top-tier investors use — in real time, from your own numbers.
                </p>
              </div>

              {/* Problem statement */}
              <div className="ex-problem rounded-2xl border border-white/[0.07] px-6 py-5 space-y-2"
                style={{ background:"rgba(255,255,255,0.03)", backdropFilter:"blur(20px)" }}>
                <p className="text-[10px] font-bold tracking-widest uppercase text-white/30 font-mono">The problem we solve</p>
                <p className="text-sm text-white/50 leading-relaxed">
                  91% of startups that fail cite{" "}
                  <span className="text-white/80 font-semibold">cash mismanagement and lack of visibility</span>{" "}
                  as primary causes. Most founders discover they're in financial trouble only when it's too late to act.
                  FounderBrain gives you the dashboard your investors have — powered by ML, updated live.
                </p>
              </div>

              {/* CTAs */}
              <div className="ex-cta flex flex-wrap gap-3">
                <button onClick={() => setShowModal(true)}
                  className="relative group px-7 py-3.5 rounded-2xl font-bold text-sm overflow-hidden transition-all active:scale-95 flex items-center gap-2"
                  style={{ background:"linear-gradient(135deg,#63ffb4,#60a5fa)", color:"#080c10", boxShadow:"0 0 32px rgba(99,255,180,0.28)" }}>
                  <Ic.Zap s={15}/> Become a Founder — Free
                  <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-500 skew-x-12"/>
                </button>
                <button onClick={() => navigate("/demo-dashboard")}
                  className="px-7 py-3.5 rounded-2xl border border-white/15 text-white font-semibold text-sm transition-all hover:bg-white/8 hover:border-white/25 active:scale-95 flex items-center gap-2"
                  style={{ backdropFilter:"blur(20px)", background:"rgba(255,255,255,0.04)" }}>
                  <Ic.Play s={14}/> Explore Demo Dashboard
                </button>
              </div>

              {/* Stats */}
              <div className="ex-stats flex items-center gap-8 flex-wrap">
                {[
                  { v:"500+",  l:"Startups tracked",   c:"#63ffb4" },
                  { v:"98%",   l:"ML accuracy",         c:"#60a5fa" },
                  { v:"3.2K+", l:"Insights generated",  c:"#a78bfa" },
                ].map(({ v, l, c }) => (
                  <div key={l}>
                    <div className="text-2xl font-black" style={{ color:c }}>{v}</div>
                    <div className="text-[11px] text-white/30 mt-0.5 font-mono">{l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — floating dashboard */}
            <div className="ex-preview hidden lg:flex justify-center items-center">
              <DashPreview/>
            </div>
          </div>
        </section>

        {/* ══ PLATFORM HIGHLIGHTS ══ */}
        <section className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="ex-sec-title text-3xl font-bold text-white">What makes FounderBrain different</h2>
            <p className="ex-sec-title text-sm text-white/40 max-w-lg mx-auto">Not another spreadsheet template. A live AI engine built specifically for startup founders.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {PLATFORM_HIGHLIGHTS.map(({ icon, title, desc }, i) => (
              <div key={title}
                className="ex-platform-card rounded-2xl border border-white/[0.07] p-6 space-y-3 group hover:border-[#63ffb4]/25 transition-all duration-300"
                style={{ background:"rgba(13,17,23,0.72)", backdropFilter:"blur(20px)" }}>
                <div className="w-10 h-10 rounded-xl bg-[#63ffb4]/10 border border-[#63ffb4]/20 flex items-center justify-center text-[#63ffb4] group-hover:bg-[#63ffb4]/15 transition-all">
                  {icon}
                </div>
                <h3 className="text-sm font-bold text-white">{title}</h3>
                <p className="text-xs text-white/40 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ══ DEMO CARDS (mock data) ══ */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <div className="ex-demo-label inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#60a5fa]/25 bg-[#60a5fa]/8 text-[#60a5fa] text-xs font-mono tracking-widest"
              style={{ backdropFilter:"blur(20px)" }}>
              DEMO DATA — SAMPLE METRICS
            </div>
            <h2 className="ex-sec-title text-3xl font-bold text-white">This is what your dashboard looks like</h2>
            <p className="ex-sec-title text-sm text-white/40 max-w-md mx-auto">
              Live cards from a real Founder account. Become a Founder to see your actual numbers here.
            </p>
          </div>
          <DemoCards/>
          <div className="text-center">
            <button onClick={() => navigate("/demo-dashboard")}
              className="inline-flex items-center gap-2 px-7 py-3 rounded-2xl border border-[#60a5fa]/25 text-[#60a5fa] font-semibold text-sm transition-all hover:bg-[#60a5fa]/10 active:scale-95 font-mono"
              style={{ background:"rgba(96,165,250,0.05)", backdropFilter:"blur(20px)" }}>
              <Ic.Play s={13}/> See full demo dashboard with charts
            </button>
          </div>
        </section>

        {/* ══ FEATURE CARDS (hover for descriptions) ══ */}
        <section className="space-y-10">
          <div className="text-center space-y-3">
            <div className="ex-sec-title inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 text-white/40 text-xs font-mono tracking-widest"
              style={{ background:"rgba(255,255,255,0.04)", backdropFilter:"blur(20px)" }}>
              <Ic.Lock s={11}/> FOUNDER-ONLY FEATURES
            </div>
            <h2 className="ex-sec-title text-3xl sm:text-4xl font-bold text-white">Everything you unlock as a Founder</h2>
            <p className="ex-sec-title text-sm text-white/40 max-w-lg mx-auto">
              Hover any card for a detailed breakdown of what each feature does and how it helps your startup survive and scale.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((F, i) => <FeatureCard key={F.title} F={F} i={i} onUpgrade={() => setShowModal(true)}/>)}
          </div>

          <div className="text-center">
            <button onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl border border-[#63ffb4]/25 text-[#63ffb4] font-bold text-sm transition-all hover:bg-[#63ffb4]/10 active:scale-95"
              style={{ background:"rgba(99,255,180,0.05)", backdropFilter:"blur(20px)" }}>
              <Ic.Zap s={14}/> Unlock all 6 features as a Founder
            </button>
          </div>
        </section>

        {/* ══ HOW IT WORKS ══ */}
        <section className="space-y-10">
          <div className="text-center space-y-2">
            <h2 className="ex-sec-title text-3xl font-bold text-white">From data to decisions in 60 seconds</h2>
            <p className="ex-sec-title text-sm text-white/40 max-w-md mx-auto">No integrations, no setup call, no CSV uploads. Enter your numbers and your AI dashboard is live.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { num:"01", IC:Ic.BarChart, color:"#63ffb4", title:"Enter your metrics",
                brief:"Revenue, expenses, cash reserve, users. Takes under 2 minutes.",
                detail:"Input monthly revenue, last month's revenue, monthly expenses, cash reserve and active user count. No accounting software needed — just the numbers you already know. Designed to take under 2 minutes from first login to first dashboard." },
              { num:"02", IC:Ic.Shield, color:"#60a5fa", title:"AI analyses your data",
                brief:"ML model processes 12 signal dimensions in under 3 seconds.",
                detail:"Our proprietary ML model cross-references your 5 inputs across 12 derived signal dimensions — including MoM growth delta, burn coverage ratio, user efficiency score, and capital efficiency. It benchmarks each signal against your industry average and computes a risk classification with confidence score." },
              { num:"03", IC:Ic.TrendUp, color:"#a78bfa", title:"Get your dashboard",
                brief:"Health score, risk level, insights, benchmarks — all on one screen.",
                detail:"Your complete startup intelligence dashboard: overall health score (0–100), ML risk classification (LOW/MEDIUM/HIGH) with confidence, 6-month growth trend chart, runway burn projection, industry benchmark bars, AI-generated funding suggestions, and prioritised action recommendations. Updated live on every refresh." },
              { num:"04", IC:Ic.Target, color:"#fbbf24", title:"Take informed action",
                brief:"Follow AI recommendations. Return weekly to track progress.",
                detail:"The recommendation engine outputs 2–3 specific, prioritised actions based on your live data — not generic startup advice. Examples: 'Reduce monthly burn by $8k to extend runway past 12 months' or 'Your growth rate of 14.2% qualifies you for a Series A conversation — prepare a 12-month projection.' Return weekly to see how your decisions move your health score." },
            ].map(({ num, IC, color, title, brief, detail }, i) => (
              <StepCard key={num} num={num} IC={IC} color={color} title={title} brief={brief} detail={detail} isLast={i===3} index={i}/>
            ))}
          </div>
        </section>

        {/* ══ TESTIMONIALS ══ */}
        <section className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="ex-sec-title text-3xl font-bold text-white">Founders trust FounderBrain</h2>
            <p className="ex-sec-title text-sm text-white/40">From founders who upgraded from Explorer to Founder</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {TESTIMONIALS.map(({ name, role, text, company, result }, i) => (
              <TestimonialCard key={name} name={name} role={role} text={text} company={company} result={result} index={i}/>
            ))}
          </div>
        </section>

        {/* ══ FINAL CTA ══ */}
        <section className="ex-cta-final">
          <div className="relative rounded-3xl border border-[#63ffb4]/20 p-14 text-center overflow-hidden"
            style={{
              background:"linear-gradient(135deg,rgba(13,17,23,0.97) 0%,rgba(13,17,23,0.88) 100%)",
              backdropFilter:"blur(40px)",
              boxShadow:"0 0 100px rgba(99,255,180,0.07),inset 0 1px 0 rgba(99,255,180,0.15)",
            }}>
            <div className="absolute inset-0 rounded-3xl pointer-events-none" style={{ background:"radial-gradient(ellipse at 50% 0%,rgba(99,255,180,0.09) 0%,transparent 60%)" }}/>
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background:"linear-gradient(90deg,transparent,rgba(99,255,180,0.6),transparent)" }}/>
            <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background:"linear-gradient(90deg,transparent,rgba(96,165,250,0.3),transparent)" }}/>

            <div className="relative space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#63ffb4]/25 bg-[#63ffb4]/8 text-[#63ffb4] text-xs font-mono tracking-widest mb-2">
                FREE TO START
              </div>
              <h2 className="font-display text-4xl sm:text-5xl text-white leading-tight">
                Stop guessing.<br/>
                <span className="italic" style={{ backgroundImage:"linear-gradient(135deg,#63ffb4,#60a5fa)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
                  Start knowing.
                </span>
              </h2>
              <p className="text-sm text-white/45 max-w-md mx-auto leading-relaxed">
                Register as a Founder in 30 seconds. Enter your startup metrics. Get your complete AI health dashboard instantly — no credit card, no setup call, no friction.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <button onClick={() => setShowModal(true)}
                  className="inline-flex items-center gap-2 px-10 py-4 rounded-2xl font-bold text-sm active:scale-95 transition-all overflow-hidden relative group"
                  style={{ background:"linear-gradient(135deg,#63ffb4,#60a5fa)", color:"#080c10", boxShadow:"0 0 40px rgba(99,255,180,0.25)" }}>
                  <Ic.Zap s={16}/> Register as Founder — Free
                  <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-500 skew-x-12"/>
                </button>
                <button onClick={() => navigate("/demo-dashboard")}
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl border border-white/15 text-white/70 font-semibold text-sm hover:text-white hover:bg-white/8 transition-all active:scale-95"
                  style={{ backdropFilter:"blur(20px)" }}>
                  <Ic.BarChart s={16}/> See Demo First
                </button>
              </div>
              {/* Trust signals */}
              <div className="flex items-center justify-center gap-8 pt-4 flex-wrap">
                {["No credit card required","Free forever plan","Setup in 2 minutes"].map((t) => (
                  <div key={t} className="flex items-center gap-1.5 text-[11px] text-white/30 font-mono">
                    <span className="text-[#63ffb4]"><Ic.Check s={13}/></span>{t}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>

      {showModal && <UpgradeModal onClose={() => setShowModal(false)}/>}
    </div>
  );
}