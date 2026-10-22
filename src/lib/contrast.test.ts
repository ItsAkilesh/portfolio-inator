/**
 * File: contrast.test.ts
 * Purpose: Tests for colour parsing and WCAG contrast ratios.
 * Author: Akilesh
 * Date: 2026-10-22
 */
import { describe, expect, it } from "vitest";
import { contrastRatio, gradeOf, parseColor } from "./contrast";

describe("parseColor", () => {
  it("reads hex, rgb, hsl and oklch", () => {
    expect(parseColor("#fff")).toEqual([1, 1, 1]);
    expect(parseColor("#000000")).toEqual([0, 0, 0]);
    expect(parseColor("rgb(255 0 0)")).toEqual([1, 0, 0]);
    expect(parseColor("rgba(0, 0, 255, 0.5)")).toEqual([0, 0, 1]);
    const red = parseColor("hsl(0 100% 50%)");
    expect(red?.map((c) => Math.round(c * 255))).toEqual([255, 0, 0]);
    const white = parseColor("oklch(1 0 0)");
    expect(white?.map((c) => Math.round(c * 255))).toEqual([255, 255, 255]);
    const black = parseColor("oklch(0% 0 0)");
    expect(black?.map((c) => Math.round(c * 255))).toEqual([0, 0, 0]);
  });
  it("matches a known oklch colour within rounding", () => {
    /* oklch(0.628 0.258 29.23) is about #ff0000. */
    const rgb = parseColor("oklch(0.628 0.2577 29.23)")?.map((c) =>
      Math.round(c * 255),
    );
    expect(rgb?.[0]).toBeGreaterThan(250);
    expect(rgb?.[1]).toBeLessThan(10);
  });
  it("returns null for what it cannot read", () => {
    for (const value of [
      "red",
      "var(--ink)",
      "color-mix(in srgb, red, blue)",
      "#12",
    ])
      expect(parseColor(value)).toBeNull();
  });
});

describe("contrastRatio", () => {
  it("gives 21 for black on white and 1 for equal colours, in either order", () => {
    expect(contrastRatio("#000", "#fff")).toBeCloseTo(21, 5);
    expect(contrastRatio("#fff", "#000")).toBeCloseTo(21, 5);
    expect(contrastRatio("#777", "#777")).toBeCloseTo(1, 5);
    expect(contrastRatio("#777", "nope")).toBeNull();
  });
  it("grades ratios by WCAG thresholds", () => {
    expect([gradeOf(7.1), gradeOf(4.6), gradeOf(3.2), gradeOf(2)]).toEqual([
      "AAA",
      "AA",
      "AA large",
      "Fail",
    ]);
    expect(contrastRatio("#767676", "#ffffff")).toBeGreaterThanOrEqual(4.5);
  });
});
