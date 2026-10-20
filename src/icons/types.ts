/**
 * File: types.ts
 * Purpose: Shape shared by every brand icon definition (24x24 SVG path plus brand color).
 * Author: Akilesh
 * Date: 2026-10-20
 */
export interface IconDefinition {
  readonly title: string;
  readonly hex: string;
  readonly path: string;
}
