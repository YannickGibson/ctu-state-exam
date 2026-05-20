import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Dev server runs on 5173 and proxies API calls to the Express backend on 3001.
// In production the backend serves the built `dist/` directly.
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3001',
      '/pdfs': 'http://localhost:3001',
      '/answer-imgs': 'http://localhost:3001',
    },
  },
});
