import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "/api";

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("css_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Handle 401 responses globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("css_token");
      localStorage.removeItem("css_user");
      window.dispatchEvent(new Event("auth:logout"));
    }
    return Promise.reject(error);
  },
);

// ─── Auth ─────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  me: () => api.get("/auth/me"),
};

// ─── Assignments ──────────────────────────────────────────
export const assignmentsAPI = {
  getAll: (params) => api.get("/assignments", { params }),
  getById: (id) => api.get(`/assignments/${id}`),
};

// ─── Query Execution ──────────────────────────────────────
export const queryAPI = {
  execute: (sql, assignmentId) =>
    api.post("/query/execute", { sql, assignmentId }),
  getSampleData: (tableName) => api.get(`/query/sample-data/${tableName}`),
};

// ─── Hints ────────────────────────────────────────────────
export const hintsAPI = {
  getHint: (assignmentId, userQuery, hintLevel) =>
    api.post("/hints/get", { assignmentId, userQuery, hintLevel }),
};

// ─── Attempts ─────────────────────────────────────────────
export const attemptsAPI = {
  getMy: () => api.get("/attempts/my"),
  getByAssignment: (assignmentId) => api.get(`/attempts/${assignmentId}`),
  saveQuery: (assignmentId, savedQuery) =>
    api.patch(`/attempts/${assignmentId}/save`, { savedQuery }),
};

export default api;
