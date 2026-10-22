/**
 * File: ThemeProvider.test.tsx
 * Purpose: Tests the defaultMode and showThemeToggle options end to end through the header.
 * Author: Akilesh
 * Date: 2026-10-20
 */
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { Header } from "../components/layout/Header";
import { theme } from "../portfolio";
import type { ThemeConfig } from "../types/theme";
import { ThemeProvider } from "./ThemeProvider";

const STORAGE_KEY = "portfolio.colorMode";
const TOGGLE_NAME = /switch to (dark|light) theme/i;

function renderHeader(overrides: Partial<ThemeConfig>) {
  return render(
    <ThemeProvider config={{ ...theme, ...overrides }}>
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    </ThemeProvider>,
  );
}

describe("theme options", () => {
  it("forces the default mode and hides the toggle when showThemeToggle is false", () => {
    window.localStorage.setItem(STORAGE_KEY, "light");
    renderHeader({ defaultMode: "dark", showThemeToggle: false });
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(screen.queryByRole("button", { name: TOGGLE_NAME })).toBeNull();
  });

  it("restores a visitor's saved choice when the toggle is shown", () => {
    window.localStorage.setItem(STORAGE_KEY, "light");
    renderHeader({ defaultMode: "dark", showThemeToggle: true });
    expect(document.documentElement.dataset.theme).toBe("light");
    expect(screen.getByRole("button", { name: TOGGLE_NAME })).toBeTruthy();
  });

  it("uses the default mode when nothing is saved", () => {
    renderHeader({ defaultMode: "light", showThemeToggle: true });
    expect(document.documentElement.dataset.theme).toBe("light");
  });

  it("ignores malformed saved values", () => {
    window.localStorage.setItem(STORAGE_KEY, "purple");
    renderHeader({ defaultMode: "dark", showThemeToggle: true });
    expect(document.documentElement.dataset.theme).toBe("dark");
  });
});
