import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  nitro: {
    preset: "static",
  },
  tanstackStart: {
    pages: [{ path: "/", prerender: { enabled: true } }],
  },
});
