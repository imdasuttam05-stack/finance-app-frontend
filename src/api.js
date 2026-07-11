import axios from "axios";

const rawBaseURL = process.env.REACT_APP_API_URL?.trim() || "http://localhost:5000";
const normalizedBaseURL = rawBaseURL.replace(/\/+$/, "");
const baseURL = normalizedBaseURL.endsWith("/api")
  ? normalizedBaseURL
  : `${normalizedBaseURL}/api`;

export const API = axios.create({
  baseURL,
});

// Attach user id header on every request so backend can authorize
API.interceptors.request.use(
  (config) => {
    try {
      const userId = localStorage.getItem("userId") || "";
      const adminSecret = localStorage.getItem("adminSecret") || localStorage.getItem("ADMIN_SECRET") || "";
      config.headers = config.headers || {};
      if (userId) {
        config.headers["x-user-id"] = userId;
      }
      // If an admin secret is stored in localStorage, send it as a header as a fallback
      if (adminSecret && !config.headers["x-admin-secret"]) {
        config.headers["x-admin-secret"] = adminSecret;
      }
      // debug: show outgoing admin/user headers (can remove later)
      // eslint-disable-next-line no-console
      console.debug("API request:", config.method, config.url, { "x-user-id": config.headers["x-user-id"], "x-admin-secret": !!config.headers["x-admin-secret"] });
    } catch (e) {
      // ignore if localStorage not available
    }

    return config;
  },
  (error) => Promise.reject(error)
);
