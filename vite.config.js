import { resolve } from "node:path"
import solid from "vite-plugin-solid"
import { defineConfig } from "vitest/config"

export default defineConfig({
  plugins: [solid()],

  resolve: {
    alias: {
      "@": resolve(__dirname, "./"),
    },
  },

  build: {
    target: "es2023",
    minify: "esbuild",
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
