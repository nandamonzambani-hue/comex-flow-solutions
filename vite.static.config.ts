import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Static build config: prerender "/" so the deployed HTML has real content
// (Hostinger shared hosting can't run the Worker SSR runtime).
export default defineConfig({
  nitro: { preset: "static" },
  tanstackStart: {
    pages: [{ path: "/", prerender: { enabled: true } }],
  },
});
