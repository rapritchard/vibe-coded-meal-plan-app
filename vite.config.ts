import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import path from "path";

export default defineConfig({
  // tanstackRouter must come before the React plugin so it can generate the
  // typed route tree (src/routeTree.gen.ts) from files in src/routes/.
  plugins: [
    tanstackRouter({ target: "react", autoCodeSplitting: true }),
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    // Playwright specs live in e2e/ and use their own runner.
    exclude: ["**/node_modules/**", "**/dist/**", "e2e/**"],
  },
});
