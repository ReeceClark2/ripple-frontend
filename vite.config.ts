import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: Number(process.env.PORT) || 5173, // Render sets PORT dynamically
    host: '0.0.0.0', // Required for Render to access the server
  },
  build: {
    outDir: 'dist', // Ensure this matches what Render expects
  },
});
