import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { getMyStartupsApi } from "../api/api";
import { extractRole, isTokenExpired, extractEmail, debugToken } from "../utils/jwt";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("fb_token"));

  // Role: try JWT decode first, then fall back to what was saved at registration
  const [role, setRole] = useState(() =>
    extractRole(localStorage.getItem("fb_token"))
    ?? localStorage.getItem("fb_role")
    ?? null
  );

  const [email, setEmail] = useState(() =>
    extractEmail(localStorage.getItem("fb_token"))
    ?? localStorage.getItem("fb_email")
    ?? null
  );

  const [startups,        setStartups]        = useState([]);
  const [activeStartupId, setActiveStartupId] = useState(
    () => localStorage.getItem("fb_startup_id")
  );

  useEffect(() => {
    if (!token) return;
    if (isTokenExpired(token)) { logout(); return; }
    getMyStartupsApi()
      .then((list) => {
        setStartups(list);
        if (!activeStartupId && list.length > 0) {
          const id = String(list[0].id);
          setActiveStartupId(id);
          localStorage.setItem("fb_startup_id", id);
        }
      })
      .catch(() => {});
  }, [token]);

  /**
   * saveAuth — called after /auth/login.
   *
   * KEY BEHAVIOUR:
   * 1. Tries to decode role from JWT
   * 2. If JWT decode returns null, falls back to fb_role saved during registration
   * 3. Returns the final role string synchronously so Login can navigate immediately
   */
  const saveAuth = useCallback((data) => {
    const t = data.accessToken;

    debugToken(t); // logs full payload to console

    const jwtRole     = extractRole(t);
    const savedRole   = localStorage.getItem("fb_role"); // set during registration
    const finalRole   = jwtRole ?? savedRole ?? null;

    const decodedEmail = extractEmail(t);

    console.log("saveAuth → jwtRole:", jwtRole, "| savedRole:", savedRole, "| finalRole:", finalRole);

    localStorage.setItem("fb_token", t);
    if (data.refreshToken) localStorage.setItem("fb_refresh_token", data.refreshToken);
    if (finalRole)   localStorage.setItem("fb_role",  finalRole);
    if (decodedEmail) localStorage.setItem("fb_email", decodedEmail);

    setToken(t);
    setRole(finalRole);
    setEmail(decodedEmail);

    // Return role synchronously — Login uses this to navigate()
    return finalRole;
  }, []);

  /**
   * saveRegistrationRole — called during /register so the role is persisted
   * BEFORE login. This way even if JWT decode fails, we know the user's role.
   */
  const saveRegistrationRole = useCallback((selectedRole) => {
    localStorage.setItem("fb_role", selectedRole);
    console.log("saveRegistrationRole →", selectedRole);
  }, []);

  const saveStartupId = useCallback((id) => {
    const sid = String(id);
    localStorage.setItem("fb_startup_id", sid);
    setActiveStartupId(sid);
  }, []);

  const addStartup = useCallback((startup) => {
    if (!startup) return;
    setStartups((prev) => [...prev, startup]);
    if (startup.id) saveStartupId(startup.id);
  }, [saveStartupId]);

  const logout = useCallback(() => {
    ["fb_token","fb_refresh_token","fb_startup_id","fb_role","fb_email"]
      .forEach((k) => localStorage.removeItem(k));
    setToken(null);
    setRole(null);
    setEmail(null);
    setActiveStartupId(null);
    setStartups([]);
  }, []);

  return (
    <AuthContext.Provider value={{
      token, role, email,
      startups, activeStartupId,
      saveAuth, saveRegistrationRole,
      saveStartupId, addStartup, logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);