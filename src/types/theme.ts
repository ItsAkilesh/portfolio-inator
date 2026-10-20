/**
 * File: theme.ts
 * Purpose: Types for color palettes, fonts and motion settings configured in src/portfolio/theme.ts.
 * Author: Akilesh
 * Date: 2026-10-20
 */
export type ColorMode = "light" | "dark";
export type ModePreference = ColorMode | "system";

/** Any CSS color string (oklch() recommended). Each token becomes a CSS custom property. */
export interface PaletteTokens {
  /** Page background. */
  readonly bg: string;
  /** Slightly raised surface: segmented controls, hovered tiles. */
  readonly surface: string;
  /** Primary text. */
  readonly ink: string;
  /** Secondary text. */
  readonly inkMuted: string;
  /** Hairlines and borders. */
  readonly line: string;
  /** The committed brand color: page headers and highlights. */
  readonly accent: string;
  /** Text on the accent color. */
  readonly onAccent: string;
  /** Secondary text on the accent color. */
  readonly onAccentMuted: string;
  /** Borders on the accent color. */
  readonly onAccentLine: string;
  /** Inline links on the page background. */
  readonly link: string;
  /** Faint accent wash for hovered rows. */
  readonly tint: string;
}

export interface Palette {
  readonly light: PaletteTokens;
  readonly dark: PaletteTokens;
}

export interface FontConfig {
  readonly display: string;
  readonly body: string;
  readonly mono: string;
  /** Stylesheet URL for web fonts (Google Fonts or self-hosted). Leave empty to use local fonts only. */
  readonly stylesheet: string;
}

export interface ThemeConfig {
  readonly defaultMode: ModePreference;
  /**
   * Shows the light/dark toggle in the header. Set to false to force `defaultMode`:
   * the toggle disappears and any mode a visitor saved earlier is ignored.
   */
  readonly showThemeToggle: boolean;
  readonly activePalette: string;
  readonly palettes: Readonly<Record<string, Palette>>;
  readonly fonts: FontConfig;
}
