/**
 * File: admin-assets.spec.ts
 * Purpose: End-to-end tests of icons and images: picking a simple-icons icon that is not in the
 *          library from an icon field (the console reloads and keeps the edit), importing an SVG,
 *          and uploading (optimised to WebP), renaming and removing images.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { readContent } from "./project";
import { expect, test } from "./fixtures";

const LIBRARY = resolve(process.cwd(), "src/icons/library.json");
const SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><script>alert(1)</script><circle cx="12" cy="12" r="10"/></svg>';
const SAMPLE_IMAGE = resolve(process.cwd(), "public/images/portrait.webp");

test("adds a simple-icons icon from an icon field without uploading anything", async ({
  admin,
  page,
}) => {
  await admin.open("socials");
  await page
    .getByRole("main")
    .locator("[data-summary]", { hasText: "GitHub" })
    .first()
    .click();
  const icon = page.getByRole("main").getByRole("combobox").first();
  await icon.fill("gitlab");
  const option = page.getByRole("option", {
    name: /GitLab add from simple-icons/,
  });
  await expect(option).toBeVisible();
  await option.dispatchEvent("pointerdown");
  await expect(page.getByText("Your unsaved edits were restored")).toBeVisible({
    timeout: 20_000,
  });
  expect(JSON.parse(await readFile(LIBRARY, "utf8")).simpleIcons.gitlab).toBe(
    "gitlab",
  );
  /* The console reloads once; ?focus reopens the link and the restored draft has the new icon. */
  await expect(
    page.getByRole("main").getByRole("combobox").first(),
  ).toHaveValue("gitlab");
  await admin.save();
});

test("imports an SVG as a custom icon, keeping only its shapes", async ({
  admin,
  page,
}) => {
  await admin.open("icons");
  await page.getByRole("button", { name: "Import SVG" }).click();
  const dialog = page.getByRole("dialog", { name: "Import an SVG icon" });
  await dialog.getByLabel("SVG file").setInputFiles({
    name: "my-dot.svg",
    mimeType: "image/svg+xml",
    buffer: Buffer.from(SVG),
  });
  await expect(dialog.getByLabel("Key (used in the content)")).toHaveValue(
    "mydot",
  );
  await dialog.getByRole("button", { name: "Import icon" }).click();
  await expect
    .poll(async () => JSON.parse(await readFile(LIBRARY, "utf8")).custom.mydot)
    .toBeTruthy();
  const custom = JSON.parse(await readFile(LIBRARY, "utf8")).custom.mydot as {
    path: string;
  };
  expect(custom.path).toMatch(/^M2 12a10 10/);
  expect(custom.path).not.toContain("script");
});

test("searches simple-icons from the icon library page", async ({
  admin,
  page,
}) => {
  await admin.open("icons");
  await page
    .getByRole("textbox", { name: "Search simple-icons" })
    .fill("kotlin");
  const results = page.getByRole("list", { name: "simple-icons results" });
  await expect(results.getByText("Kotlin", { exact: true })).toBeVisible();
  await expect(
    page
      .getByRole("list", { name: "Icons in the library" })
      .getByText("github", { exact: true }),
  ).toBeVisible();
});

test("uploads an image optimised to WebP, renames it, then removes it", async ({
  admin,
  page,
}) => {
  await admin.open("media");
  await page.locator("input[type=file][multiple]").setInputFiles({
    name: "Test Photo.webp",
    mimeType: "image/webp",
    buffer: await readFile(SAMPLE_IMAGE),
  });
  await expect(
    page.getByText(/Uploaded test-photo|Optimised to WebP/),
  ).toBeVisible();
  const name = page.getByRole("textbox", { name: /^Name of test-photo/ });
  await expect(name).toBeVisible();
  const original =
    (await name.getAttribute("aria-label"))?.replace("Name of ", "") ?? "";
  const ext = original.slice(original.lastIndexOf("."));
  await name.fill(`renamed-photo${ext}`);
  const card = page.locator("li", {
    has: page.getByRole("textbox", { name: `Name of ${original}` }),
  });
  await card.getByRole("button", { name: "Rename" }).click();
  await expect(page.getByText(/Renamed to renamed-photo/)).toBeVisible();
  const renamed = page.locator("li", {
    has: page.getByRole("textbox", { name: `Name of renamed-photo${ext}` }),
  });
  await renamed.getByRole("button", { name: "Remove" }).click();
  await expect(page.getByText(/moved to \.admin-history\/trash/)).toBeVisible();
  await expect(
    page.getByRole("textbox", { name: `Name of renamed-photo${ext}` }),
  ).toHaveCount(0);
});

test("renaming a used image updates its references", async ({
  admin,
  page,
}) => {
  await admin.open("media");
  const card = page.locator("li", {
    has: page.getByRole("textbox", { name: "Name of nurtem.webp" }),
  });
  await card.getByRole("textbox").fill("nurtem-logo.webp");
  await card.getByRole("button", { name: "Rename" }).click();
  await expect(page.getByText(/Renamed to nurtem-logo.webp/)).toBeVisible();
  const text = JSON.stringify(await readContent());
  expect(text).toContain("nurtem-logo.webp");
  expect(text).not.toContain('"nurtem.webp"');
  await expect(card.getByRole("button", { name: "Remove" })).toHaveCount(0);
});
