import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// netlify  → public URL at site root (/)
// default  → WAMP intranet at /propel-csr-prototype/dist/
export default defineConfig(({ mode }) => ({
  base: mode === "netlify" ? "/" : "/propel-csr-prototype/dist/",
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    open: mode === "netlify" ? "/" : "/propel-csr-prototype/dist/",
  },
  preview: {
    port: 4173,
    host: true,
  },
}));
