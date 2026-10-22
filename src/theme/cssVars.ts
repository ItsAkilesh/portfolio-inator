/**
 * File: cssVars.ts
 * Purpose: Converts palette tokens and fonts into CSS custom properties and applies them to the document.
 * Author: Akilesh
 * Date: 2026-10-20
 */
import type {
  ColorMode,
  FontConfig,
  Palette,
  PaletteTokens,
  ThemeConfig,
} from "../types/theme";
import { logger } from "../lib/logger";

const TOKEN_TO_VAR: Record<keyof PaletteTokens, string> = {
  bg: "--bg",
  surface: "--surface",
  ink: "--ink",
  inkMuted: "--ink-muted",
  line: "--line",
  accent: "--accent",
  onAccent: "--on-accent",
  onAccentMuted: "--on-accent-muted",
  onAccentLine: "--on-accent-line",
  link: "--link",
  tint: "--tint",
};

const FONT_TO_VAR: Record<keyof Omit<FontConfig, "stylesheet">, string> = {
  display: "--font-display",
  body: "--font-body",
  mono: "--font-mono",
};

/** Picks the configured palette, falling back to the first one defined. */
export function resolvePalette(config: ThemeConfig): Palette {
  const chosen = config.palettes[config.activePalette];
  if (chosen) return chosen;
  const [firstName, first] = Object.entries(config.palettes)[0] ?? [];
  if (!first)
    throw new Error("theme.palettes is empty; define at least one palette");
  logger.warn(
    "theme.palette",
    `"${config.activePalette}" not found; using "${firstName}"`,
  );
  return first;
}

export function paletteToCssVars(
  tokens: PaletteTokens,
): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const [token, cssVar] of Object.entries(TOKEN_TO_VAR) as Array<
    [keyof PaletteTokens, string]
  >) {
    vars[cssVar] = tokens[token];
  }
  return vars;
}

export function fontsToCssVars(fonts: FontConfig): Record<string, string> {
  return {
    [FONT_TO_VAR.display]: fonts.display,
    [FONT_TO_VAR.body]: fonts.body,
    [FONT_TO_VAR.mono]: fonts.mono,
  };
}

/** Writes the active palette and fonts onto <html> and records the mode for CSS. */
export function applyTheme(
  root: HTMLElement,
  config: ThemeConfig,
  mode: ColorMode,
): void {
  const palette = resolvePalette(config);
  const vars = {
    ...paletteToCssVars(palette[mode]),
    ...fontsToCssVars(config.fonts),
  };
  for (const [name, value] of Object.entries(vars))
    root.style.setProperty(name, value);
  root.dataset.theme = mode;
  root.style.colorScheme = mode;
}

const FONT_LINK_ID = "theme-fonts";
const ALLOWED_FONT_HOSTS = new Set(["fonts.googleapis.com", "fonts.bunny.net"]);

/** Adds the font stylesheet once. Only same-origin paths or known font CDNs are allowed. */
export function loadFontStylesheet(doc: Document, href: string): void {
  if (!href || doc.getElementById(FONT_LINK_ID)) return;
  const url = new URL(href, doc.baseURI);
  const isSameOrigin = url.origin === new URL(doc.baseURI).origin;
  if (!isSameOrigin && !ALLOWED_FONT_HOSTS.has(url.hostname)) {
    logger.warn("theme.fonts", `blocked font host ${url.hostname}`);
    return;
  }
  const link = doc.createElement("link");
  link.id = FONT_LINK_ID;
  link.rel = "stylesheet";
  link.href = url.toString();
  doc.head.appendChild(link);
}
