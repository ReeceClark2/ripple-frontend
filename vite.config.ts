import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: '0.0.0.0',  // Allows external access
    port: 5173, // Adjust to your port
    strictPort: true,
    cors: true,
    allowedHosts: ['ripple-8edg.onrender.com'] // Allow your Render frontend host
  },
  preview: {
    port: 4173, // Default preview port
    allowedHosts: ['ripple-8edg.onrender.com'] // Allow host for preview mode
  }
});
