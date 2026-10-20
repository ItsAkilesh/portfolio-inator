/**
 * File: useIconCloud.ts
 * Purpose: Animates the children of a container as a rotating sphere. Writes transforms directly to the
 *          DOM (no React re-render per frame), steers with the pointer, pauses off-screen, and draws one
 *          still frame when motion is reduced.
 * Author: Akilesh
 * Date: 2026-10-20
 */
import { useEffect, type RefObject } from "react";
import { describeError, logger } from "../lib/logger";
import { fibonacciSphere, project, rotate, type Point3 } from "../lib/sphere";

const RADIUS_RATIO = 0.4;
const BASE_SPEED_X = 0.00012;
const BASE_SPEED_Y = 0.00028;
const STEER_SPEED = 0.0006;
const EASE = 0.05;
const INITIAL_TILT = 0.35;

interface CloudState {
  angleX: number;
  angleY: number;
  speedX: number;
  speedY: number;
  targetX: number;
  targetY: number;
  last: number;
}

type Cleanup = () => void;

function layout(
  container: HTMLElement,
  points: readonly Point3[],
  state: CloudState,
): void {
  const radius = container.clientWidth * RADIUS_RATIO;
  const items = container.children;
  points.forEach((point, index) => {
    const el = items[index] as HTMLElement | undefined;
    if (!el) return;
    const p = project(rotate(point, state.angleX, state.angleY), radius);
    el.style.transform = `translate3d(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px, 0) scale(${p.scale.toFixed(3)})`;
    el.style.opacity = p.opacity.toFixed(3);
    el.style.zIndex = String(p.layer);
  });
}

function advance(state: CloudState, now: number): void {
  const elapsed = state.last ? Math.min(now - state.last, 64) : 16;
  state.last = now;
  state.speedX += (state.targetX - state.speedX) * EASE;
  state.speedY += (state.targetY - state.speedY) * EASE;
  state.angleX += state.speedX * elapsed;
  state.angleY += state.speedY * elapsed;
}

function bindSteering(container: HTMLElement, state: CloudState): Cleanup {
  const onMove = (event: PointerEvent) => {
    const rect = container.getBoundingClientRect();
    const dx = (event.clientX - rect.left) / rect.width - 0.5;
    const dy = (event.clientY - rect.top) / rect.height - 0.5;
    state.targetY = BASE_SPEED_Y + dx * STEER_SPEED * 2;
    state.targetX = BASE_SPEED_X - dy * STEER_SPEED * 2;
  };
  const onLeave = () => {
    state.targetX = BASE_SPEED_X;
    state.targetY = BASE_SPEED_Y;
  };
  container.addEventListener("pointermove", onMove);
  container.addEventListener("pointerleave", onLeave);
  return () => {
    container.removeEventListener("pointermove", onMove);
    container.removeEventListener("pointerleave", onLeave);
  };
}

const initialState = (): CloudState => ({
  angleX: INITIAL_TILT,
  angleY: 0,
  speedX: BASE_SPEED_X,
  speedY: BASE_SPEED_Y,
  targetX: BASE_SPEED_X,
  targetY: BASE_SPEED_Y,
  last: 0,
});

function runCloud(
  container: HTMLElement,
  count: number,
  isAnimated: boolean,
): Cleanup {
  const points = fibonacciSphere(count);
  const state = initialState();
  let frame = 0;
  let isVisible = true;
  const tick = (now: number) => {
    frame = 0;
    if (!isVisible) return;
    advance(state, now);
    layout(container, points, state);
    frame = requestAnimationFrame(tick);
  };
  const sizeObserver = new ResizeObserver(() =>
    layout(container, points, state),
  );
  const viewObserver = new IntersectionObserver(([entry]) => {
    isVisible = entry?.isIntersecting ?? true;
    state.last = 0;
    if (isVisible && isAnimated && !frame) frame = requestAnimationFrame(tick);
  });
  sizeObserver.observe(container);
  viewObserver.observe(container);
  const unbind = isAnimated ? bindSteering(container, state) : () => undefined;
  layout(container, points, state);
  return () => {
    cancelAnimationFrame(frame);
    sizeObserver.disconnect();
    viewObserver.disconnect();
    unbind();
  };
}

export function useIconCloud(
  containerRef: RefObject<HTMLElement | null>,
  count: number,
  isAnimated: boolean,
): void {
  useEffect(() => {
    const container = containerRef.current;
    if (!container || count <= 0) return undefined;
    try {
      return runCloud(container, count, isAnimated);
    } catch (error) {
      logger.warn("iconCloud.start", describeError(error));
      return undefined;
    }
  }, [containerRef, count, isAnimated]);
}
