/// <reference types="vitest/config" />
/**
 * File: vite.config.ts
 * Purpose: Vite build and Vitest configuration. Plugins live in tools/vite: generated modules,
 *          content validation, SEO tags and the dev-only admin API. Output goes to /build so the deploy workflow is unchanged.
 * Author: Akilesh
 * Date: 2026-10-20 (updated 2026-10-21)
 */
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { adminPlugin } from "./tools/vite/admin/plugin";
import { codegen } from "./tools/vite/codegen/plugin";
import { contentCheck } from "./tools/vite/contentCheck";
import { seoTags } from "./tools/vite/seoTags";

const OUTPUT_DIR = "build";

export default defineConfig({
  /* adminPlugin applies to the dev server only. */
  plugins: [react(), codegen(), contentCheck(), seoTags(), adminPlugin()],
  build: {
    outDir: OUTPUT_DIR,
    sourcemap: false,
    target: "es2022",
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    /* e2e/ holds Playwright tests, run with `pnpm test:e2e`. */
    exclude: ["**/node_modules/**", "e2e/**"],
    css: false,
  },
});
