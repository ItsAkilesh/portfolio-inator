/**
 * File: index.ts
 * Purpose: The complete portfolio content schema. It validates src/content/portfolio.json at build
 *          time, drives the admin console's generated forms and produces portfolio.schema.json for
 *          editor autocompletion. Cross-field rules (unique pages, valid palette, internal links)
 *          live here too.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import { z } from "zod";
import { blockSchema } from "./blocks";
import { skillGroupSchema } from "./entries";
import { flag, list, routePath, text } from "./fields";
import { siteSchema } from "./site";
import { themeSchema } from "./theme";

/** Routes the app itself uses; a page cannot take them. */
const RESERVED_PATHS: ReadonlySet<string> = new Set(["/", "/admin", "/splash"]);
const PAGE_ID = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export const pageSchema = z
  .object({
    id: text({ title: "ID", description: "Unique key, e.g. talks" }).regex(
      PAGE_ID,
      "Use lowercase words joined with dashes",
    ),
    path: routePath({ title: "Path", description: "e.g. /talks" }).refine(
      (path) => !RESERVED_PATHS.has(path),
      "This path is reserved",
    ),
    label: text({
      title: "Name",
      description: "Navigation label and tab title",
    }),
    showInNav: flag({ title: "Show in navigation" }),
    blocks: list(blockSchema, { title: "Blocks" }),
  })
  .meta({ title: "Page", summaryKey: "label" });

const baseSchema = z.object({
  $schema: z.string().optional(),
  site: siteSchema,
  theme: themeSchema,
  skills: list(skillGroupSchema, {
    title: "Skills",
    description: "Groups shown in What I do",
  }),
  pages: list(pageSchema, {
    title: "Pages",
    description: "The first page is the home page; order is navigation order",
  }),
});

type Content = z.infer<typeof baseSchema>;

function duplicates(values: readonly string[]): string[] {
  const seen = new Set<string>();
  return values.filter((value) =>
    seen.has(value) ? true : (seen.add(value), false),
  );
}

/** Internal links in link lists, so they can be checked against page paths. */
function internalLinks(content: Content): string[] {
  const fromBlocks = content.pages.flatMap((page) =>
    page.blocks.flatMap((block) =>
      block.type === "linkGrid" ? block.items : [],
    ),
  );
  return [
    ...content.site.socialLinks,
    ...fromBlocks,
    { link: content.site.footer.linksPath },
  ]
    .map((item) => item.link)
    .filter((href) => href.startsWith("/"));
}

function checkContent(content: Content, ctx: z.RefinementCtx): void {
  const issue = (message: string, path: (string | number)[]) =>
    ctx.addIssue({ code: "custom", message, path });
  for (const id of duplicates(content.pages.map((p) => p.id)))
    issue(`Duplicate page id "${id}"`, ["pages"]);
  for (const path of duplicates(content.pages.map((p) => p.path)))
    issue(`Duplicate page path "${path}"`, ["pages"]);
  if (content.pages.length === 0) issue("Add at least one page", ["pages"]);
  if (!(content.theme.activePalette in content.theme.palettes))
    issue(`No palette named "${content.theme.activePalette}"`, [
      "theme",
      "activePalette",
    ]);
  const paths = new Set(["/", ...content.pages.map((p) => p.path)]);
  for (const href of internalLinks(content))
    if (!paths.has(href))
      issue(`Link "${href}" does not match any page path`, ["pages"]);
}

export const portfolioSchema = baseSchema.superRefine(checkContent);

export type PortfolioContent = z.infer<typeof portfolioSchema>;
export type Block = z.infer<typeof blockSchema>;
export type BlockType = Block["type"];
export type Page = z.infer<typeof pageSchema>;
