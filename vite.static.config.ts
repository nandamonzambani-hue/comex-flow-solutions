import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  nitro: {
    preset: "node-server",
    output: { dir: "dist", publicDir: "dist/client", serverDir: "dist/server" },
  },
  tanstackStart: {
    pages: [{ path: "/", prerender: { enabled: true } }],
  },
});
