/**
 * File: playwright.config.ts
 * Purpose: End-to-end tests of the admin console and the site in a real browser, against the dev
 *          server, with accessibility checks. Tests run one at a time because they share the
 *          content file, which global setup backs up and teardown restores.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import { defineConfig, devices } from "@playwright/test";

const PORT = 5174;
const CI_RETRIES = 1;

export default defineConfig({
  testDir: "e2e",
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? CI_RETRIES : 0,
  reporter: process.env.CI ? [["github"], ["list"]] : "list",
  globalSetup: "./e2e/globalSetup.ts",
  globalTeardown: "./e2e/globalTeardown.ts",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
    viewport: { width: 1600, height: 1000 },
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1600, height: 1000 },
        /* Lets a preinstalled Chromium be used where downloading browsers is not possible. */
        launchOptions: process.env.PLAYWRIGHT_CHROMIUM_PATH
          ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH }
          : {},
      },
    },
  ],
  webServer: {
    command: `pnpm exec vite --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}/admin`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
