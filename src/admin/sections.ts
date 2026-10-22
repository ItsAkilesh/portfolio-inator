/**
 * File: sections.ts
 * Purpose: The admin console's navigation. Form sections edit one part of the content by path (the
 *          form is generated from the schema; an optional panel adds previews above it). Tool
 *          sections open a page of their own (media, icons, import, health, publish, ...).
 * Author: Akilesh
 * Date: 2026-10-21 (updated 2026-10-22)
 */
import type { Path } from "./paths";

export type SectionGroup =
  | "Content"
  | "Site"
  | "Look"
  | "Library"
  | "Data"
  | "Publish"
  | "Help";
export type PanelId = "seo" | "theme" | "projects";
export type ToolId =
  | "media"
  | "icons"
  | "history"
  | "import"
  | "health"
  | "publish"
  | "setup"
  | "docs";
/** Guides in docs/admin, by file name. */
export type DocId =
  | "getting-started"
  | "pages-and-blocks"
  | "media-and-icons"
  | "importing"
  | "publishing"
  | "custom-blocks"
  | "keyboard";

interface BaseSection {
  readonly id: string;
  readonly label: string;
  readonly group: SectionGroup;
  readonly doc?: DocId;
}

export interface FormSection extends BaseSection {
  readonly kind: "form";
  readonly path: Path;
  readonly panel?: PanelId;
}

export interface ToolSection extends BaseSection {
  readonly kind: "tool";
  readonly tool: ToolId;
}

export type AdminSection = FormSection | ToolSection;

const form = (
  id: string,
  label: string,
  path: Path,
  group: SectionGroup,
  extra: Partial<FormSection> = {},
): FormSection => ({ kind: "form", id, label, path, group, ...extra });
const tool = (
  id: ToolId,
  label: string,
  group: SectionGroup,
  doc?: DocId,
): ToolSection => ({ kind: "tool", id, label, tool: id, group, doc });

export const ADMIN_SECTIONS: readonly AdminSection[] = [
  form("pages", "Pages", ["pages"], "Content", { doc: "pages-and-blocks" }),
  form("skills", "Skills", ["skills"], "Content"),
  form("profile", "Profile", ["site", "profile"], "Content"),
  form("socials", "Social links", ["site", "socialLinks"], "Content", {
    doc: "media-and-icons",
  }),
  form(
    "research",
    "Research profiles",
    ["site", "researchProfiles"],
    "Content",
  ),
  form("projects", "Projects", ["site", "projects"], "Content", {
    panel: "projects",
  }),
  form("portrait", "Portrait", ["site", "portrait"], "Content"),
  form("seo", "SEO", ["site", "seo"], "Site", { panel: "seo" }),
  form("analytics", "Analytics", ["site", "analytics"], "Site"),
  form("settings", "Settings", ["site", "settings"], "Site"),
  form("footer", "Footer", ["site", "footer"], "Site"),
  form("copy", "Interface copy", ["site", "ui"], "Site"),
  form("theme", "Theme", ["theme"], "Look", { panel: "theme" }),
  tool("media", "Media", "Library", "media-and-icons"),
  tool("icons", "Icons", "Library", "media-and-icons"),
  tool("import", "Import & export", "Data", "importing"),
  tool("history", "History", "Data"),
  tool("health", "Health check", "Publish"),
  tool("publish", "Build & publish", "Publish", "publishing"),
  tool("setup", "Setup wizard", "Help", "getting-started"),
  tool("docs", "Guides", "Help"),
];

export const DEFAULT_SECTION = "pages";

export const sectionById = (id: string | undefined): AdminSection =>
  ADMIN_SECTIONS.find((section) => section.id === id) ??
  /* ADMIN_SECTIONS is a non-empty literal; the first entry always exists. */
  (ADMIN_SECTIONS[0] as AdminSection);

const isPrefix = (prefix: Path, path: Path): boolean =>
  prefix.length <= path.length && prefix.every((key, i) => key === path[i]);

/** The form section that edits `path` (the most specific one), if any. */
export function sectionForPath(path: Path): FormSection | undefined {
  let best: FormSection | undefined;
  for (const section of ADMIN_SECTIONS)
    if (
      section.kind === "form" &&
      isPrefix(section.path, path) &&
      section.path.length > (best?.path.length ?? -1)
    )
      best = section;
  return best;
}

export { isPrefix as isPathPrefix };
