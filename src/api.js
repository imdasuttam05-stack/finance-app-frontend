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
      if (userId) {
        config.headers = config.headers || {};
        config.headers["x-user-id"] = userId;
      }
    } catch (e) {
      // ignore if localStorage not available
    }

    return config;
  },
  (error) => Promise.reject(error)
);
