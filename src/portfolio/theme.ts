/**
 * File: theme.ts
 * Purpose: Color palettes, fonts and the default light/dark mode.
 *          Switch the whole site's colors by changing `activePalette`, or add your own palette below,
 *          either generated from a hue with makePalette() or written out token by token.
 * Author: Akilesh
 * Date: 2026-10-20
 */
import { makePalette } from "../theme/makePalette";
import type { ThemeConfig } from "../types/theme";

export const theme: ThemeConfig = {
  /** "system" follows the visitor's OS setting until they press the toggle. */
  defaultMode: "system",
  activePalette: "klein",
  palettes: {
    /** International Klein Blue. */
    klein: makePalette({ hue: 266 }),
    /** Deep racing green. */
    forest: makePalette({ hue: 155, chroma: 0.12, lightness: 0.4 }),
    /** Oxblood red. */
    oxblood: makePalette({ hue: 22, chroma: 0.15, lightness: 0.38 }),
    /** Fully hand-written palette: near-monochrome graphite with a cool accent. */
    graphite: {
      light: {
        bg: "oklch(0.98 0.002 250)",
        surface: "oklch(0.95 0.003 250)",
        ink: "oklch(0.18 0.005 250)",
        inkMuted: "oklch(0.45 0.008 250)",
        line: "oklch(0.18 0.005 250 / 0.12)",
        accent: "oklch(0.24 0.01 250)",
        onAccent: "oklch(0.97 0.004 250)",
        onAccentMuted: "oklch(0.97 0.004 250 / 0.7)",
        onAccentLine: "oklch(0.97 0.004 250 / 0.28)",
        link: "oklch(0.45 0.12 250)",
        tint: "oklch(0.24 0.01 250 / 0.06)",
      },
      dark: {
        bg: "oklch(0.14 0.004 250)",
        surface: "oklch(0.19 0.006 250)",
        ink: "oklch(0.94 0.004 250)",
        inkMuted: "oklch(0.72 0.008 250)",
        line: "oklch(0.94 0.004 250 / 0.12)",
        accent: "oklch(0.92 0.005 250)",
        onAccent: "oklch(0.16 0.006 250)",
        onAccentMuted: "oklch(0.16 0.006 250 / 0.72)",
        onAccentLine: "oklch(0.16 0.006 250 / 0.25)",
        link: "oklch(0.78 0.1 250)",
        tint: "oklch(0.78 0.1 250 / 0.08)",
      },
    },
  },
  fonts: {
    display: "'Geist', system-ui, sans-serif",
    body: "'Geist', system-ui, sans-serif",
    mono: "'Geist Mono', ui-monospace, monospace",
    stylesheet:
      "https://fonts.googleapis.com/css2?family=Geist:wght@300..800&family=Geist+Mono:wght@400;500&display=swap",
  },
};
