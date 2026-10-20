/// <reference types="vitest/config" />
/**
 * File: vite.config.ts
 * Purpose: Vite build and Vitest configuration. Output goes to /build so the deploy workflow is unchanged.
 * Author: Akilesh
 * Date: 2026-10-20
 */
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const OUTPUT_DIR = "build";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: OUTPUT_DIR,
    sourcemap: false,
    target: "es2022",
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    css: false,
  },
});
