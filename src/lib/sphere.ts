/**
 * File: sphere.ts
 * Purpose: Pure 3D helpers for the icon cloud: even points on a sphere, rotation, and depth projection.
 * Author: Akilesh
 * Date: 2026-10-20
 */
export interface Point3 {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

export interface Projected {
  readonly x: number;
  readonly y: number;
  readonly scale: number;
  readonly opacity: number;
  /** Stacking order: items in front draw over items behind. */
  readonly layer: number;
}

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
const MIN_SCALE = 0.55;
const MIN_OPACITY = 0.22;
const LAYER_RANGE = 100;

/** `count` points spread evenly over a unit sphere (Fibonacci lattice). */
export function fibonacciSphere(count: number): Point3[] {
  if (count <= 0) return [];
  if (count === 1) return [{ x: 0, y: 0, z: 1 }];
  return Array.from({ length: count }, (_, index) => {
    const y = 1 - (index / (count - 1)) * 2;
    const ring = Math.sqrt(1 - y * y);
    const theta = GOLDEN_ANGLE * index;
    return { x: Math.cos(theta) * ring, y, z: Math.sin(theta) * ring };
  });
}

/** Rotates a point around the X axis by `angleX`, then around the Y axis by `angleY` (radians). */
export function rotate(point: Point3, angleX: number, angleY: number): Point3 {
  const cosX = Math.cos(angleX);
  const sinX = Math.sin(angleX);
  const y = point.y * cosX - point.z * sinX;
  const z1 = point.y * sinX + point.z * cosX;
  const cosY = Math.cos(angleY);
  const sinY = Math.sin(angleY);
  return { x: point.x * cosY + z1 * sinY, y, z: -point.x * sinY + z1 * cosY };
}

/** Screen offset (px from center), scale and opacity for a unit-sphere point at the given radius. */
export function project(point: Point3, radius: number): Projected {
  const depth = (Math.max(-1, Math.min(1, point.z)) + 1) / 2;
  return {
    x: point.x * radius,
    y: point.y * radius,
    scale: MIN_SCALE + depth * (1 - MIN_SCALE),
    opacity: MIN_OPACITY + depth * (1 - MIN_OPACITY),
    layer: Math.round(depth * LAYER_RANGE),
  };
}

/** Max edge length relative to a point's nearest neighbor; 1.45 links the ring of 5-6 neighbors. */
const EDGE_REACH = 1.45;

const distance = (a: Point3, b: Point3): number =>
  Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);

/** Fibonacci numbers below `limit`; on a Fibonacci lattice, neighbors sit at these index offsets. */
export function fibonacciOffsets(limit: number): number[] {
  const offsets: number[] = [];
  for (let a = 1, b = 2; a < limit; [a, b] = [b, a + b]) offsets.push(a);
  return offsets;
}

/**
 * Edges joining each lattice point to its nearest neighbors, forming a geodesic mesh.
 * Only Fibonacci index offsets are checked, so the cost is O(n log n), not O(n^2).
 * Points must come from fibonacciSphere(). Returns unique [lower, higher] index pairs.
 */
export function neighborEdges(
  points: readonly Point3[],
): Array<[number, number]> {
  const offsets = fibonacciOffsets(points.length);
  const seen = new Set<string>();
  const edges: Array<[number, number]> = [];
  points.forEach((point, i) => {
    const candidates = offsets.flatMap((offset) =>
      [i - offset, i + offset]
        .filter((j) => j >= 0 && j < points.length)
        .map((j) => ({ j, d: distance(point, points[j] as Point3) })),
    );
    const nearest = Math.min(...candidates.map((c) => c.d));
    for (const { j, d } of candidates) {
      if (d > nearest * EDGE_REACH) continue;
      const key = i < j ? `${i}-${j}` : `${j}-${i}`;
      if (seen.has(key)) continue;
      seen.add(key);
      edges.push(i < j ? [i, j] : [j, i]);
    }
  });
  return edges;
}
