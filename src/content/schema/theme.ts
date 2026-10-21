/**
 * File: theme.ts
 * Purpose: Schemas for colour palettes, light/dark behaviour and fonts. A palette is either
 *          generated from one hue or written out token by token for both modes.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import { z } from "zod";
import { flag, link, text } from "./fields";

const color = (title: string) => text({ title, widget: "color" });

export const paletteTokensSchema = z
  .object({
    bg: color("Background"),
    surface: color("Raised surface"),
    ink: color("Text"),
    inkMuted: color("Secondary text"),
    line: color("Lines"),
    accent: color("Accent"),
    onAccent: color("Text on accent"),
    onAccentMuted: color("Secondary text on accent"),
    onAccentLine: color("Lines on accent"),
    link: color("Links"),
    tint: color("Hover wash"),
  })
  .meta({ title: "Colours" });

export const generatedPaletteSchema = z
  .object({
    kind: z.literal("generated"),
    hue: z
      .number()
      .min(0)
      .max(360)
      .meta({ title: "Hue", description: "OKLCH angle, 0 to 360" }),
    chroma: z
      .number()
      .min(0)
      .max(0.37)
      .meta({ title: "Chroma", description: "0.12 muted, 0.23 vivid" }),
    lightness: z
      .number()
      .min(0.2)
      .max(0.5)
      .meta({
        title: "Lightness",
        description: "Accent lightness in light mode",
      }),
  })
  .meta({ title: "Generated from a hue" });

export const customPaletteSchema = z
  .object({
    kind: z.literal("custom"),
    light: paletteTokensSchema.meta({ title: "Light mode" }),
    dark: paletteTokensSchema.meta({ title: "Dark mode" }),
  })
  .meta({ title: "Hand-written" });

export const paletteSourceSchema = z
  .discriminatedUnion("kind", [generatedPaletteSchema, customPaletteSchema])
  .meta({ title: "Palette" });

export const themeSchema = z
  .object({
    defaultMode: z
      .enum(["system", "light", "dark"])
      .meta({
        title: "Default mode",
        description: '"system" follows the visitor\'s setting',
      }),
    showThemeToggle: flag({
      title: "Show light/dark toggle",
      description: "Off forces the default mode",
    }),
    activePalette: text({
      title: "Active palette",
      description: "One of the palette names below",
    }),
    palettes: z
      .record(z.string(), paletteSourceSchema)
      .meta({ title: "Palettes" }),
    fonts: z
      .object({
        display: text({ title: "Display font stack" }),
        body: text({ title: "Body font stack" }),
        mono: text({ title: "Monospace font stack" }),
        stylesheet: link({ title: "Font stylesheet URL" }),
      })
      .meta({ title: "Fonts" }),
  })
  .meta({ title: "Theme" });
