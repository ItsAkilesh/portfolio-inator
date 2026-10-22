/**
 * File: color.test.ts
 * Purpose: Tests for brand color legibility helpers.
 * Author: Akilesh
 * Date: 2026-10-20
 */
import { describe, expect, it } from "vitest";
import { brandColorFor, INK_FALLBACK, relativeLuminance } from "./color";

describe("relativeLuminance", () => {
  it("returns 0 for black and 1 for white", () => {
    expect(relativeLuminance("#000000")).toBe(0);
    expect(relativeLuminance("#FFFFFF")).toBeCloseTo(1);
  });
  it("rejects malformed values", () => {
    expect(relativeLuminance("#fff")).toBeNull();
    expect(relativeLuminance("red")).toBeNull();
    expect(relativeLuminance("")).toBeNull();
  });
});

describe("brandColorFor", () => {
  it("keeps mid-luminance brand colors", () => {
    expect(brandColorFor("#0A66C2")).toBe("#0A66C2");
  });
  it("falls back to ink for near-black, near-white and invalid colors", () => {
    expect(brandColorFor("#181717")).toBe(INK_FALLBACK);
    expect(brandColorFor("#FFFFFF")).toBe(INK_FALLBACK);
    expect(brandColorFor("nope")).toBe(INK_FALLBACK);
  });
});
