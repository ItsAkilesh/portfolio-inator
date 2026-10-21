/**
 * File: seoTags.ts
 * Purpose: Vite plugin that writes the SEO tags from the content into index.html, in dev and in builds.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import type { Plugin } from "vite";
import { renderHeadTags } from "../../src/lib/headTags";
import { seo, socialLinks } from "../../src/portfolio";

const SEO_PLACEHOLDER =
  "<!-- seo-tags: generated from seo in src/portfolio.ts by vite.config.ts -->";
const LANG_PLACEHOLDER = "%SEO_LANG%";

export function seoTags(): Plugin {
  let base = "/";
  return {
    name: "portfolio-seo-tags",
    configResolved(config) {
      base = config.base;
    },
    transformIndexHtml(html) {
      const sameAs = socialLinks.map((item) => item.link);
      return html
        .replace(SEO_PLACEHOLDER, renderHeadTags(seo, sameAs, base))
        .replace(LANG_PLACEHOLDER, seo.language);
    },
  };
}
