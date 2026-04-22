/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        // Display / hero headings — Instrument Serif (editorial, high-end SaaS feel)
        // Used by: Notion, Framer, Linear for marketing headlines
        display: ["'Instrument Serif'", "Georgia", "serif"],

        // Body / UI — Plus Jakarta Sans (modern, geometric, clean)
        // Used by: Linear, Loom, Vercel dashboard
        sans: ["'Plus Jakarta Sans'", "system-ui", "sans-serif"],

        // Code / badges / data — JetBrains Mono
        // Used by: GitHub, Linear, Vercel for monospaced text
        mono: ["'JetBrains Mono'", "'Fira Code'", "monospace"],
      },
      colors: {
        brand: "#63ffb4",
      },
      animation: {
        "glowPulse":  "glowPulse 4s ease-in-out infinite",
        "float":      "float 7s ease-in-out infinite",
        "shimmer":    "shimmer 2.5s linear infinite",
        "borderGlow": "borderGlow 3s ease-in-out infinite",
        "spin-slow":  "spin 8s linear infinite",
        "fadeIn":     "fadeIn 0.5s ease both",
        "fadeInUp":   "fadeInUp 0.65s cubic-bezier(.22,1,.36,1) both",
        "scaleIn":    "scaleIn 0.4s cubic-bezier(.22,1,.36,1) both",
        "dropDown":   "dropDown 0.2s cubic-bezier(.4,0,.2,1) both",
        "slideIn":    "slideIn 0.25s cubic-bezier(.4,0,.2,1) both",
      },
      keyframes: {
        glowPulse:  { "0%,100%":{ opacity:"0.35" }, "50%":{ opacity:"0.78" } },
        float:      { "0%,100%":{ transform:"translateY(0px) rotate(0deg)" }, "33%":{ transform:"translateY(-10px) rotate(0.5deg)" }, "66%":{ transform:"translateY(-5px) rotate(-0.5deg)" } },
        shimmer:    { from:{ backgroundPosition:"200% 0" }, to:{ backgroundPosition:"-200% 0" } },
        borderGlow: { "0%,100%":{ boxShadow:"0 0 0 0 rgba(99,255,180,0)" }, "50%":{ boxShadow:"0 0 20px 2px rgba(99,255,180,0.15)" } },
        fadeIn:     { from:{ opacity:"0", transform:"translateY(12px)" }, to:{ opacity:"1", transform:"translateY(0)" } },
        fadeInUp:   { from:{ opacity:"0", transform:"translateY(26px)" }, to:{ opacity:"1", transform:"translateY(0)" } },
        scaleIn:    { from:{ opacity:"0", transform:"scale(0.93)" }, to:{ opacity:"1", transform:"scale(1)" } },
        dropDown:   { from:{ opacity:"0", transform:"translateY(-6px) scale(0.97)" }, to:{ opacity:"1", transform:"translateY(0) scale(1)" } },
        slideIn:    { from:{ opacity:"0", transform:"translateX(20px)" }, to:{ opacity:"1", transform:"translateX(0)" } },
      },
    },
  },
  plugins: [],
};