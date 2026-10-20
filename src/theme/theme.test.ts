/**
 * File: theme.test.ts
 * Purpose: Tests for palette generation, CSS variable mapping, theme application and font loading.
 * Author: Akilesh
 * Date: 2026-10-20
 */
import { describe, expect, it } from "vitest";
import type { ThemeConfig } from "../types/theme";
import {
  applyTheme,
  loadFontStylesheet,
  paletteToCssVars,
  resolvePalette,
} from "./cssVars";
import { makePalette } from "./makePalette";

const fonts = { display: "A", body: "B", mono: "C", stylesheet: "" };
const config = (overrides: Partial<ThemeConfig> = {}): ThemeConfig => ({
  defaultMode: "system",
  activePalette: "klein",
  palettes: {
    klein: makePalette({ hue: 266 }),
    green: makePalette({ hue: 155 }),
  },
  fonts,
  ...overrides,
});

describe("makePalette", () => {
  it("uses the hue in every token", () => {
    const palette = makePalette({ hue: 155 });
    expect(
      Object.values(palette.light).every((value) => value.includes(" 155")),
    ).toBe(true);
  });
  it("normalizes out-of-range hues and clamps chroma and lightness", () => {
    const palette = makePalette({ hue: -94, chroma: 9, lightness: 0.95 });
    expect(palette.light.accent).toBe("oklch(0.5 0.37 266)");
  });
});

describe("resolvePalette", () => {
  it("returns the active palette", () => {
    const cfg = config({ activePalette: "green" });
    expect(resolvePalette(cfg)).toBe(cfg.palettes.green);
  });
  it("falls back to the first palette when the name is unknown", () => {
    const cfg = config({ activePalette: "missing" });
    expect(resolvePalette(cfg)).toBe(cfg.palettes.klein);
  });
  it("throws when no palettes exist", () => {
    expect(() => resolvePalette(config({ palettes: {} }))).toThrow(/empty/);
  });
});

describe("paletteToCssVars and applyTheme", () => {
  it("maps every token to a custom property", () => {
    const vars = paletteToCssVars(makePalette({ hue: 1 }).dark);
    expect(Object.keys(vars)).toHaveLength(11);
    expect(vars["--on-accent-muted"]).toContain("oklch");
  });
  it("writes variables and the mode onto the root element", () => {
    const root = document.createElement("html");
    applyTheme(root, config(), "dark");
    expect(root.dataset.theme).toBe("dark");
    expect(root.style.getPropertyValue("--bg")).toContain("0.15");
    expect(root.style.getPropertyValue("--font-mono")).toBe("C");
  });
});

describe("loadFontStylesheet", () => {
  it("adds an allowed stylesheet once", () => {
    loadFontStylesheet(document, "https://fonts.googleapis.com/css2?family=X");
    loadFontStylesheet(document, "https://fonts.googleapis.com/css2?family=Y");
    expect(document.querySelectorAll("#theme-fonts")).toHaveLength(1);
    document.getElementById("theme-fonts")?.remove();
  });
  it("blocks unknown hosts and ignores empty values", () => {
    loadFontStylesheet(document, "https://evil.example.com/font.css");
    loadFontStylesheet(document, "");
    expect(document.getElementById("theme-fonts")).toBeNull();
  });
});
