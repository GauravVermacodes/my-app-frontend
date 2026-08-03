// src/config.js
import axios from "axios";

// From .env: "http://localhost:5000/api" (already has /api)
export const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

// BACKEND_URL = API_URL without /api (for uploads, etc.)
export const BACKEND_URL = API_URL.replace(/\/api\/?$/, "");

// ✅ API is same as API_URL (already includes /api)
export const API = API_URL;

console.log("🔧 Config:");
console.log("   API:", API);
console.log("   API_URL:", API_URL);
console.log("   BACKEND_URL:", BACKEND_URL);

// Axios instance
export const apiClient = axios.create({
  baseURL: API,
  timeout: 30000,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const code = error.response?.data?.code;
      if (
        code === "TOKEN_INVALID" ||
        code === "TOKEN_EXPIRED" ||
        code === "USER_NOT_FOUND" ||
        code === "TOKEN_REVOKED" ||
        code === "SESSION_REPLACED"
      ) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        if (!window.location.pathname.includes("/login")) {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;