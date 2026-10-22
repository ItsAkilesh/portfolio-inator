/**
 * File: color.ts
 * Purpose: Color helpers. Decides whether a brand color is legible enough to use as a hover tint.
 * Author: Akilesh
 * Date: 2026-10-20
 */
const HEX_PATTERN = /^#([0-9a-f]{6})$/i;
const MIN_LUMINANCE = 0.16;
const MAX_LUMINANCE = 0.92;
const CHANNEL_MAX = 255;
const LUMA_RED = 0.2126;
const LUMA_GREEN = 0.7152;
const LUMA_BLUE = 0.0722;

/** Falls back to the page ink color when the brand color is near black, near white or malformed. */
export const INK_FALLBACK = "var(--ink)";

/** Perceived luminance (0..1) of a #rrggbb color, or null when the input is not a 6-digit hex. */
export function relativeLuminance(hex: string): number | null {
  const match = HEX_PATTERN.exec(hex);
  if (!match?.[1]) return null;
  const value = Number.parseInt(match[1], 16);
  const red = (value >> 16) & CHANNEL_MAX;
  const green = (value >> 8) & CHANNEL_MAX;
  const blue = value & CHANNEL_MAX;
  return (LUMA_RED * red + LUMA_GREEN * green + LUMA_BLUE * blue) / CHANNEL_MAX;
}

/** Brand color usable on both light and dark grounds, or the ink fallback. */
export function brandColorFor(hex: string): string {
  const luminance = relativeLuminance(hex);
  if (luminance === null) return INK_FALLBACK;
  return luminance < MIN_LUMINANCE || luminance > MAX_LUMINANCE
    ? INK_FALLBACK
    : hex;
}
