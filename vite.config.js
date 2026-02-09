import { resolve } from "node:path"
import preact from "@preact/preset-vite"
import { defineConfig } from "vitest/config"

export default defineConfig({
  plugins: [preact()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./"),
    },
  },
  server: {
    open: "/",
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./test/setup.js"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      reportsDirectory: "./coverage",
      exclude: ["tests/**", "examples/**", "docs/**", "*.config.js", "**/*.test.js", "coverage/**"],
    },
  },
})
