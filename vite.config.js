import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// pages mode → GitHub Pages at /repo-name/
// default   → WAMP intranet at /propel-csr-prototype/dist/
export default defineConfig(({ mode }) => ({
  base:
    mode === "pages"
      ? "/propel-csr-prototype/"
      : "/propel-csr-prototype/dist/",
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    open: mode === "pages" ? "/propel-csr-prototype/" : "/propel-csr-prototype/dist/",
  },
  preview: {
    port: 4173,
    host: true,
  },
}));
