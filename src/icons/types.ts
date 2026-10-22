/**
 * File: types.ts
 * Purpose: Shape shared by every brand icon definition: SVG path, its view box and brand colour.
 * Author: Akilesh
 * Date: 2026-10-20 (updated 2026-10-22)
 */
export interface IconDefinition {
  readonly title: string;
  readonly hex: string;
  readonly path: string;
  /** e.g. "0 0 24 24" (simple-icons); imported SVGs keep their own. */
  readonly viewBox: string;
}
