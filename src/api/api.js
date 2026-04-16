import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Inject JWT on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("fb_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Global 401 / 403 handler
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status  = err.response?.status;
    const message = err.response?.data?.message
      || err.response?.data?.error
      || err.message
      || "Something went wrong";

    if (status === 401) {
      ["fb_token","fb_refresh_token","fb_startup_id","fb_role","fb_email"]
        .forEach((k) => localStorage.removeItem(k));
      if (window.location.pathname !== "/login") window.location.href = "/login";
      return Promise.reject(new Error("Session expired. Please sign in again."));
    }

    if (status === 403) {
      return Promise.reject(new Error("You are not authorized to perform this action."));
    }

    return Promise.reject(new Error(message));
  }
);

export default api;

// ── Auth ──────────────────────────────────────────────────────────────────────
export const loginApi = (email, password) =>
  api.post("/auth/login", { email, password }).then((r) => r.data.data);

export const registerApi = (email, password, role) =>
  api.post("/auth/register", { email, password, role }).then((r) => r.data);

// ── Startups ──────────────────────────────────────────────────────────────────
export const createStartupApi    = (payload) => api.post("/startups", payload).then((r) => r.data);
export const getMyStartupsApi    = () => api.get("/startups").then((r) => { const d = r.data; return Array.isArray(d) ? d : Array.isArray(d?.data) ? d.data : []; });
export const getAllStartupsApi   = () => api.get("/startups/all").then((r) => { const d = r.data; return Array.isArray(d) ? d : Array.isArray(d?.data) ? d.data : []; });
export const deleteStartupApi   = (id) => api.delete(`/startups/${id}`).then((r) => r.data);

// ── Metrics ───────────────────────────────────────────────────────────────────
export const fetchDashboardApi  = (id) => api.get(`/metrics/dashboard/${id}`).then((r) => r.data.data ?? r.data);
export const fetchBenchmarkApi  = (id) => api.get(`/metrics/benchmark/${id}`).then((r) => r.data.data ?? r.data);