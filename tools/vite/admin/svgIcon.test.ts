/**
 * File: svgIcon.test.ts
 * Purpose: Tests for SVG to icon conversion: shapes, view boxes and everything that is refused.
 * Author: Akilesh
 * Date: 2026-10-21
 */
// @vitest-environment node
import { describe, expect, it } from "vitest";
import { svgToIcon } from "./svgIcon";

const svg = (inner: string, attrs = 'viewBox="0 0 24 24"') =>
  `<svg xmlns="http://www.w3.org/2000/svg" ${attrs}>${inner}</svg>`;

describe("svgToIcon", () => {
  it("keeps path data and the view box", () => {
    expect(svgToIcon(svg('<path d="M1 1L5 5Z" fill="red"/>'))).toEqual({
      ok: true,
      path: "M1 1L5 5Z",
      viewBox: "0 0 24 24",
    });
  });
  it("converts basic shapes to paths and joins them", () => {
    const result = svgToIcon(
      svg(
        '<rect x="1" y="2" width="3" height="4"/><circle cx="5" cy="5" r="2"/><polygon points="0,0 4,0 4,4"/><line x1="0" y1="0" x2="1" y2="1"/>',
      ),
    );
    expect(result.ok && result.path).toBe(
      "M1 2h3v4h-3Z M3 5a2 2 0 1 0 4 0a2 2 0 1 0 -4 0Z M0 0L4 0L4 4Z M0 0L1 1",
    );
  });
  it("derives the view box from width and height", () => {
    const result = svgToIcon(
      svg('<path d="M0 0h1"/>', 'width="48" height="32"'),
    );
    expect(result.ok && result.viewBox).toBe("0 0 48 32");
  });
  it("drops scripts, styles and links, keeping only geometry", () => {
    const result = svgToIcon(
      svg(
        '<script>alert(1)</script><a href="javascript:alert(1)"><path d="M0 0h2v2Z" onclick="x()"/></a><style>*{}</style>',
      ),
    );
    expect(result).toEqual({
      ok: true,
      path: "M0 0h2v2Z",
      viewBox: "0 0 24 24",
    });
  });
  it.each([
    ["not svg", "<html></html>", "This is not an SVG file"],
    [
      "no size",
      '<svg><path d="M0 0"/></svg>',
      "The SVG needs a viewBox or a width and height",
    ],
    ["no shapes", svg("<text>hi</text>"), "No shapes found in the SVG"],
    [
      "transforms",
      svg('<g transform="scale(2)"><path d="M0 0h1"/></g>'),
      "Flatten transforms in the SVG first (e.g. in your editor's export)",
    ],
    [
      "markup in path data",
      svg('<path d="M0 0&lt;script"/>'),
      "The SVG's shapes could not be read safely",
    ],
  ])("refuses %s", (_name, input, reason) => {
    expect(svgToIcon(input)).toEqual({ ok: false, reason });
  });
  it("refuses files over the size limit", () => {
    expect(svgToIcon(svg(`<path d="M0 0${" h1".repeat(40_000)}"/>`)).ok).toBe(
      false,
    );
  });
});
