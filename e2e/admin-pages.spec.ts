/**
 * File: admin-pages.spec.ts
 * Purpose: End-to-end tests of building pages: templates, duplicating, the block palette and
 *          inserting between blocks, drag-and-drop, the date picker, and the live preview (device
 *          widths, revealing the block being edited, and click-to-edit).
 * Author: Akilesh
 * Date: 2026-10-21 (updated 2026-10-22)
 */
import { readContent } from "./project";
import { expect, test, type Admin } from "./fixtures";

interface Page {
  readonly id: string;
  readonly path: string;
  readonly blocks: readonly { readonly type: string }[];
}
const pagesOf = async () => (await readContent()).pages as Page[];

const openItem = async (admin: Admin, name: string) => {
  const summary = admin.page
    .getByRole("main")
    .locator("[data-summary]", { hasText: name })
    .first();
  await summary.click();
  return summary.locator("xpath=../..");
};

test("adds a page from a template, saves it and serves it at its path", async ({
  admin,
  page,
}) => {
  await admin.open("pages");
  await page.getByRole("button", { name: "Add page" }).click();
  await page
    .getByRole("list", { name: "Page templates" })
    .getByRole("button", { name: /Talks/ })
    .click();
  await admin.save();
  const talks = (await pagesOf()).find((p) => p.id === "talks");
  expect(talks?.blocks.map((b) => b.type)).toEqual(["header", "timeline"]);
  await page.goto("/talks");
  await expect(
    page.getByRole("heading", { level: 1, name: "Talks" }),
  ).toBeVisible();
});

test("duplicates a page with a unique id and path", async ({ admin, page }) => {
  await admin.open("pages");
  await page.getByRole("button", { name: "Duplicate Education" }).click();
  await admin.save();
  const copy = (await pagesOf()).find((p) => p.id === "education-copy");
  expect(copy?.path).toBe("/education-copy");
});

test("adds a block from the palette and inserts another between blocks", async ({
  admin,
  page,
}) => {
  await admin.open("pages");
  const home = await openItem(admin, "Home");
  await home.getByRole("button", { name: "Add block" }).click();
  await home
    .getByRole("list", { name: "Block types" })
    .getByRole("button", { name: /^Text/ })
    .click();
  await home
    .getByRole("button", { name: "Insert a block here" })
    .first()
    .click();
  await home
    .getByRole("list", { name: "Block types" })
    .getByRole("button", { name: /^Image/ })
    .click();
  const types = await page
    .locator("[data-item][data-path]")
    .evaluateAll((items) =>
      items
        .filter((d) =>
          /^pages\.0\.blocks\.\d+$/.test(d.getAttribute("data-path") ?? ""),
        )
        .map((d) => d.querySelector("[data-summary]")?.textContent ?? ""),
    );
  expect(types[0]).toMatch(/Hero/);
  expect(types[1]).toMatch(/Image/);
  expect(types.at(-1)).toMatch(/Text/);
});

test("reorders blocks by dragging the handle", async ({ admin, page }) => {
  await admin.open("pages");
  const home = await openItem(admin, "Home");
  const blocks = home.locator(
    "[data-item][data-path='pages.0.blocks.0'], [data-item][data-path='pages.0.blocks.1']",
  );
  const before = await blocks.locator("[data-summary]").allTextContents();
  const handle = blocks.nth(1).locator("[title='Drag to reorder']");
  /* Opening the page also loads it in the preview; wait for the layout to settle before dragging. */
  await page.waitForLoadState("networkidle");
  await handle.dragTo(blocks.nth(0), { targetPosition: { x: 40, y: 6 } });
  /* Assertions that retry: the reorder renders just after the drop. */
  await expect(blocks.nth(0).locator("[data-summary]")).toHaveText(
    before[1] ?? "",
  );
  await expect(blocks.nth(1).locator("[data-summary]")).toHaveText(
    before[0] ?? "",
  );
});

test("edits dates with an optional month and day and Present", async ({
  admin,
}) => {
  await admin.open("pages");
  const experience = await openItem(admin, "Experience");
  await experience
    .locator("[data-summary]", { hasText: "Timeline" })
    .first()
    .click();
  await experience
    .locator("[data-summary]", { hasText: "Work" })
    .first()
    .click();
  const entry = experience
    .locator("[data-item] [data-item] [data-item]")
    .first();
  await entry.locator("[data-summary]").first().click();
  const end = entry.locator("[data-path$='dates.end']");
  await end.getByLabel("Present").check();
  await expect(end.getByLabel("Year")).toBeDisabled();
  await end.getByLabel("Present").uncheck();
  await end.getByLabel("Year").fill("2027");
  await expect(end.getByLabel("Day (optional)")).toBeDisabled();
  await end.getByLabel("Month (optional)").selectOption("2");
  await end.getByLabel("Day (optional)").selectOption("28");
  await expect(end.getByLabel("Day (optional)").locator("option")).toHaveCount(
    29,
  );
  await admin.save();
  const text = JSON.stringify(await readContent());
  expect(text).toContain('"end":"2027-02-28"');
});

test("previews at phone width and reveals the block being edited", async ({
  admin,
  page,
}) => {
  await admin.open("pages");
  await page
    .getByRole("group", { name: "Preview width" })
    .getByRole("button", { name: "phone" })
    .click();
  const frame = page.locator("iframe[title='Site preview']");
  await expect(frame).toHaveAttribute("style", /width: 390px/);
  await openItem(admin, "Research");
  await expect(frame).toHaveAttribute("src", "/research");
});

test("opens a block's fields when it is clicked in the preview", async ({
  admin,
  page,
}) => {
  await admin.open("pages");
  await page.getByLabel("Click to edit").check();
  const site = page.frameLocator("iframe[title='Site preview']");
  /* Clicks only open fields once the frame's bridge has loaded and switched click-to-edit on. */
  await expect(site.locator("html[data-admin-edit]")).toHaveCount(1);
  await site
    .locator("[data-block-index='1']")
    .locator("xpath=*")
    .first()
    .click({ position: { x: 20, y: 20 } });
  await expect(page).toHaveURL(/focus=pages\.0\.blocks\.1/);
  await expect(
    page.locator("[data-item][data-path='pages.0.blocks.1']"),
  ).toHaveAttribute("data-open", "true");
});
