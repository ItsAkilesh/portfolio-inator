/**
 * File: palettes.ts
 * Purpose: Resolves palettes from draft content (generated ones are computed exactly as the site
 *          does) and checks the colour pairs that carry text against WCAG contrast thresholds.
 *          Shared by the theme studio and the health check. Pure.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import { AA_LARGE, AA_TEXT, contrastRatio } from "../../lib/contrast";
import { makePalette } from "../../theme/makePalette";
import type { ColorMode, Palette, PaletteTokens } from "../../types/theme";

export interface ContrastPair {
  readonly label: string;
  readonly fg: keyof PaletteTokens;
  readonly bg: keyof PaletteTokens;
  readonly minimum: number;
}

export const CONTRAST_PAIRS: readonly ContrastPair[] = [
  { label: "Text", fg: "ink", bg: "bg", minimum: AA_TEXT },
  { label: "Secondary text", fg: "inkMuted", bg: "bg", minimum: AA_TEXT },
  { label: "Links", fg: "link", bg: "bg", minimum: AA_TEXT },
  { label: "Text on surfaces", fg: "ink", bg: "surface", minimum: AA_TEXT },
  { label: "Text on accent", fg: "onAccent", bg: "accent", minimum: AA_TEXT },
  {
    label: "Secondary text on accent",
    fg: "onAccentMuted",
    bg: "accent",
    minimum: AA_LARGE,
  },
];

export interface ContrastResult extends ContrastPair {
  readonly mode: ColorMode;
  readonly ratio: number | null;
  readonly isPassing: boolean;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/** A palette source from the content ("generated" or "custom"), resolved to tokens; null if malformed. */
export function resolveSource(source: unknown): Palette | null {
  if (!isRecord(source)) return null;
  if (
    source.kind === "generated" &&
    typeof source.hue === "number" &&
    typeof source.chroma === "number" &&
    typeof source.lightness === "number"
  )
    return makePalette({
      hue: source.hue,
      chroma: source.chroma,
      lightness: source.lightness,
    });
  if (
    source.kind === "custom" &&
    isRecord(source.light) &&
    isRecord(source.dark)
  )
    return {
      light: source.light as unknown as PaletteTokens,
      dark: source.dark as unknown as PaletteTokens,
    };
  return null;
}

export function checkContrast(palette: Palette): ContrastResult[] {
  return (["light", "dark"] as const).flatMap((mode) =>
    CONTRAST_PAIRS.map((pair) => {
      const tokens = palette[mode];
      const ratio = contrastRatio(
        String(tokens[pair.fg] ?? ""),
        String(tokens[pair.bg] ?? ""),
      );
      return {
        ...pair,
        mode,
        ratio,
        isPassing: ratio !== null && ratio >= pair.minimum,
      };
    }),
  );
}
