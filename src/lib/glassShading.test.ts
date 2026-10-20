/**
 * File: glassShading.test.ts
 * Purpose: Tests for polyhedron face normals and glass shading.
 * Author: Akilesh
 * Date: 2026-10-20
 */
import { describe, expect, it } from "vitest";
import { faceNormal, shadeFace } from "./glassShading";
import { fibonacciSphere, neighborEdges, triangleFaces } from "./sphere";

const tri = (x: number, y: number, z: number, spread = 0.05) =>
  [
    { x: x + spread, y, z },
    { x, y: y + spread, z },
    { x, y, z: z + spread },
  ] as const;

describe("faceNormal", () => {
  it("points outward along the centroid", () => {
    const n = faceNormal(...tri(0, 0, 1));
    expect(n.z).toBeGreaterThan(0.9);
    expect(Math.hypot(n.x, n.y, n.z)).toBeCloseTo(1);
  });
});

describe("shadeFace", () => {
  it("marks faces turned away from the viewer as back faces", () => {
    expect(shadeFace(...tri(0, 0, -1))).toEqual({
      isFront: false,
      opacity: 0.015,
    });
  });
  it("lights faces toward the light more than faces away from it", () => {
    const lit = shadeFace(...tri(-0.45, -0.6, 0.66));
    const unlit = shadeFace(...tri(0.6, 0.7, 0.2));
    expect(lit.isFront && unlit.isFront).toBe(true);
    expect(lit.opacity).toBeGreaterThan(unlit.opacity);
  });
  it("never exceeds full opacity", () => {
    expect(shadeFace(...tri(-0.2, -0.3, 0.9)).opacity).toBeLessThanOrEqual(1);
  });
});

describe("triangleFaces", () => {
  it("finds roughly 2n faces on a closed lattice, each built from existing edges", () => {
    const points = fibonacciSphere(34);
    const edges = neighborEdges(points);
    const faces = triangleFaces(edges, points.length);
    const edgeSet = new Set(edges.map(([a, b]) => `${a}-${b}`));
    expect(faces.length).toBeGreaterThan(50);
    for (const [a, b, c] of faces) {
      expect(
        edgeSet.has(`${a}-${b}`) &&
          edgeSet.has(`${b}-${c}`) &&
          edgeSet.has(`${a}-${c}`),
      ).toBe(true);
    }
  });
  it("returns unique, sorted triples", () => {
    const points = fibonacciSphere(20);
    const faces = triangleFaces(neighborEdges(points), points.length);
    const keys = faces.map((f) => f.join("-"));
    expect(new Set(keys).size).toBe(keys.length);
    expect(faces.every(([a, b, c]) => a < b && b < c)).toBe(true);
  });
  it("handles inputs without edges", () => {
    expect(triangleFaces([], 0)).toEqual([]);
    expect(triangleFaces([], 5)).toEqual([]);
  });
});
