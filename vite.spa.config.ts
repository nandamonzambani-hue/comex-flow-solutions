import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { resolve } from "node:path";

// Build estático (SPA) para hospedagem Apache/Hostinger.
export default defineConfig({
  plugins: [react(), tailwindcss(), tsconfigPaths()],
  root: resolve(import.meta.dirname, "static"),
  publicDir: resolve(import.meta.dirname, "public"),
  build: {
    outDir: "/tmp/dist-spa",
    emptyOutDir: true,
  },
});
