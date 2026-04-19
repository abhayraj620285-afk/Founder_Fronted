import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { getMyStartupsApi } from "../api/api";
import { isTokenExpired, extractEmail } from "../utils/jwt";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token,           setToken]           = useState(() => localStorage.getItem("fb_token"));
  const [role,            setRole]            = useState(() => localStorage.getItem("fb_role"));
  const [email,           setEmail]           = useState(() => localStorage.getItem("fb_email"));
  const [startups,        setStartups]        = useState([]);
  const [startupsLoaded,  setStartupsLoaded]  = useState(false);
  const [activeStartupId, setActiveStartupId] = useState(() => localStorage.getItem("fb_startup_id"));

  useEffect(() => {
    if (!token || isTokenExpired(token)) { setStartupsLoaded(true); return; }
    // Only load startups for FOUNDER — USER will get 403
    const currentRole = localStorage.getItem("fb_role");
    if (currentRole !== "FOUNDER") { setStartupsLoaded(true); return; }

    getMyStartupsApi()
      .then((list) => {
        setStartups(list);
        const stored = localStorage.getItem("fb_startup_id");
        if (list.length > 0 && !list.find((s) => String(s.id) === String(stored))) {
          const id = String(list[0].id);
          setActiveStartupId(id);
          localStorage.setItem("fb_startup_id", id);
        }
      })
      .catch(() => {})
      .finally(() => setStartupsLoaded(true));
  }, [token]);

  /**
   * setRoleAndPersist — called at Register time when user picks their role.
   * This is the ONLY place role is set. Login never changes it.
   */
  const setRoleAndPersist = useCallback((r) => {
    localStorage.setItem("fb_role", r);
    setRole(r);
  }, []);

  /**
   * saveToken — called at Login time. Only saves token, nothing else.
   * Role is already correct from registration.
   */
  const saveToken = useCallback((accessToken, refreshToken) => {
    localStorage.setItem("fb_token", accessToken);
    if (refreshToken) localStorage.setItem("fb_refresh_token", refreshToken);
    const em = extractEmail(accessToken);
    if (em) { localStorage.setItem("fb_email", em); setEmail(em); }
    setToken(accessToken);
  }, []);

  const saveStartupId = useCallback((id) => {
    const sid = String(id);
    localStorage.setItem("fb_startup_id", sid);
    setActiveStartupId(sid);
  }, []);

  const addStartup = useCallback((startup) => {
    if (!startup) return;
    setStartups((prev) => prev.find((s) => String(s.id) === String(startup.id)) ? prev : [...prev, startup]);
    if (startup.id) saveStartupId(startup.id);
  }, [saveStartupId]);

  const logout = useCallback(() => {
    ["fb_token","fb_refresh_token","fb_startup_id","fb_role","fb_email"]
      .forEach((k) => localStorage.removeItem(k));
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
      setRoleAndPersist, saveToken,
      saveStartupId, addStartup, logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);