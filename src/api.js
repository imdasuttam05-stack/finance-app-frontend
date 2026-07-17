import axios from "axios";

const rawBaseURL = process.env.REACT_APP_API_URL?.trim() || "http://localhost:5000";
const normalizedBaseURL = rawBaseURL.replace(/\/+$/, "");
const baseURL = normalizedBaseURL.endsWith("/api")
  ? normalizedBaseURL
  : `${normalizedBaseURL}/api`;

export const API = axios.create({
  baseURL,
});

const setHeader = (headers, name, value) => {
  if (!value) return;

  if (typeof headers?.set === "function") {
    headers.set(name, value);
  } else {
    headers[name] = value;
  }
};

// Attach user id header on every request so backend can authorize
API.interceptors.request.use(
  (config) => {
    try {
      const userId = (localStorage.getItem("userId") || "").trim();
      const adminSecret = (localStorage.getItem("adminSecret") || localStorage.getItem("ADMIN_SECRET") || "").trim();
      const headers = config.headers || {};
      config.headers = headers;

      if (userId) {
        setHeader(config.headers, "x-user-id", userId);
      }

      // If an admin secret is stored in localStorage, send it as a header as a fallback
      if (adminSecret) {
        setHeader(config.headers, "x-admin-secret", adminSecret);
      }

      const debugHeaders = config.headers?.toJSON ? config.headers.toJSON() : config.headers;
      // debug: show outgoing admin/user headers (can remove later)
      // eslint-disable-next-line no-console
      console.debug("API request:", config.method, config.url, {
        "x-user-id": debugHeaders["x-user-id"] || null,
        "x-admin-secret": Boolean(debugHeaders["x-admin-secret"]),
      });
    } catch (e) {
      // ignore if localStorage not available
    }

    return config;
  },
  (error) => Promise.reject(error)
);
