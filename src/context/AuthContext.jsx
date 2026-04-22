import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { getMyStartupsApi } from "../api/api";
import { isTokenExpired, extractEmail } from "../utils/jwt";

const AuthContext = createContext(null);

// ── Per-email role store ───────────────────────────────────────────────────────
// Stores roles as: { "alice@x.com": "FOUNDER", "bob@y.com": "USER" }
// This prevents cross-account role pollution completely.
const ROLE_MAP_KEY = "fb_role_map";

function getRoleMap() {
  try { return JSON.parse(localStorage.getItem(ROLE_MAP_KEY) || "{}"); }
  catch { return {}; }
}

function saveRoleForEmail(email, role) {
  if (!email || !role) return;
  const map = getRoleMap();
  map[email.toLowerCase()] = role;
  localStorage.setItem(ROLE_MAP_KEY, JSON.stringify(map));
}

function getRoleForEmail(email) {
  if (!email) return null;
  return getRoleMap()[email.toLowerCase()] ?? null;
}

// ── Provider ──────────────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [token, setToken] = useState(
    () => localStorage.getItem("fb_token")
  );
  const [role, setRole] = useState(
    () => {
      const t = localStorage.getItem("fb_token");
      if (!t) return null;
      const em = extractEmail(t);
      return getRoleForEmail(em) ?? localStorage.getItem("fb_role") ?? null;
    }
  );
  const [email, setEmail] = useState(
    () => extractEmail(localStorage.getItem("fb_token")) ?? localStorage.getItem("fb_email") ?? null
  );
  const [startups,        setStartups]        = useState([]);
  const [startupsLoaded,  setStartupsLoaded]  = useState(false);
  const [activeStartupId, setActiveStartupId] = useState(
    () => localStorage.getItem("fb_startup_id")
  );

  const loadStartups = useCallback(async (t) => {
    if (!t || isTokenExpired(t)) { setStartupsLoaded(true); return; }
    const em = extractEmail(t) ?? localStorage.getItem("fb_email");
    const r  = getRoleForEmail(em) ?? localStorage.getItem("fb_role");
    // Only FOUNDER has startups — skip API call for USER/ADMIN
    if (r !== "FOUNDER") { setStartupsLoaded(true); return; }
    try {
      const list = await getMyStartupsApi();
      setStartups(list);
      const stored = localStorage.getItem("fb_startup_id");
      if (list.length > 0 && !list.find((s) => String(s.id) === String(stored))) {
        const id = String(list[0].id);
        setActiveStartupId(id);
        localStorage.setItem("fb_startup_id", id);
      } else if (list.length === 0) {
        localStorage.removeItem("fb_startup_id");
        setActiveStartupId(null);
      }
    } catch {}
    finally { setStartupsLoaded(true); }
  }, []);

  useEffect(() => { loadStartups(token); }, [token]);

  /**
   * saveToken — called at login time.
   * Looks up the role for this email from the per-email map.
   * Returns the role synchronously so Login.jsx can navigate immediately.
   */
  const saveToken = useCallback((accessToken, refreshToken, loginEmail) => {
    localStorage.setItem("fb_token", accessToken);
    if (refreshToken) localStorage.setItem("fb_refresh_token", refreshToken);

    const em = loginEmail?.toLowerCase()
      ?? extractEmail(accessToken)?.toLowerCase()
      ?? null;

    // Get role for THIS specific email — not global
    const r = getRoleForEmail(em) ?? localStorage.getItem("fb_role") ?? null;

    if (em) { localStorage.setItem("fb_email", em); setEmail(em); }
    if (r)  { localStorage.setItem("fb_role",  r);  }

    setToken(accessToken);
    setRole(r);

    console.log(`saveToken — email: ${em} | role: ${r}`);
    return r;
  }, []);

  /**
   * saveRegistrationRole — called at register time.
   * Stores role keyed by email so it survives multi-account switching.
   */
  const saveRegistrationRole = useCallback((email, role) => {
    saveRoleForEmail(email, role);
    // Also write legacy key so saveToken fallback works
    localStorage.setItem("fb_role", role);
    setRole(role);
    console.log(`saveRegistrationRole — ${email} → ${role}`);
  }, []);

  const saveStartupId = useCallback((id) => {
    const sid = String(id);
    localStorage.setItem("fb_startup_id", sid);
    setActiveStartupId(sid);
  }, []);

  const addStartup = useCallback((startup) => {
    if (!startup) return;
    setStartups((prev) =>
      prev.find((s) => String(s.id) === String(startup.id)) ? prev : [...prev, startup]
    );
    if (startup.id) saveStartupId(startup.id);
  }, [saveStartupId]);

  const refreshStartups = useCallback(
    () => loadStartups(localStorage.getItem("fb_token")),
    [loadStartups]
  );

  const logout = useCallback(() => {
    ["fb_token","fb_refresh_token","fb_startup_id","fb_role","fb_email"]
      .forEach((k) => localStorage.removeItem(k));
    // Note: we intentionally keep fb_role_map so roles persist across sessions
    setToken(null); setRole(null); setEmail(null);
    setActiveStartupId(null); setStartups([]);
    setStartupsLoaded(false);
  }, []);

  return (
    <AuthContext.Provider value={{
      token, role, email,
      startups, startupsLoaded,
      activeStartupId,
      hasStartups: startups.length > 0,
      saveToken, saveRegistrationRole,
      saveStartupId, addStartup,
      refreshStartups, logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);