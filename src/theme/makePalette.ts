/**
 * File: makePalette.ts
 * Purpose: Builds a full light + dark palette from a single hue, so a new color scheme is one line of config.
 * Author: Akilesh
 * Date: 2026-10-20
 */
import type { Palette } from "../types/theme";

export interface PaletteSeed {
  /** OKLCH hue angle, 0..360. 266 is International Klein Blue. */
  readonly hue: number;
  /** Accent chroma; 0.23 is vivid, 0.12 is muted. */
  readonly chroma?: number;
  /** Accent lightness in light mode, 0..1. Keep at or below 0.5 so light text on it stays readable. */
  readonly lightness?: number;
}

const DEFAULT_CHROMA = 0.23;
const DEFAULT_LIGHTNESS = 0.42;
const DARK_ACCENT_SHIFT = 0.04;
const DARK_CHROMA_SCALE = 0.87;
const FULL_TURN = 360;

const normalizeHue = (hue: number): number =>
  ((hue % FULL_TURN) + FULL_TURN) % FULL_TURN;
const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

export function makePalette(seed: PaletteSeed): Palette {
  const h = normalizeHue(seed.hue);
  const c = clamp(seed.chroma ?? DEFAULT_CHROMA, 0, 0.37);
  const l = clamp(seed.lightness ?? DEFAULT_LIGHTNESS, 0.2, 0.5);
  const darkL = (l - DARK_ACCENT_SHIFT).toFixed(3);
  const darkC = (c * DARK_CHROMA_SCALE).toFixed(3);
  return {
    light: {
      bg: `oklch(0.975 0.005 ${h})`,
      surface: `oklch(0.945 0.01 ${h})`,
      ink: `oklch(0.2 0.03 ${h})`,
      inkMuted: `oklch(0.44 0.03 ${h})`,
      line: `oklch(0.2 0.03 ${h} / 0.13)`,
      accent: `oklch(${l} ${c} ${h})`,
      onAccent: `oklch(0.975 0.01 ${h})`,
      onAccentMuted: `oklch(0.975 0.01 ${h} / 0.74)`,
      onAccentLine: `oklch(0.975 0.01 ${h} / 0.3)`,
      link: `oklch(0.45 ${Math.min(c, 0.2)} ${h})`,
      tint: `oklch(${l} ${c} ${h} / 0.07)`,
    },
    dark: {
      bg: `oklch(0.15 0.022 ${h})`,
      surface: `oklch(0.2 0.028 ${h})`,
      ink: `oklch(0.95 0.008 ${h})`,
      inkMuted: `oklch(0.75 0.02 ${h})`,
      line: `oklch(0.95 0.008 ${h} / 0.13)`,
      accent: `oklch(${darkL} ${darkC} ${h})`,
      onAccent: `oklch(0.975 0.01 ${h})`,
      onAccentMuted: `oklch(0.975 0.01 ${h} / 0.74)`,
      onAccentLine: `oklch(0.975 0.01 ${h} / 0.3)`,
      link: `oklch(0.79 0.11 ${h})`,
      tint: `oklch(0.79 0.11 ${h} / 0.08)`,
    },
  };
}
