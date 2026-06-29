import axios from "axios";

const BASE_URL = "http://a6ee3cb9a21f840759cc7c33484a3afc-265054964.us-east-1.elb.amazonaws.com:8080";

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
    const status  = err.response?.status;
    const message =
      err.response?.data?.message ||
      err.response?.data?.error   ||
      err.message                  ||
      "Something went wrong";
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

function extractList(response) {
  const r = response.data;
  if (Array.isArray(r?.data))    return r.data;
  if (Array.isArray(r))          return r;
  if (Array.isArray(r?.content)) return r.content;
  return [];
}

function extractOne(response) {
  const r = response.data;
  return r?.data ?? r;
}

// ── Auth ──────────────────────────────────────────────────────────────────────

/**
 * loginApi — returns the full data object from backend.
 *
 * Your backend returns:
 * { status: "success", data: { accessToken: "...", refreshToken: "..." } }
 *
 * We return the full raw response so Login.jsx can inspect every field.
 */
export const loginApi = (email, password) =>
  api.post("/auth/login", { email, password }).then((r) => {
    // Log the entire login response so we can see what the backend returns
    console.log("🔑 loginApi raw response:", JSON.stringify(r.data, null, 2));
    return r.data.data ?? r.data;
  });

export const registerApi = (email, password, role) =>
  api.post("/auth/register", { email, password, role }).then((r) => r.data);

// ── Startups ──────────────────────────────────────────────────────────────────
export const getMyStartupsApi = () =>
  api.get("/startups/my").then(extractList);

export const createStartupApi = (payload) =>
  api.post("/startups", payload).then(extractOne);

export const getStartupByIdApi = (id) =>
  api.get(`/startups/${id}`).then(extractOne);

export const updateStartupApi = (id, payload) =>
  api.put(`/startups/${id}`, payload).then(extractOne);

export const getAllStartupsApi = async () => {
  try { return await api.get("/startups/all").then(extractList); }
  catch { return []; }
};

export const deleteStartupApi = (id) =>
  api.delete(`/startups/${id}`).then((r) => r.data);

// ── Metrics ───────────────────────────────────────────────────────────────────
export const fetchDashboardApi = (id) =>
  api.get(`/metrics/dashboard/${id}`).then((r) => r.data.data ?? r.data);

export const fetchBenchmarkApi = (id) =>
  api.get(`/metrics/benchmark/${id}`).then((r) => r.data.data ?? r.data);