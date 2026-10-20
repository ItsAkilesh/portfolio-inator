/**
 * File: config.test.ts
 * Purpose: Guards the portfolio config: images exist, links are safe, palettes are complete, routes resolve.
 * Author: Akilesh
 * Date: 2026-10-20
 */
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { safeHref } from "../components/ui/SmartLink";
import { isIconKey } from "../icons/registry";
import * as portfolio from "../portfolio";

const IMAGES_DIR = resolve(__dirname, "../../public/images");
const ROUTES = new Set([
  "/",
  "/home",
  "/experience",
  "/education",
  "/research",
  "/projects",
  "/contact",
  "/links",
]);
const TOKEN_COUNT = 11;

const imageFiles = [
  ...portfolio.experience.sections.flatMap((s) =>
    s.experiences.map((e) => e.logo_path),
  ),
  ...portfolio.research.sections.flatMap((s) =>
    s.research.map((e) => e.logo_path),
  ),
  ...portfolio.degrees.degrees.map((d) => d.logo_path),
  portfolio.links.profile_image_path,
  portfolio.contactPageData.contactSection.profile_image_path,
];

const allLinks = [...portfolio.socialMediaLinks, ...portfolio.links.links];

describe("portfolio config", () => {
  it.each(imageFiles)("image %s exists in public/images", (file) => {
    expect(existsSync(resolve(IMAGES_DIR, file))).toBe(true);
  });

  it("uses only safe link schemes", () => {
    for (const item of allLinks) expect(safeHref(item.link)).toBe(item.link);
  });

  it("points internal links and navigation at real routes", () => {
    const internal = [
      ...allLinks.map((l) => l.link),
      ...portfolio.navigation.map((n) => n.path),
    ].filter((l) => l.startsWith("/"));
    for (const path of internal) expect(ROUTES.has(path)).toBe(true);
  });

  it("references registered icons only", () => {
    const icons = [
      ...allLinks.map((l) => l.icon),
      ...portfolio.skills.data.flatMap((g) =>
        g.softwareSkills.map((s) => s.icon),
      ),
      ...Object.values(portfolio.languageIcons),
    ];
    expect(icons.every(isIconKey)).toBe(true);
  });

  it("defines complete palettes and an existing active palette", () => {
    const { palettes, activePalette } = portfolio.theme;
    expect(palettes[activePalette]).toBeDefined();
    for (const palette of Object.values(palettes)) {
      expect(Object.keys(palette.light)).toHaveLength(TOKEN_COUNT);
      expect(Object.keys(palette.dark)).toHaveLength(TOKEN_COUNT);
    }
  });
});

describe("safeHref", () => {
  it("rejects script and data URLs", () => {
    expect(safeHref("javascript:alert(1)")).toBeUndefined();
    expect(safeHref("data:text/html,x")).toBeUndefined();
    expect(safeHref("//evil.example.com")).toBeUndefined();
  });
});
