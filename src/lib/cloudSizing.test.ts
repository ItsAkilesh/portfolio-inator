/**
 * File: cloudSizing.test.ts
 * Purpose: Tests for icon polyhedron sizing.
 * Author: Akilesh
 * Date: 2026-10-20
 */
import { describe, expect, it } from "vitest";
import { cloudRadius, discSize, iconSize, RADIUS_RATIO } from "./cloudSizing";

describe("discSize", () => {
  it("keeps the full disc for small clouds", () => {
    expect(discSize(10)).toBe(48);
    expect(discSize(34)).toBe(48);
  });
  it("shrinks with the square root of the count", () => {
    expect(discSize(61)).toBe(36);
  });
  it("never goes below the minimum, even for huge or invalid counts", () => {
    expect(discSize(500)).toBe(34);
    expect(discSize(0)).toBe(48);
    expect(discSize(-5)).toBe(48);
  });
});

describe("iconSize", () => {
  it("is half the disc", () => {
    expect(iconSize(34)).toBe(24);
    expect(iconSize(61)).toBe(18);
  });
});

describe("cloudRadius", () => {
  it("uses the container ratio when it already spaces icons enough", () => {
    expect(cloudRadius(400, 20)).toBe(400 * RADIUS_RATIO);
  });
  it("grows past the container when many icons need room", () => {
    const radius = cloudRadius(300, 200);
    expect(radius).toBeGreaterThan(300 * RADIUS_RATIO);
    const spacing = radius * Math.sqrt((4 * Math.PI) / 200);
    expect(spacing).toBeCloseTo(discSize(200) * 2, 5);
  });
  it("increases with the icon count for a fixed container", () => {
    expect(cloudRadius(300, 150)).toBeLessThan(cloudRadius(300, 250));
  });
  it("handles an empty cloud", () => {
    expect(cloudRadius(300, 0)).toBe(300 * RADIUS_RATIO);
  });
});
