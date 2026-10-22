/**
 * File: seoTags.ts
 * Purpose: Vite plugin that writes the SEO tags from portfolio.json into index.html, in dev and in
 *          builds. The file is read when the page is served rather than imported into the config, so
 *          saving content never restarts the dev server and the tags always match the file.
 * Author: Akilesh
 * Date: 2026-10-21 (updated 2026-10-22)
 */
import { readFile } from "node:fs/promises";
import type { Plugin } from "vite";
import { renderHeadTags } from "../../src/lib/headTags";
import { projectPaths } from "./paths";
import { buildSchema, devSchema, type LoadSchema } from "./schemaSource";
import { validateContent } from "./validate";

const SEO_PLACEHOLDER =
  "<!-- seo-tags: generated from seo in src/content/portfolio.json -->";
const LANG_PLACEHOLDER = "%SEO_LANG%";

export function seoTags(): Plugin {
  let base = "/";
  let contentFile = projectPaths(process.cwd()).contentFile;
  let loadSchema: LoadSchema = buildSchema(process.cwd());
  return {
    name: "portfolio-seo-tags",
    configResolved(config) {
      base = config.base;
      contentFile = projectPaths(config.root).contentFile;
      loadSchema = buildSchema(config.root);
    },
    configureServer(server) {
      loadSchema = devSchema(server);
    },
    async transformIndexHtml(html) {
      const result = validateContent(
        await loadSchema(),
        JSON.parse(await readFile(contentFile, "utf8")),
      );
      /* An invalid file is reported by contentCheck; serve the page without tags meanwhile. */
      if (!result.ok) return html.replace(SEO_PLACEHOLDER, "");
      const { seo, socialLinks } = result.content.site;
      return html
        .replace(
          SEO_PLACEHOLDER,
          renderHeadTags(
            seo,
            socialLinks.map((item) => item.link),
            base,
          ),
        )
        .replace(LANG_PLACEHOLDER, seo.language);
    },
  };
}
