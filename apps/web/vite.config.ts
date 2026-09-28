import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// In development the SPA and API run as separate processes; proxy /api to the
// API so the browser sees one origin, exactly as it does behind nginx in the
// container. Override the target with VITE_API_PROXY_TARGET if the API is elsewhere.
const apiTarget = process.env.VITE_API_PROXY_TARGET ?? 'http://localhost:3000';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: { '/api': apiTarget },
  },
  preview: {
    proxy: { '/api': apiTarget },
  },
});
