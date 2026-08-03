// src/api/axios.js
import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const API = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10 * 60 * 1000,   // 10 min (for large uploads)
  headers: {
    "Content-Type": "application/json",
  },
});

// ═══════════════════════════════════════════════════════════
//  REQUEST INTERCEPTOR — Attach token
// ═══════════════════════════════════════════════════════════
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ═══════════════════════════════════════════════════════════
//  RESPONSE INTERCEPTOR — Handle auth errors
// ═══════════════════════════════════════════════════════════
API.interceptors.response.use(
  (res) => res,
  (err) => {
    const code = err.response?.data?.code;
    const status = err.response?.status;
    const message = err.response?.data?.message;

    // Auto-logout scenarios
    const shouldLogout =
      status === 401 &&
      (code === "TOKEN_INVALID" ||
        code === "TOKEN_EXPIRED" ||
        code === "TOKEN_REVOKED" ||
        code === "USER_NOT_FOUND" ||
        code === "SESSION_REPLACED");

    if (shouldLogout) {
      console.warn("🔓 Session invalid:", code);
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      const path = window.location.pathname;
      if (!path.includes("/login") && !path.includes("/register")) {
        // Different message for session replaced
        if (code === "SESSION_REPLACED") {
          alert(
            `⚠️ ${message}\n\nYou've been signed out because you logged in on another device.`
          );
        } else {
          alert("⚠️ Your session has expired. Please login again.");
        }
        window.location.href = "/login";
      }
    }

    console.error("❌ API Error:", err.message, err.response?.data);
    return Promise.reject(err);
  }
);

export default API;