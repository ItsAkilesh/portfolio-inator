/**
 * File: content.test.ts
 * Purpose: Guards src/content/portfolio.json: it matches the schema (reporting every problem with its
 *          path), referenced images exist, and every palette resolves to a full token set.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import rawContent from "../content/portfolio.json";
import { portfolioSchema } from "../content/schema";
import { portrait, theme } from "../portfolio";
import { blocksOf } from "./blocks";

const IMAGES_DIR = resolve(__dirname, "../../public/images");
const TOKEN_COUNT = 11;

const imageFiles = [
  portrait,
  ...blocksOf("timeline").flatMap((b) =>
    b.groups.flatMap((g) => g.entries.map((e) => e.logo_path)),
  ),
  ...blocksOf("featured").flatMap((b) => b.entries.map((e) => e.logo_path)),
  ...blocksOf("publications").flatMap((b) => b.entries.map((e) => e.logo_path)),
  ...blocksOf("degrees").flatMap((b) => b.items.map((d) => d.logo_path)),
  ...blocksOf("image").map((b) => b.src),
];

describe("portfolio content", () => {
  it("matches the content schema", () => {
    const result = portfolioSchema.safeParse(rawContent);
    const problems = result.success
      ? []
      : result.error.issues.map(
          (issue) => `${issue.path.join(".")}: ${issue.message}`,
        );
    expect(problems).toEqual([]);
  });

  it.each([...new Set(imageFiles)])(
    "image %s exists in public/images",
    (file) => {
      expect(existsSync(resolve(IMAGES_DIR, file))).toBe(true);
    },
  );

  it("resolves every palette to a complete token set", () => {
    expect(theme.palettes[theme.activePalette]).toBeDefined();
    for (const palette of Object.values(theme.palettes)) {
      expect(Object.keys(palette.light)).toHaveLength(TOKEN_COUNT);
      expect(Object.keys(palette.dark)).toHaveLength(TOKEN_COUNT);
    }
  });
});

describe("content schema rules", () => {
  const valid = portfolioSchema.parse(rawContent);
  const issuesOf = (content: unknown) => {
    const result = portfolioSchema.safeParse(content);
    return result.success
      ? []
      : result.error.issues.map((issue) => issue.message);
  };

  it("rejects duplicate page paths", () => {
    const first = valid.pages[0];
    if (!first) throw new Error("content has no pages");
    expect(
      issuesOf({ ...valid, pages: [...valid.pages, { ...first, id: "copy" }] }),
    ).toContain(`Duplicate page path "${first.path}"`);
  });

  it("rejects an unknown active palette", () => {
    expect(
      issuesOf({ ...valid, theme: { ...valid.theme, activePalette: "nope" } }),
    ).toContain('No palette named "nope"');
  });

  it("rejects internal links to missing pages", () => {
    const footer = { ...valid.site.footer, linksPath: "/missing" };
    expect(issuesOf({ ...valid, site: { ...valid.site, footer } })).toContain(
      'Link "/missing" does not match any page path',
    );
  });

  it("rejects unsafe links and unknown icons", () => {
    const socialLinks = [
      { name: "x", link: "javascript:alert(1)", icon: "not-an-icon" },
    ];
    expect(
      issuesOf({ ...valid, site: { ...valid.site, socialLinks } }).length,
    ).toBeGreaterThanOrEqual(2);
  });

  it("requires at least one page", () => {
    expect(issuesOf({ ...valid, pages: [] })).toContain(
      "Add at least one page",
    );
  });
});
