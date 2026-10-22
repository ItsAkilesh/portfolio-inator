/**
 * File: fixtures.ts
 * Purpose: Shared end-to-end fixtures: every test starts from the backed-up project files, fails on
 *          any uncaught page error, and gets helpers to open admin sections and wait for saves.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import { test as base, expect, type Page } from "@playwright/test";
import { restoreProject } from "./project";

/** Time for the dev server to notice restored files before the next page load. */
const SETTLE_MS = 800;

export interface Admin {
  readonly page: Page;
  open: (section: string) => Promise<void>;
  save: () => Promise<void>;
  /** Text field by its label inside the editor. */
  field: (label: string) => ReturnType<Page["getByLabel"]>;
}

export const test = base.extend<{ admin: Admin; pageErrors: string[] }>({
  pageErrors: async ({ page }, use) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await use(errors);
    expect(errors, "uncaught page errors").toEqual([]);
  },
  admin: async ({ page, pageErrors }, use) => {
    void pageErrors;
    if (await restoreProject()) await page.waitForTimeout(SETTLE_MS);
    const admin: Admin = {
      page,
      /* The first visit loads the console; later ones navigate inside it, keeping the draft. */
      open: async (section) => {
        if (
          new URL(page.url() || "about:blank", "http://x").pathname.startsWith(
            "/admin",
          )
        )
          await page.evaluate((path) => {
            window.history.pushState({}, "", path);
            window.dispatchEvent(new PopStateEvent("popstate"));
          }, `/admin/${section}`);
        else await page.goto(`/admin/${section}`);
        await expect(
          page.getByRole("navigation", { name: "Admin sections" }),
        ).toBeVisible();
        await expect(page.getByText("Loading…")).toHaveCount(0);
      },
      save: async () => {
        await page.getByRole("button", { name: "Save", exact: true }).click();
        await expect(page.getByText("Saved to portfolio.json")).toBeVisible();
      },
      field: (label) =>
        page.getByRole("main").getByLabel(label, { exact: true }),
    };
    await use(admin);
    await restoreProject();
  },
});

export { expect };
