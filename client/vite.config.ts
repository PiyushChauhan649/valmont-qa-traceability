import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      // Forward API calls to the Express backend during local dev.
      "/api": {
        target: process.env["VITE_API_PROXY_TARGET"] || "http://localhost:4000",
        changeOrigin: true,
      },
    },
  },
});
