/// <reference types="vitest/config" />
/**
 * File: vite.config.ts
 * Purpose: Vite build and Vitest configuration. Injects the SEO tags from src/portfolio.ts into
 *          index.html. Output goes to /build so the deploy workflow is unchanged.
 * Author: Akilesh
 * Date: 2026-10-20
 */
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { renderHeadTags } from "./src/lib/headTags";
import { seo, socialMediaLinks } from "./src/portfolio";

const OUTPUT_DIR = "build";
const SEO_PLACEHOLDER =
  "<!-- seo-tags: generated from seo in src/portfolio.ts by vite.config.ts -->";
const LANG_PLACEHOLDER = "%SEO_LANG%";

/** Writes the SEO tags from portfolio.ts into index.html in dev and in the build. */
function seoTags(): Plugin {
  let base = "/";
  return {
    name: "portfolio-seo-tags",
    configResolved(config) {
      base = config.base;
    },
    transformIndexHtml(html) {
      const sameAs = socialMediaLinks.map((item) => item.link);
      return html
        .replace(SEO_PLACEHOLDER, renderHeadTags(seo, sameAs, base))
        .replace(LANG_PLACEHOLDER, seo.language);
    },
  };
}

export default defineConfig({
  plugins: [react(), seoTags()],
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
