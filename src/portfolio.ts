/**
 * File: portfolio.ts
 * Purpose: Typed entry point to the portfolio content. The content itself lives in
 *          src/content/portfolio.json (edit it by hand or with the dev-only /admin console); this file
 *          exposes it to components and derives what they need: resolved palettes, navigation,
 *          the home page and the GitHub project list.
 * Author: Akilesh
 * Date: 2026-10-20 (updated 2026-10-22)
 */
import rawContent from "./content/portfolio.json";
import { parseProjects, selectProjects } from "./lib/projects";
import { makePalette } from "./theme/makePalette";
import projectData from "./shared/opensource/projects.json";
import type { NavItem, PageConfig, Portfolio } from "./types/portfolio";
import type { Palette, ThemeConfig } from "./types/theme";

/*
 * The JSON is validated against src/content/schema when the dev server or a build starts
 * (tools/vite/contentCheck.ts) and by src/test/content.test.ts, so the cast cannot hide an error;
 * validating again at runtime would ship zod to every visitor.
 */
const content = rawContent as Portfolio;

export const {
  settings,
  seo,
  profile,
  socialLinks,
  footer,
  ui,
  analytics,
  researchProfiles,
} = content.site;
export const portrait = content.site.portrait;
export const languageIcons = content.site.projects.languageIcons;
export const skills = content.skills;
export const pages: readonly PageConfig[] = content.pages;

type PaletteSource = Portfolio["theme"]["palettes"][string];

const resolvePalette = (source: PaletteSource): Palette =>
  source.kind === "generated"
    ? makePalette({
        hue: source.hue,
        chroma: source.chroma,
        lightness: source.lightness,
      })
    : { light: source.light, dark: source.dark };

export const theme: ThemeConfig = {
  ...content.theme,
  palettes: Object.fromEntries(
    Object.entries(content.theme.palettes).map(([name, source]) => [
      name,
      resolvePalette(source),
    ]),
  ),
};

/* The schema requires at least one page, so the first page always exists. */
export const homePage: PageConfig = content.pages[0] as PageConfig;

export const navigation: readonly NavItem[] = content.pages
  .filter((page) => page.showInNav)
  .map((page) => ({ path: page.path, label: page.label }));

/** The page served at a path; "/" is the home page. */
export const pageForPath = (pathname: string): PageConfig | undefined =>
  pathname === "/"
    ? homePage
    : content.pages.find((page) => page.path === pathname);

/** GitHub projects to show, validated at the boundary; malformed entries are dropped. */
export const projects = selectProjects(
  parseProjects(projectData),
  content.site.projects.featured,
);
