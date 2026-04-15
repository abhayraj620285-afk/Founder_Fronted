import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("fb_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err.response?.data?.message ||
      err.response?.data?.error ||
      err.message ||
      "Something went wrong";
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
export const createStartupApi = (payload) =>
  api.post("/startups", payload).then((r) => r.data);

export const getMyStartupsApi = () =>
  api.get("/startups").then((r) => {
    const d = r.data;
    return Array.isArray(d) ? d : Array.isArray(d?.data) ? d.data : [];
  });

// ── Metrics ───────────────────────────────────────────────────────────────────
export const fetchDashboardApi = (startupId) =>
  api.get(`/metrics/dashboard/${startupId}`).then((r) => r.data.data ?? r.data);

export const fetchBenchmarkApi = (startupId) =>
  api.get(`/metrics/benchmark/${startupId}`).then((r) => r.data.data ?? r.data);