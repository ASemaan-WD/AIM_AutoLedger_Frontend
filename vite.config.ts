import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      // Proxy API calls to Azure Functions
      // This forwards requests from /api/* to http://localhost:7071/api/*
      '/api': {
        target: process.env.VITE_BACKEND_URL || 'http://localhost:7071',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path, // Keep /api prefix
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});

