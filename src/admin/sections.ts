/**
 * File: sections.ts
 * Purpose: The admin console's navigation: each entry edits one part of the content by path. Adding
 *          an entry is all it takes to expose more of the schema; the form is generated from it.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import type { Path } from "./paths";

export interface AdminSection {
  readonly id: string;
  readonly label: string;
  readonly path: Path;
  readonly group: "Content" | "Site" | "Look";
}

export const ADMIN_SECTIONS: readonly AdminSection[] = [
  { id: "pages", label: "Pages", path: ["pages"], group: "Content" },
  { id: "skills", label: "Skills", path: ["skills"], group: "Content" },
  {
    id: "profile",
    label: "Profile",
    path: ["site", "profile"],
    group: "Content",
  },
  {
    id: "socials",
    label: "Social links",
    path: ["site", "socialLinks"],
    group: "Content",
  },
  {
    id: "research",
    label: "Research profiles",
    path: ["site", "researchProfiles"],
    group: "Content",
  },
  {
    id: "projects",
    label: "Projects",
    path: ["site", "projects"],
    group: "Content",
  },
  {
    id: "portrait",
    label: "Portrait",
    path: ["site", "portrait"],
    group: "Content",
  },
  { id: "seo", label: "SEO", path: ["site", "seo"], group: "Site" },
  {
    id: "analytics",
    label: "Analytics",
    path: ["site", "analytics"],
    group: "Site",
  },
  {
    id: "settings",
    label: "Settings",
    path: ["site", "settings"],
    group: "Site",
  },
  { id: "footer", label: "Footer", path: ["site", "footer"], group: "Site" },
  { id: "copy", label: "Interface copy", path: ["site", "ui"], group: "Site" },
  { id: "theme", label: "Theme", path: ["theme"], group: "Look" },
];

export const DEFAULT_SECTION = "pages";

export const sectionById = (id: string | undefined): AdminSection =>
  ADMIN_SECTIONS.find((section) => section.id === id) ??
  /* ADMIN_SECTIONS is a non-empty literal; the first entry always exists. */
  (ADMIN_SECTIONS[0] as AdminSection);
