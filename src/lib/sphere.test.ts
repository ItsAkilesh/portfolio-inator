/**
 * File: sphere.test.ts
 * Purpose: Tests for the icon cloud sphere math.
 * Author: Akilesh
 * Date: 2026-10-20
 */
import { describe, expect, it } from "vitest";
import {
  fibonacciOffsets,
  fibonacciSphere,
  neighborEdges,
  project,
  rotate,
} from "./sphere";

const length = (p: { x: number; y: number; z: number }) =>
  Math.hypot(p.x, p.y, p.z);

describe("fibonacciSphere", () => {
  it("returns the requested number of unit-length points", () => {
    const points = fibonacciSphere(34);
    expect(points).toHaveLength(34);
    for (const p of points) expect(length(p)).toBeCloseTo(1, 6);
  });
  it("spans from top to bottom", () => {
    const points = fibonacciSphere(10);
    expect(points[0]?.y).toBe(1);
    expect(points[9]?.y).toBe(-1);
  });
  it("handles zero, negative and single counts", () => {
    expect(fibonacciSphere(0)).toEqual([]);
    expect(fibonacciSphere(-3)).toEqual([]);
    expect(fibonacciSphere(1)).toEqual([{ x: 0, y: 0, z: 1 }]);
  });
});

describe("rotate", () => {
  it("keeps points on the sphere", () => {
    expect(length(rotate({ x: 0.6, y: 0.8, z: 0 }, 1.2, -0.7))).toBeCloseTo(
      1,
      9,
    );
  });
  it("is the identity for zero angles", () => {
    expect(rotate({ x: 0.1, y: 0.2, z: 0.3 }, 0, 0)).toEqual({
      x: 0.1,
      y: 0.2,
      z: 0.3,
    });
  });
  it("turns the front point to the side after a quarter turn around Y", () => {
    const turned = rotate({ x: 0, y: 0, z: 1 }, 0, Math.PI / 2);
    expect(turned.x).toBeCloseTo(1);
    expect(turned.z).toBeCloseTo(0);
  });
});

describe("project", () => {
  it("makes front points larger, brighter and higher in the stack than back points", () => {
    const front = project({ x: 0, y: 0, z: 1 }, 100);
    const back = project({ x: 0, y: 0, z: -1 }, 100);
    expect(front.scale).toBe(1);
    expect(front.opacity).toBe(1);
    expect(back.scale).toBeLessThan(front.scale);
    expect(back.opacity).toBeLessThan(front.opacity);
    expect(front.layer).toBeGreaterThan(back.layer);
  });
  it("scales offsets by the radius and clamps out-of-range depth", () => {
    expect(project({ x: 0.5, y: -0.5, z: 0 }, 200)).toMatchObject({
      x: 100,
      y: -100,
    });
    expect(project({ x: 0, y: 0, z: 5 }, 10).scale).toBe(1);
  });
});

describe("fibonacciOffsets", () => {
  it("lists Fibonacci numbers below the limit", () => {
    expect(fibonacciOffsets(30)).toEqual([1, 2, 3, 5, 8, 13, 21]);
  });
  it("is empty for tiny limits", () => {
    expect(fibonacciOffsets(1)).toEqual([]);
    expect(fibonacciOffsets(0)).toEqual([]);
  });
});

describe("neighborEdges", () => {
  it.each([6, 12, 34, 60])(
    "connects every one of %i vertices to 3 or more neighbors",
    (n) => {
      const edges = neighborEdges(fibonacciSphere(n));
      const degree = new Array<number>(n).fill(0);
      for (const [a, b] of edges) {
        degree[a] = (degree[a] ?? 0) + 1;
        degree[b] = (degree[b] ?? 0) + 1;
      }
      expect(Math.min(...degree)).toBeGreaterThanOrEqual(3);
      expect(Math.max(...degree)).toBeLessThanOrEqual(8);
    },
  );
  it("returns unique, ordered pairs", () => {
    const edges = neighborEdges(fibonacciSphere(34));
    const keys = edges.map(([a, b]) => `${a}-${b}`);
    expect(new Set(keys).size).toBe(keys.length);
    expect(edges.every(([a, b]) => a < b)).toBe(true);
  });
  it("handles empty and single-point inputs", () => {
    expect(neighborEdges([])).toEqual([]);
    expect(neighborEdges(fibonacciSphere(1))).toEqual([]);
  });
});
