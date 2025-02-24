import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: '0.0.0.0', // Allows external access
    port: 5173, // Set your frontend port
    strictPort: true,
    cors: true, // Ensure CORS is enabled if needed
    proxy: {
      '/api': {
        target: 'https://ripple-8edg.onrender.com', // Your backend URL
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api/, '') // Adjust if necessary
      }
    }
  }
});
