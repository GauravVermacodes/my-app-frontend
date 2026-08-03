// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  server: {
    // ── Network Settings ────────────────────────────────
    host: '0.0.0.0',      // Allows access from other devices on LAN
    port: 3000,           // Default Vite port
    strictPort: true,     // Fail if port is already in use (don't try next)
    open: false,          // Don't auto-open browser

    // ── Proxy Settings ──────────────────────────────────
    // Forwards frontend requests to backend (avoids CORS in dev)
    proxy: {
      // API requests → Backend
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
        secure: false,
      },

      // Socket.io (WebSocket) → Backend for real-time features
      // (meetings, notifications, chat, friend requests)
      '/socket.io': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
        ws: true,         // Enable WebSocket proxying
        secure: false,
      },

      // File uploads (videos, avatars, thumbnails)
      '/uploads': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
        secure: false,
      },

      // Recordings (from meeting module)
      '/recordings': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },

  // ── Build Settings ────────────────────────────────────
  build: {
    outDir: 'dist',
    sourcemap: false,     // Set to true for debugging production builds
    chunkSizeWarningLimit: 1000,  // Suppress large chunk warnings (video files)
  },

  // ── Path Aliases (optional but recommended) ───────────
  resolve: {
    alias: {
      '@': '/src',
      '@components': '/src/components',
      '@pages': '/src/pages',
      '@services': '/src/services',
      '@context': '/src/context',
      '@api': '/src/api',
    },
  },
});