/**
 * File: contrast.ts
 * Purpose: WCAG 2 contrast ratios for theme colours written as #hex, rgb()/rgba(), hsl() or oklch()
 *          (the palette generator's format). Colours are converted to sRGB (oklch via OKLab, then
 *          clipped to the sRGB gamut) and compared by relative luminance. Pure.
 * Author: Akilesh
 * Date: 2026-10-21
 */
export type Rgb = readonly [r: number, g: number, b: number];

/** WCAG thresholds: normal text, and large text or interface parts. */
export const AA_TEXT = 4.5;
export const AA_LARGE = 3;
export const AAA_TEXT = 7;

const clamp01 = (n: number): number => Math.min(1, Math.max(0, n));
const DEG = Math.PI / 180;

function parseNumber(token: string, scale: number): number {
  return token.endsWith("%")
    ? (Number.parseFloat(token) / 100) * scale
    : Number.parseFloat(token);
}

const args = (text: string): string[] =>
  text
    .replace(/[(),/]/g, " ")
    .trim()
    .split(/\s+/);

function fromHex(hex: string): Rgb | null {
  const m = /^#([0-9a-f]{3}|[0-9a-f]{6})([0-9a-f]{2})?$/i.exec(hex);
  if (!m?.[1]) return null;
  const full = m[1].length === 3 ? [...m[1]].map((c) => c + c).join("") : m[1];
  const n = Number.parseInt(full, 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

function fromRgb(body: string): Rgb | null {
  const [r, g, b] = args(body).map((t) => parseNumber(t, 255) / 255);
  return r === undefined ||
    g === undefined ||
    b === undefined ||
    [r, g, b].some(Number.isNaN)
    ? null
    : [clamp01(r), clamp01(g), clamp01(b)];
}

function fromHsl(body: string): Rgb | null {
  const [hText, sText, lText] = args(body);
  if (!hText || !sText || !lText) return null;
  const h = (Number.parseFloat(hText) % 360) / 360;
  const s = parseNumber(sText, 1);
  const l = parseNumber(lText, 1);
  const k = (n: number) => (n + h * 12) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) =>
    l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
  return [f(0), f(8), f(4)].map(clamp01) as unknown as Rgb;
}

const toGamma = (c: number): number =>
  c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055;

function fromOklch(body: string): Rgb | null {
  const [lText, cText, hText] = args(body);
  if (!lText || !cText || !hText) return null;
  const L = parseNumber(lText, 1);
  const C = parseNumber(cText, 0.4);
  const h = Number.parseFloat(hText) * DEG;
  const [a, b] = [C * Math.cos(h), C * Math.sin(h)];
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const linear = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
  if (linear.some(Number.isNaN)) return null;
  return linear.map((c) => clamp01(toGamma(clamp01(c)))) as unknown as Rgb;
}

/** sRGB channels 0..1, or null for formats it cannot read (named colours, var(), color-mix()). */
export function parseColor(value: string): Rgb | null {
  const text = value.trim().toLowerCase();
  if (text.startsWith("#")) return fromHex(text);
  const m = /^(rgba?|hsla?|oklch)\((.*)\)$/.exec(text);
  if (!m?.[1] || m[2] === undefined) return null;
  if (m[1].startsWith("rgb")) return fromRgb(m[2]);
  if (m[1].startsWith("hsl")) return fromHsl(m[2]);
  return fromOklch(m[2]);
}

const toLinear = (c: number): number =>
  c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;

export const luminance = ([r, g, b]: Rgb): number =>
  0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);

/** Contrast ratio 1..21 of two colours, or null if either cannot be read. */
export function contrastRatio(
  foreground: string,
  background: string,
): number | null {
  const fg = parseColor(foreground);
  const bg = parseColor(background);
  if (!fg || !bg) return null;
  const [light, dark] = [luminance(fg), luminance(bg)].sort(
    (x, y) => y - x,
  ) as [number, number];
  return (light + 0.05) / (dark + 0.05);
}

export type Grade = "AAA" | "AA" | "AA large" | "Fail";

export function gradeOf(ratio: number): Grade {
  if (ratio >= AAA_TEXT) return "AAA";
  if (ratio >= AA_TEXT) return "AA";
  if (ratio >= AA_LARGE) return "AA large";
  return "Fail";
}
