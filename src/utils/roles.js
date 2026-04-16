export const ROLES = {
  ADMIN:   "ADMIN",
  FOUNDER: "FOUNDER",
  USER:    "USER",
};

// Where each role goes immediately after login
export const ROLE_HOME = {
  ADMIN:   "/admin",
  FOUNDER: "/create",     // FOUNDER → create startup first
  USER:    "/dashboard",
};

// Feature flags
export const ROLE_FEATURES = {
  ADMIN: {
    canViewDashboard:   true,
    canViewBenchmark:   true,
    canCreateStartup:   false,
    canDeleteStartup:   true,
    canViewAdminPanel:  true,
  },
  FOUNDER: {
    canViewDashboard:   true,
    canViewBenchmark:   true,
    canCreateStartup:   true,
    canDeleteStartup:   false,
    canViewAdminPanel:  false,
  },
  USER: {
    canViewDashboard:   true,
    canViewBenchmark:   false,
    canCreateStartup:   false,
    canDeleteStartup:   false,
    canViewAdminPanel:  false,
  },
};

export function can(role, feature) {
  return ROLE_FEATURES[role]?.[feature] ?? false;
}

// Nav links shown per role
export function getNavLinks(role) {
  const all = [
    { to: "/create",    label: "New Startup",   icon: "✦", feature: "canCreateStartup"  },
    { to: "/dashboard", label: "Dashboard",      icon: "◈", feature: "canViewDashboard"  },
    { to: "/benchmark", label: "Benchmark",      icon: "⊞", feature: "canViewBenchmark"  },
    { to: "/admin",     label: "Admin Controls", icon: "⚙", feature: "canViewAdminPanel" },
  ];
  return all.filter((l) => can(role, l.feature));
}

// Visual metadata per role
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
    label: "User",    color: "#60a5fa",
    bg: "rgba(96,165,250,0.10)",  border: "rgba(96,165,250,0.25)",
    desc: "View-only access to dashboard",            icon: "👤",
  },
};

export function getRoleMeta(role) {
  return ROLE_META[role] ?? ROLE_META.USER;
}