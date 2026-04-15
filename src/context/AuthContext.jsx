import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { getMyStartupsApi } from "../api/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("fb_token"));
  const [startups, setStartups] = useState([]);
  const [activeStartupId, setActiveStartupId] = useState(
    () => localStorage.getItem("fb_startup_id")
  );

  // Auto-fetch startups when token exists
  useEffect(() => {
    if (token) {
      getMyStartupsApi()
        .then((list) => {
          setStartups(list);
          // If no active startup selected, pick first
          if (!activeStartupId && list.length > 0) {
            const firstId = String(list[0].id);
            setActiveStartupId(firstId);
            localStorage.setItem("fb_startup_id", firstId);
          }
        })
        .catch(() => {}); // silently fail — user may not have startups yet
    }
  }, [token]);

  const saveAuth = useCallback((data) => {
    localStorage.setItem("fb_token", data.accessToken);
    if (data.refreshToken) localStorage.setItem("fb_refresh_token", data.refreshToken);
    setToken(data.accessToken);
  }, []);

  const saveStartupId = useCallback((id) => {
    const sid = String(id);
    localStorage.setItem("fb_startup_id", sid);
    setActiveStartupId(sid);
  }, []);

  const addStartup = useCallback((startup) => {
    setStartups((prev) => [...prev, startup]);
    if (startup?.id) saveStartupId(startup.id);
  }, [saveStartupId]);

  const logout = useCallback(() => {
    ["fb_token", "fb_refresh_token", "fb_startup_id"].forEach((k) =>
      localStorage.removeItem(k)
    );
    setToken(null);
    setActiveStartupId(null);
    setStartups([]);
  }, []);

  return (
    <AuthContext.Provider
      value={{ token, startups, activeStartupId, saveAuth, saveStartupId, addStartup, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);