/**
 * File: svgIcon.ts
 * Purpose: Turns an uploaded SVG into a custom icon: one path's data plus the view box. Only shape
 *          geometry is kept (path, rect, circle, ellipse, line, polyline, polygon); everything else,
 *          including any script, style or link the file may carry, is discarded, and the result must
 *          pass the strict path-data check. Shapes with transforms are refused rather than guessed.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import { PATH_DATA } from "../codegen/iconModule";

export const MAX_SVG_BYTES = 100 * 1024;
const MAX_PATH_LENGTH = 20_000;
const SHAPE = /<(path|rect|circle|ellipse|line|polyline|polygon)\b([^>]*)>/gi;
const ATTRIBUTE = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*("([^"]*)"|'([^']*)')/g;

export type SvgIconResult =
  | { readonly ok: true; readonly path: string; readonly viewBox: string }
  | { readonly ok: false; readonly reason: string };

function attributesOf(text: string): Map<string, string> {
  const attributes = new Map<string, string>();
  for (const match of text.matchAll(ATTRIBUTE))
    attributes.set((match[1] ?? "").toLowerCase(), match[3] ?? match[4] ?? "");
  return attributes;
}

const num = (attributes: Map<string, string>, name: string): number => {
  const value = Number.parseFloat(attributes.get(name) ?? "0");
  return Number.isFinite(value) ? value : 0;
};

function pointsPath(points: string, isClosed: boolean): string {
  const values = points
    .trim()
    .split(/[\s,]+/)
    .map(Number);
  if (values.length < 4 || values.some((v) => !Number.isFinite(v))) return "";
  const pairs: string[] = [];
  for (let i = 0; i + 1 < values.length; i += 2)
    pairs.push(`${values[i]} ${values[i + 1]}`);
  return `M${pairs.join("L")}${isClosed ? "Z" : ""}`;
}

function ellipsePath(cx: number, cy: number, rx: number, ry: number): string {
  if (rx <= 0 || ry <= 0) return "";
  return `M${cx - rx} ${cy}a${rx} ${ry} 0 1 0 ${rx * 2} 0a${rx} ${ry} 0 1 0 ${-rx * 2} 0Z`;
}

/** Path data for one shape element; "" when it has no drawable geometry. */
export function shapeToPath(tag: string, a: Map<string, string>): string {
  switch (tag) {
    case "path":
      return a.get("d") ?? "";
    case "rect": {
      const [x, y, w, h] = [
        num(a, "x"),
        num(a, "y"),
        num(a, "width"),
        num(a, "height"),
      ];
      return w > 0 && h > 0 ? `M${x} ${y}h${w}v${h}h${-w}Z` : "";
    }
    case "circle":
      return ellipsePath(num(a, "cx"), num(a, "cy"), num(a, "r"), num(a, "r"));
    case "ellipse":
      return ellipsePath(
        num(a, "cx"),
        num(a, "cy"),
        num(a, "rx"),
        num(a, "ry"),
      );
    case "line":
      return `M${num(a, "x1")} ${num(a, "y1")}L${num(a, "x2")} ${num(a, "y2")}`;
    case "polyline":
    case "polygon":
      return pointsPath(a.get("points") ?? "", tag === "polygon");
    default:
      return "";
  }
}

function viewBoxOf(svgTag: Map<string, string>): string | null {
  const box = svgTag
    .get("viewbox")
    ?.trim()
    .split(/[\s,]+/)
    .map(Number);
  if (
    box &&
    box.length === 4 &&
    box.every(Number.isFinite) &&
    (box[2] ?? 0) > 0
  )
    return box.join(" ");
  const width = num(svgTag, "width");
  const height = num(svgTag, "height");
  return width > 0 && height > 0 ? `0 0 ${width} ${height}` : null;
}

const fail = (reason: string): SvgIconResult => ({ ok: false, reason });

export function svgToIcon(svg: string): SvgIconResult {
  if (Buffer.byteLength(svg, "utf8") > MAX_SVG_BYTES)
    return fail("SVG files must be 100 KB or smaller");
  const root = /<svg\b([^>]*)>/i.exec(svg);
  if (!root) return fail("This is not an SVG file");
  const viewBox = viewBoxOf(attributesOf(root[1] ?? ""));
  if (!viewBox) return fail("The SVG needs a viewBox or a width and height");
  /* Any transform (on a shape or a group) would move geometry this conversion keeps in place. */
  if (/\btransform\s*=/i.test(svg))
    return fail(
      "Flatten transforms in the SVG first (e.g. in your editor's export)",
    );
  const parts: string[] = [];
  for (const match of svg.matchAll(SHAPE)) {
    const attributes = attributesOf(match[2] ?? "");
    const part = shapeToPath((match[1] ?? "").toLowerCase(), attributes).trim();
    if (part) parts.push(part);
  }
  const path = parts.join(" ");
  if (!path) return fail("No shapes found in the SVG");
  if (path.length > MAX_PATH_LENGTH || !PATH_DATA.test(path))
    return fail("The SVG's shapes could not be read safely");
  return { ok: true, path, viewBox };
}
