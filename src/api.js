import axios from "axios";

const rawBaseURL = process.env.REACT_APP_API_URL?.trim() || "http://localhost:5000";
const normalizedBaseURL = rawBaseURL.replace(/\/+$/, "");
const baseURL = normalizedBaseURL.endsWith("/api")
  ? normalizedBaseURL
  : `${normalizedBaseURL}/api`;

export const API = axios.create({
  baseURL,
});
