/**
 * File: glassShading.ts
 * Purpose: Lighting for the glass facets of the icon polyhedron: which way a face points, how much
 *          soft light it catches, and the sharp specular glint that makes it look reflective.
 * Author: Akilesh
 * Date: 2026-10-20
 */
import type { Point3 } from "./sphere";

export interface FaceShade {
  /** True when the face points toward the viewer. */
  readonly isFront: boolean;
  /** Fill opacity for the glass gradient, 0..1. */
  readonly opacity: number;
}

/** Light from the upper left, slightly in front of the sphere. */
const LIGHT = normalize({ x: -0.45, y: -0.6, z: 0.66 });
const SHININESS = 14;
const BACK_OPACITY = 0.015;
const BASE_OPACITY = 0.03;
const DIFFUSE_WEIGHT = 0.1;
const SPECULAR_WEIGHT = 0.5;

function normalize(p: Point3): Point3 {
  const length = Math.hypot(p.x, p.y, p.z) || 1;
  return { x: p.x / length, y: p.y / length, z: p.z / length };
}

const dot = (a: Point3, b: Point3): number => a.x * b.x + a.y * b.y + a.z * b.z;

/** Outward normal of a face on a sphere centered at the origin: the direction of its centroid. */
export function faceNormal(a: Point3, b: Point3, c: Point3): Point3 {
  return normalize({
    x: a.x + b.x + c.x,
    y: a.y + b.y + c.y,
    z: a.z + b.z + c.z,
  });
}

/** Glass shading for a face given its rotated vertices. The viewer looks along -z. */
export function shadeFace(a: Point3, b: Point3, c: Point3): FaceShade {
  const normal = faceNormal(a, b, c);
  if (normal.z <= 0) return { isFront: false, opacity: BACK_OPACITY };
  const diffuse = Math.max(0, dot(normal, LIGHT));
  const twice = 2 * dot(normal, LIGHT);
  const reflected = {
    x: twice * normal.x - LIGHT.x,
    y: twice * normal.y - LIGHT.y,
    z: twice * normal.z - LIGHT.z,
  };
  const specular = Math.max(0, reflected.z) ** SHININESS;
  const opacity =
    BASE_OPACITY + diffuse * DIFFUSE_WEIGHT + specular * SPECULAR_WEIGHT;
  return { isFront: true, opacity: Math.min(1, opacity) };
}
