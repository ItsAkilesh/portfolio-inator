/**
 * File: admin-core.spec.ts
 * Purpose: End-to-end tests of editing in the admin console: saving without a page reload, undo and
 *          redo, reviewing changes, keeping unsaved edits across a reload, search, and validation.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import { readContent } from "./project";
import { expect, test } from "./fixtures";

test("saves an edit to portfolio.json without reloading the console", async ({
  admin,
  page,
}) => {
  await admin.open("profile");
  await page.evaluate(() => Object.assign(window, { __marker: true }));
  await admin.field("Nickname").fill("E2E nickname");
  await expect(page.getByText("Unsaved changes")).toBeVisible();
  await admin.save();
  expect(
    await page.evaluate(
      () => (window as unknown as { __marker?: boolean }).__marker,
    ),
  ).toBe(true);
  const content = (await readContent()) as {
    site: { profile: { nickname: string } };
  };
  expect(content.site.profile.nickname).toBe("E2E nickname");
});

test("undoes and redoes edits with the keyboard and the history menu", async ({
  admin,
  page,
}) => {
  await admin.open("profile");
  const nickname = admin.field("Nickname");
  const original = await nickname.inputValue();
  await nickname.fill("First");
  await page.waitForTimeout(1100);
  await nickname.fill("Second");
  await page.keyboard.press("Control+z");
  await expect(nickname).toHaveValue("First");
  await page.keyboard.press("Control+z");
  await expect(nickname).toHaveValue(original);
  await page.keyboard.press("Control+Shift+z");
  await expect(nickname).toHaveValue("First");
  await page.getByLabel("Undo and redo").getByText("History").click();
  await page
    .getByRole("button", { name: /Undo back to before/ })
    .first()
    .click();
  await expect(nickname).toHaveValue(original);
});

test("reviews changes and undoes one of them", async ({ admin, page }) => {
  await admin.open("profile");
  await admin.field("Nickname").fill("Reviewed");
  await admin.field("Header name").fill("Changed header");
  await page.getByRole("button", { name: "Review changes" }).click();
  const dialog = page.getByRole("dialog", { name: /Review changes \(2\)/ });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText("Reviewed")).toBeVisible();
  await dialog.getByRole("button", { name: "Undo this" }).first().click();
  await expect(
    page.getByRole("dialog", { name: /Review changes \(1\)/ }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("offers to restore unsaved edits after a reload", async ({
  admin,
  page,
}) => {
  await admin.open("profile");
  await admin.field("Nickname").fill("Kept across reload");
  await page.waitForTimeout(700);
  page.once("dialog", (dialog) => void dialog.accept());
  await page.reload();
  const banner = page.getByRole("region", { name: "Unsaved edits found" });
  await expect(banner).toBeVisible();
  await banner.getByRole("button", { name: "Restore" }).click();
  await expect(admin.field("Nickname")).toHaveValue("Kept across reload");
});

test("searches the content and jumps to the field", async ({ admin, page }) => {
  await admin.open("pages");
  await page.keyboard.press("Control+k");
  const search = page.getByRole("combobox", {
    name: "Search sections and content",
  });
  await search.fill("carnegie mellon");
  await expect(
    page.getByRole("dialog").getByRole("option").first(),
  ).toContainText("Carnegie Mellon");
  await search.press("Enter");
  await expect(page).toHaveURL(/\/admin\/pages\?focus=pages\.\d+\.blocks/);
  const focused = page.locator("[data-focused]");
  await expect(focused).toBeVisible();
  await expect(page.locator("input:focus, textarea:focus")).toHaveValue(
    /Carnegie Mellon/,
  );
});

test("blocks saving invalid content and shows the problem on the field", async ({
  admin,
  page,
}) => {
  await admin.open("socials");
  await page
    .getByRole("main")
    .locator("[data-item]")
    .first()
    .locator("[data-summary]")
    .click();
  await admin.field("Link").first().fill("javascript:alert(1)");
  await expect(page.getByRole("alert").first()).toContainText("Use https://");
  await expect(
    page.getByRole("button", { name: "Save", exact: true }),
  ).toBeDisabled();
  await expect(
    page.getByRole("link", { name: /Social links/ }).locator("span"),
  ).toHaveText("1");
});
