/**
 * File: cloudSizing.ts
 * Purpose: Sizes the icon polyhedron from its icon count: discs shrink as icons are added, and the
 *          radius grows once the container alone can no longer keep neighbors apart.
 * Author: Akilesh
 * Date: 2026-10-20
 */

/** Share of the container width used as radius when there is room to spare. */
export const RADIUS_RATIO = 0.4;
/** Disc diameter (px) at or below the reference count. */
const BASE_DISC_PX = 48;
/** Smallest disc diameter (px) that still reads as a logo. */
const MIN_DISC_PX = 34;
/** Icon count the base disc size was designed for. */
const BASE_COUNT = 34;
/** Desired center-to-center distance between neighbors, in disc diameters. */
const SPACING_IN_DISCS = 2;
/** The icon inside a disc, as a share of the disc. */
const ICON_SHARE = 0.5;
const SPHERE_AREA = 4 * Math.PI;

/**
 * Disc diameter for `count` icons. Area per icon on the sphere falls as 1/count, so the disc
 * shrinks with the square root of the count, between MIN_DISC_PX and BASE_DISC_PX.
 */
export function discSize(count: number): number {
  const safe = Math.max(count, 1);
  const scaled = BASE_DISC_PX * Math.sqrt(BASE_COUNT / safe);
  return Math.round(Math.min(BASE_DISC_PX, Math.max(MIN_DISC_PX, scaled)));
}

/** Brand icon size (px) inside a disc. */
export const iconSize = (count: number): number =>
  Math.round(discSize(count) * ICON_SHARE);

/**
 * Projection radius (px). Neighbors on a sphere of radius r with n evenly spread points sit about
 * r * sqrt(4π / n) apart, so the radius never drops below what keeps them SPACING_IN_DISCS apart.
 * Past that point the polyhedron grows beyond its container.
 */
export function cloudRadius(containerPx: number, count: number): number {
  const safe = Math.max(count, 1);
  const minimum =
    (discSize(safe) * SPACING_IN_DISCS) / Math.sqrt(SPHERE_AREA / safe);
  return Math.max(containerPx * RADIUS_RATIO, minimum);
}
