/**
 * File: accessibility.spec.ts
 * Purpose: Automated accessibility checks (axe, WCAG 2.1 A and AA) of every admin section and tool
 *          and of every site page in light and dark mode. Serious and critical violations fail.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import AxeBuilder from "@axe-core/playwright";
import type { Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import { contentFile } from "./project";
import { expect, test } from "./fixtures";

const ADMIN_SECTIONS = [
  "pages",
  "skills",
  "profile",
  "socials",
  "projects",
  "seo",
  "settings",
  "theme",
  "media",
  "icons",
  "import",
  "history",
  "health",
  "publish",
  "setup",
  "docs",
];
const BLOCKING = new Set(["serious", "critical"]);

async function blockingViolations(page: Page, exclude: readonly string[] = []) {
  let builder = new AxeBuilder({ page }).withTags([
    "wcag2a",
    "wcag2aa",
    "wcag21a",
    "wcag21aa",
  ]);
  for (const selector of exclude) builder = builder.exclude(selector);
  const { violations } = await builder.analyze();
  return violations
    .filter((v) => BLOCKING.has(v.impact ?? ""))
    .map(
      (v) =>
        `${v.id}: ${v.help} (${v.nodes
          .map((n) => n.target.join(" "))
          .slice(0, 3)
          .join(", ")})`,
    );
}

for (const section of ADMIN_SECTIONS)
  test(`admin "${section}" has no serious accessibility violations`, async ({
    admin,
    page,
  }) => {
    await admin.open(section);
    await page.waitForLoadState("networkidle");
    /* The preview frame shows the site, which is checked on its own below. */
    expect(await blockingViolations(page, ["iframe"])).toEqual([]);
  });

const SITE_PATHS = (
  JSON.parse(readFileSync(contentFile, "utf8")) as { pages: { path: string }[] }
).pages.map((p) => p.path);

for (const mode of ["light", "dark"] as const)
  for (const path of SITE_PATHS)
    test(`site ${path} (${mode}) has no serious accessibility violations`, async ({
      page,
    }) => {
      /* Reduced motion: entrance animations would otherwise be measured half-faded. */
      await page.emulateMedia({ colorScheme: mode, reducedMotion: "reduce" });
      await page.goto(path);
      /* Not "networkidle": web fonts may load from a CDN that is slow or blocked. */
      await expect(page.locator("[data-page]")).toBeVisible();
      expect(await blockingViolations(page)).toEqual([]);
    });
