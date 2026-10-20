/**
 * File: useDotField.ts
 * Purpose: Runs the dot field animation on a canvas: resizes with its host, follows the pointer,
 *          pauses off-screen, draws a single still frame for reduced motion, and cleans up fully.
 * Author: Akilesh
 * Date: 2026-10-20
 */
import { useEffect, type RefObject } from "react";
import {
  DEFAULT_DOT_FIELD,
  drawDots,
  gridPoints,
  type PointerState,
} from "../lib/dotField";
import { describeError, logger } from "../lib/logger";

const MAX_PIXEL_RATIO = 2;
const FOLLOW = 0.14;
const FADE = 0.06;

interface Field {
  readonly canvas: HTMLCanvasElement;
  readonly host: HTMLElement;
  readonly ctx: CanvasRenderingContext2D;
  readonly pointer: PointerState;
  readonly target: { x: number; y: number; isInside: boolean };
  points: Array<[number, number]>;
  width: number;
  height: number;
}

type Cleanup = () => void;

function resize(field: Field): void {
  const rect = field.host.getBoundingClientRect();
  const ratio = Math.min(MAX_PIXEL_RATIO, window.devicePixelRatio || 1);
  field.width = rect.width;
  field.height = rect.height;
  field.canvas.width = Math.round(rect.width * ratio);
  field.canvas.height = Math.round(rect.height * ratio);
  field.ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  field.points = gridPoints(rect.width, rect.height, DEFAULT_DOT_FIELD.gap);
}

function paint(field: Field, time: number): void {
  const { pointer, target } = field;
  pointer.x += (target.x - pointer.x) * FOLLOW;
  pointer.y += (target.y - pointer.y) * FOLLOW;
  pointer.strength += ((target.isInside ? 1 : 0) - pointer.strength) * FADE;
  field.ctx.clearRect(0, 0, field.width, field.height);
  drawDots(
    field.ctx,
    field.points,
    pointer,
    time,
    getComputedStyle(field.canvas).color,
  );
}

function bindPointer(field: Field): Cleanup {
  const onMove = (event: PointerEvent) => {
    const rect = field.host.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    if (!field.target.isInside) Object.assign(field.pointer, { x, y });
    Object.assign(field.target, { x, y, isInside: true });
  };
  const onLeave = () => {
    field.target.isInside = false;
  };
  field.host.addEventListener("pointermove", onMove);
  field.host.addEventListener("pointerleave", onLeave);
  return () => {
    field.host.removeEventListener("pointermove", onMove);
    field.host.removeEventListener("pointerleave", onLeave);
  };
}

function runLoop(field: Field, isAnimated: boolean): Cleanup {
  let frame = 0;
  let isVisible = true;
  const tick = (time: number) => {
    frame = 0;
    if (!isVisible) return;
    paint(field, time);
    frame = requestAnimationFrame(tick);
  };
  const start = () => {
    if (isAnimated && !frame) frame = requestAnimationFrame(tick);
  };
  const sizeObserver = new ResizeObserver(() => {
    resize(field);
    if (!isAnimated) paint(field, 0);
  });
  const viewObserver = new IntersectionObserver((entries) => {
    isVisible = entries[0]?.isIntersecting ?? true;
    if (isVisible) start();
  });
  sizeObserver.observe(field.host);
  viewObserver.observe(field.host);
  start();
  return () => {
    cancelAnimationFrame(frame);
    sizeObserver.disconnect();
    viewObserver.disconnect();
  };
}

function startField(
  canvas: HTMLCanvasElement,
  isAnimated: boolean,
): Cleanup | undefined {
  const host = canvas.parentElement;
  const ctx = canvas.getContext("2d");
  if (!host || !ctx) return undefined;
  const field: Field = {
    canvas,
    host,
    ctx,
    pointer: { x: 0, y: 0, strength: 0 },
    target: { x: 0, y: 0, isInside: false },
    points: [],
    width: 0,
    height: 0,
  };
  const stopLoop = runLoop(field, isAnimated);
  const unbind = bindPointer(field);
  return () => {
    stopLoop();
    unbind();
  };
}

export function useDotField(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  isAnimated: boolean,
): void {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    try {
      return startField(canvas, isAnimated);
    } catch (error) {
      logger.warn("dotField.start", describeError(error));
      return undefined;
    }
  }, [canvasRef, isAnimated]);
}
