export const ROLES = {
  ADMIN:   "ADMIN",
  FOUNDER: "FOUNDER",
  USER:    "USER",
};

export const ROLE_HOME = {
  ADMIN:   "/admin",
  FOUNDER: "/create",    // overridden in Login.jsx if startups exist
  USER:    "/explore",   // USER → explore page, NOT dashboard
};

export const ROLE_FEATURES = {
  ADMIN: {
    canViewDashboard:   true,
    canViewBenchmark:   true,
    canCreateStartup:   false,
    canDeleteStartup:   true,
    canViewAdminPanel:  true,
    canViewExplore:     false,
    canViewDemoDashboard: false,
  },
  FOUNDER: {
    canViewDashboard:   true,
    canViewBenchmark:   true,
    canCreateStartup:   true,
    canDeleteStartup:   false,
    canViewAdminPanel:  false,
    canViewExplore:     false,
    canViewDemoDashboard: false,
  },
  USER: {
    canViewDashboard:   false,   // no real dashboard
    canViewBenchmark:   false,
    canCreateStartup:   false,
    canDeleteStartup:   false,
    canViewAdminPanel:  false,
    canViewExplore:     true,
    canViewDemoDashboard: true,
  },
};

export function can(role, feature) {
  return ROLE_FEATURES[role]?.[feature] ?? false;
}

export function getNavLinks(role) {
  const all = [
    { to: "/explore",        label: "Explore",        icon: "◉", feature: "canViewExplore"      },
    { to: "/demo-dashboard", label: "Demo Dashboard", icon: "◈", feature: "canViewDemoDashboard" },
    { to: "/create",         label: "New Startup",    icon: "✦", feature: "canCreateStartup"     },
    { to: "/dashboard",      label: "Dashboard",      icon: "◈", feature: "canViewDashboard"     },
    { to: "/benchmark",      label: "Benchmark",      icon: "⊞", feature: "canViewBenchmark"     },
    { to: "/admin",          label: "Admin Controls", icon: "⚙", feature: "canViewAdminPanel"    },
  ];
  return all.filter((l) => can(role, l.feature));
}

export const ROLE_META = {
  ADMIN: {
    label: "Admin",   color: "#f87171",
    bg: "rgba(248,113,113,0.10)", border: "rgba(248,113,113,0.25)",
    desc: "Full platform access — manage all startups", icon: "⚙",
  },
  FOUNDER: {
    label: "Founder", color: "#63ffb4",
    bg: "rgba(99,255,180,0.10)",  border: "rgba(99,255,180,0.25)",
    desc: "Create and manage your startup analytics",  icon: "🚀",
  },
  USER: {
    label: "Explorer", color: "#60a5fa",
    bg: "rgba(96,165,250,0.10)",  border: "rgba(96,165,250,0.25)",
    desc: "Exploring the platform — upgrade to unlock full access", icon: "🌐",
  },
};

export function getRoleMeta(role) {
  return ROLE_META[role] ?? ROLE_META.USER;
}