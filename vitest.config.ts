import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    coverage: {
      provider: "v8",
      include: [
        "src/engine/**/*.ts",
        "src/lib/**/*.ts",
        "src/data/**/*.ts",
        "src/content/**/*.ts",
        "src/stores/**/*.ts",
      ],
      exclude: ["src/**/*.test.ts", "src/**/*.spec.ts", "src/**/__tests__/**"],
    },
  },
});
