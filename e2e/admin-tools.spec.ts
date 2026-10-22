/**
 * File: admin-tools.spec.ts
 * Purpose: End-to-end tests of the admin tools: history after a save, JSON import validation,
 *          BibTeX and JSON Resume imports, the theme studio's live preview, the SEO preview, the
 *          health check, the setup wizard, the guides and the git status on the publish page.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import { expect, test } from "./fixtures";

const BIBTEX = `@article{doe2024,
  title = {A {Study} of Things},
  author = {Doe, Jane and Smith, John},
  journal = {Journal of Tests},
  year = {2024}, month = mar,
  doi = {10.1000/xyz123}
}`;

const RESUME = JSON.stringify({
  basics: {
    name: "Ada Lovelace",
    summary: "Analyst.",
    profiles: [{ network: "GitHub", url: "https://github.com/ada" }],
  },
  work: [
    {
      name: "Engines Ltd",
      position: "Analyst",
      startDate: "1842-01",
      summary: "Notes.",
    },
  ],
});

test("keeps the previous file in history after a save and loads it back", async ({
  admin,
  page,
}) => {
  await admin.open("profile");
  await admin.field("Nickname").fill("History test");
  await admin.save();
  await admin.open("history");
  await page
    .getByRole("button", { name: "Compare with draft" })
    .first()
    .click();
  await expect(page.getByText("History test").first()).toBeVisible();
  await page.getByRole("button", { name: "Load into editor" }).click();
  await expect(page.getByText("Unsaved changes")).toBeVisible();
});

test("refuses to import invalid JSON content and lists the problems", async ({
  admin,
  page,
}) => {
  await admin.open("import");
  await page.locator("input[type=file]").setInputFiles({
    name: "bad.json",
    mimeType: "application/json",
    buffer: Buffer.from('{"pages":[]}'),
  });
  await expect(
    page.getByRole("list", { name: "Import problems" }),
  ).toBeVisible();
  await expect(page.getByText("Unsaved changes")).toHaveCount(0);
});

test("imports publications from BibTeX into a publications block", async ({
  admin,
  page,
}) => {
  await admin.open("import");
  await page.getByRole("tab", { name: "Publications (BibTeX)" }).click();
  await page.getByRole("textbox", { name: "BibTeX" }).fill(BIBTEX);
  await expect(
    page
      .getByRole("list", { name: "Entries found" })
      .getByText("A Study of Things"),
  ).toBeVisible();
  await page.getByRole("button", { name: "Add 1 publication" }).click();
  await page.getByRole("button", { name: "Review changes" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByText(/A Study of Things/).first()).toBeVisible();
  await expect(dialog.getByText(/Jane Doe, John Smith/).first()).toBeVisible();
  /* One added entry; its fields (DOI link, dates) are covered by the BibTeX unit tests. */
  await expect(
    page.getByRole("dialog", { name: "Review changes (1)" }),
  ).toBeVisible();
});

test("prefills the draft from a JSON Resume file", async ({ admin, page }) => {
  await admin.open("import");
  await page.getByRole("tab", { name: "Resume (JSON Resume)" }).click();
  await page.locator("input[type=file]").setInputFiles({
    name: "resume.json",
    mimeType: "application/json",
    buffer: Buffer.from(RESUME),
  });
  await page.getByRole("button", { name: "Import into the draft" }).click();
  await admin.open("profile");
  await expect(admin.field("Full name")).toHaveValue("Ada Lovelace");
});

test("shows a palette live in the preview and checks its contrast", async ({
  admin,
  page,
}) => {
  await admin.open("theme");
  const card = page.getByRole("article").first();
  await expect(card.getByRole("table")).toBeVisible();
  const second = page.getByRole("article").nth(1);
  await second.getByRole("button", { name: "Preview live" }).click();
  await expect(
    page.getByText("Showing the draft palette; save to keep it."),
  ).toBeVisible();
  const site = page.frameLocator("iframe[title='Site preview']");
  const accent = await site
    .locator("html")
    .evaluate((el) => el.style.getPropertyValue("--accent"));
  expect(accent).not.toBe("");
});

test("previews search and sharing and warns about lengths", async ({
  admin,
  page,
}) => {
  await admin.open("seo");
  await expect(
    page.getByRole("figure", { name: "Search result preview" }),
  ).toBeVisible();
  await admin.field("Site title").fill("Hi");
  await expect(page.getByText(/Site title is short/)).toBeVisible();
});

test("runs the health check and jumps to a finding", async ({
  admin,
  page,
}) => {
  await admin.open("seo");
  await admin.field("Site title").fill("");
  await admin.open("health");
  const findings = page.getByRole("list", { name: "Findings" });
  await expect(findings.getByText("Site title is empty")).toBeVisible();
  await findings
    .getByRole("listitem")
    .filter({ hasText: "Site title is empty" })
    .getByRole("button", { name: "Go to field" })
    .click();
  await expect(page).toHaveURL(/\/admin\/seo\?focus=site\.seo\.title/);
});

test("walks the setup wizard and clears sample content", async ({
  admin,
  page,
}) => {
  await admin.open("setup");
  await page.getByRole("button", { name: "5. Sample content" }).click();
  await page.getByLabel("Skill groups").check();
  await page.getByRole("button", { name: "Clear the ticked content" }).click();
  await admin.open("skills");
  await expect(
    page.getByRole("region", { name: "Skills" }).getByText("0"),
  ).toBeVisible();
});

test("shows the guides and the git status", async ({ admin, page }) => {
  await admin.open("docs");
  await expect(
    page.getByRole("heading", { name: "Getting started" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Keyboard shortcuts" }).click();
  await expect(page.getByRole("table")).toBeVisible();
  await admin.open("publish");
  await expect(
    page.getByRole("button", { name: "Run pnpm build" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Commit content" }),
  ).toBeVisible();
});
