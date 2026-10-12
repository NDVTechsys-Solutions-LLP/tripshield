import axios from "axios";

export const getBackendUrl = () => {
  const envUrl = process.env.REACT_APP_BACKEND_URL;
  if (typeof window !== "undefined") {
    const isLocal =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";
    if (isLocal) {
      if (envUrl && (envUrl.includes("localhost") || envUrl.includes("127.0.0.1"))) {
        return envUrl;
      }
      return "http://localhost:8000";
    }
  }
  return envUrl || "http://localhost:8000";
};

export const BACKEND_URL = getBackendUrl();
export const API = `${BACKEND_URL}/api`;

export const api = axios.create({
  baseURL: API,
  withCredentials: true,
  timeout: 10000, // 10s timeout to prevent requests from hanging indefinitely
});

api.interceptors.request.use((config) => {
  config.baseURL = `${getBackendUrl()}/api`;
  const token = localStorage.getItem("ts_session_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Pre-warms the backend container in the background to eliminate cold start wait times.
 * Uses no-cors fetch so it won't throw console errors or block UI rendering.
 */
export const warmupBackend = () => {
  try {
    const url = `${getBackendUrl()}/api/`;
    fetch(url, { method: "GET", mode: "no-cors", cache: "no-cache" }).catch(() => {});
  } catch {}
};

export default api;

