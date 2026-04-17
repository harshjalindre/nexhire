import axios from "axios";
import { API_BASE_URL } from "./constants";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const stored = localStorage.getItem("nexhire-auth");
  if (stored) {
    try {
      const { state } = JSON.parse(stored);
      if (state?.token) config.headers.Authorization = `Bearer ${state.token}`;
      if (state?.tenant?.id) config.headers["X-Tenant-ID"] = state.tenant.id;
    } catch { /* ignore */ }
  }
  config.headers["X-Correlation-ID"] = crypto.randomUUID();
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("nexhire-auth");
      window.location.href = "/auth/login";
    }
    return Promise.reject(error);
  }
);

export { api };
export default api;
