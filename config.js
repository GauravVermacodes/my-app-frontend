// src/config.js

// Use relative URLs - Vite proxy will handle routing to backend
// This works for BOTH localhost and mobile because Vite proxies requests
export const API = import.meta.env.VITE_API_URL || 'https://my-app-backend-5cdq.onrender.com/api';
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'https://my-app-backend-5cdq.onrender.com';