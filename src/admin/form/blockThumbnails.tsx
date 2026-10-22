/**
 * File: blockThumbnails.tsx
 * Purpose: Small schematic pictures of each block type for the block palette, drawn with plain
 *          rectangles in the current colour. Unknown (for example custom) types get a generic one.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import type { ReactNode } from "react";

type Shape = readonly [
  x: number,
  y: number,
  w: number,
  h: number,
  opacity?: number,
];

const line = (y: number, w: number, x = 6): Shape => [x, y, w, 3, 0.5];

const SHAPES: Readonly<Record<string, readonly Shape[]>> = {
  hero: [
    [6, 8, 30, 6],
    line(18, 26),
    line(24, 20),
    [6, 31, 10, 4, 0.8],
    [18, 31, 10, 4, 0.4],
    [44, 8, 14, 24, 0.3],
  ],
  skills: [
    [6, 6, 22, 4],
    line(14, 16),
    line(19, 14),
    [36, 6, 22, 14, 0.3],
    line(27, 16),
    line(32, 12),
  ],
  header: [
    [0, 0, 64, 22, 0.35],
    [6, 7, 28, 6],
    line(16, 20),
    line(28, 40),
    line(33, 34),
  ],
  timeline: [
    [6, 6, 8, 8, 0.5],
    [18, 7, 26, 4],
    line(14, 20, 18),
    [6, 22, 8, 8, 0.5],
    [18, 23, 26, 4],
    line(30, 20, 18),
  ],
  degrees: [
    [6, 6, 12, 12, 0.5],
    [22, 7, 30, 5],
    line(15, 24, 22),
    line(22, 30, 22),
    line(27, 26, 22),
  ],
  featured: [
    [4, 6, 26, 28, 0.35],
    [34, 6, 26, 28, 0.35],
    [8, 12, 16, 3],
    [38, 12, 16, 3],
  ],
  publications: [
    [6, 5, 10, 4, 0.7],
    [18, 5, 10, 4, 0.3],
    [6, 14, 44, 3],
    line(20, 30),
    [6, 27, 40, 3],
    line(33, 26),
  ],
  projects: [
    [6, 6, 52, 8, 0.35],
    [6, 17, 52, 8, 0.35],
    [6, 28, 20, 5, 0.6],
  ],
  contact: [
    [6, 6, 40, 6],
    [6, 15, 30, 6],
    [6, 26, 10, 8, 0.4],
    [18, 26, 10, 8, 0.4],
    [30, 26, 10, 8, 0.4],
  ],
  linkGrid: [
    [6, 6, 15, 12, 0.4],
    [24, 6, 15, 12, 0.4],
    [42, 6, 15, 12, 0.4],
    [6, 22, 15, 12, 0.4],
    [24, 22, 15, 12, 0.4],
  ],
  text: [[6, 6, 24, 5], line(15, 52), line(20, 50), line(25, 52), line(30, 36)],
  image: [[6, 5, 52, 24, 0.35], line(33, 30)],
};

const GENERIC: readonly Shape[] = [
  [6, 6, 52, 28, 0.25],
  [12, 14, 24, 4],
  line(22, 30, 12),
];

export function BlockThumbnail({ type }: { readonly type: string }): ReactNode {
  const shapes = SHAPES[type] ?? GENERIC;
  return (
    <svg
      viewBox="0 0 64 40"
      width="64"
      height="40"
      aria-hidden="true"
      focusable="false"
    >
      <rect
        x="0.5"
        y="0.5"
        width="63"
        height="39"
        rx="4"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.25"
      />
      {shapes.map(([x, y, w, h, opacity = 0.9], i) => (
        <rect
          key={i}
          x={x}
          y={y}
          width={w}
          height={h}
          rx="1.5"
          fill="currentColor"
          fillOpacity={opacity}
        />
      ))}
    </svg>
  );
}
