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
