/**
 * File: dotField.ts
 * Purpose: Pure math and drawing for the interactive dot field behind each page header.
 * Author: Akilesh
 * Date: 2026-10-20
 */
export interface DotFieldOptions {
  readonly gap: number;
  readonly radius: number;
  readonly push: number;
}

export const DEFAULT_DOT_FIELD: DotFieldOptions = {
  gap: 24,
  radius: 140,
  push: 16,
};

export interface PointerState {
  x: number;
  y: number;
  /** 0 when the pointer is away, easing to 1 while it is over the field. */
  strength: number;
}

export interface Dot {
  readonly x: number;
  readonly y: number;
  readonly r: number;
  readonly alpha: number;
}

const BASE_RADIUS = 0.7;
const WAVE_RADIUS = 0.6;
const PULL_RADIUS = 3.4;
const BASE_ALPHA = 0.14;
const WAVE_ALPHA = 0.08;
const PULL_ALPHA = 0.55;
const WAVE_SPEED = 0.0009;
const WAVE_X = 0.009;
const WAVE_Y = 0.014;
const FULL_TURN = Math.PI * 2;

/** Position, size and opacity of one grid dot at time t (ms). */
export function computeDot(
  gridX: number,
  gridY: number,
  pointer: PointerState,
  time: number,
  options: DotFieldOptions = DEFAULT_DOT_FIELD,
): Dot {
  const dx = gridX - pointer.x;
  const dy = gridY - pointer.y;
  const distance = Math.hypot(dx, dy) || 1;
  const pull =
    Math.exp(-(distance * distance) / (2 * options.radius * options.radius)) *
    pointer.strength;
  const wave =
    Math.sin(time * WAVE_SPEED + gridX * WAVE_X + gridY * WAVE_Y) * 0.5 + 0.5;
  return {
    x: gridX + (dx / distance) * pull * options.push,
    y: gridY + (dy / distance) * pull * options.push,
    r: BASE_RADIUS + wave * WAVE_RADIUS + pull * PULL_RADIUS,
    alpha: BASE_ALPHA + wave * WAVE_ALPHA + pull * PULL_ALPHA,
  };
}

/** Grid coordinates covering a width x height area, centered in each cell. */
export function gridPoints(
  width: number,
  height: number,
  gap: number,
): Array<[number, number]> {
  if (gap <= 0 || width <= 0 || height <= 0) return [];
  const points: Array<[number, number]> = [];
  for (let y = gap / 2; y < height; y += gap) {
    for (let x = gap / 2; x < width; x += gap) points.push([x, y]);
  }
  return points;
}

/** Paints one frame of the field. */
export function drawDots(
  ctx: CanvasRenderingContext2D,
  points: ReadonlyArray<readonly [number, number]>,
  pointer: PointerState,
  time: number,
  color: string,
): void {
  ctx.fillStyle = color;
  for (const [gx, gy] of points) {
    const dot = computeDot(gx, gy, pointer, time);
    ctx.globalAlpha = dot.alpha;
    ctx.beginPath();
    ctx.arc(dot.x, dot.y, dot.r, 0, FULL_TURN);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}
