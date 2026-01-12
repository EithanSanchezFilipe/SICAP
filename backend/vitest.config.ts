import { defineConfig } from "vitest/config";
import dotenv from "dotenv";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    // Tells Vitest to look for test files in your feature folders
    include: ["src/**/{test,spec}.ts", "src/**/*.test.ts"],
    env: (dotenv.config({ path: ".env.test" }).parsed || {}) as Record<
      string,
      string
    >,
  },
});
