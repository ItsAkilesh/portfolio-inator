/**
 * File: useIconCloud.ts
 * Purpose: Animates an icon polyhedron: rotates lattice points, positions the icon chips, the SVG edges
 *          between neighbors and the shaded glass faces. Writes to the DOM directly (no React re-render per frame), steers with the
 *          pointer, pauses off-screen, and draws one still frame when motion is reduced.
 * Author: Akilesh
 * Date: 2026-10-20
 */
import { useEffect, type RefObject } from "react";
import { describeError, logger } from "../lib/logger";
import { shadeFace } from "../lib/glassShading";
import { project, rotate, type Point3, type Projected } from "../lib/sphere";

const RADIUS_RATIO = 0.4;
const BASE_SPEED_X = 0.00012;
const BASE_SPEED_Y = 0.00028;
const STEER_SPEED = 0.0006;
const EASE = 0.05;
const INITIAL_TILT = 0.35;
const EDGE_OPACITY = 0.55;
const MAX_FRAME_MS = 64;
const DEFAULT_FRAME_MS = 16;

export const CLOUD_ITEM_ATTR = "data-cloud-item";
export const CLOUD_EDGE_ATTR = "data-cloud-edge";
export const CLOUD_ORIGIN_ATTR = "data-cloud-origin";
export const CLOUD_FACE_ATTR = "data-cloud-face";

/** Geometry of the polyhedron: vertices, neighbor edges and triangular faces (index triples). */
export interface CloudMesh {
  readonly points: readonly Point3[];
  readonly edges: ReadonlyArray<readonly [number, number]>;
  readonly faces: ReadonlyArray<readonly [number, number, number]>;
}

interface CloudState {
  angleX: number;
  angleY: number;
  speedX: number;
  speedY: number;
  targetX: number;
  targetY: number;
  last: number;
}

interface Scene {
  readonly container: HTMLElement;
  readonly items: readonly HTMLElement[];
  readonly lines: readonly SVGLineElement[];
  readonly polygons: readonly SVGPolygonElement[];
  readonly origin: SVGGElement | null;
  readonly mesh: CloudMesh;
}

type Cleanup = () => void;

const initialState = (): CloudState => ({
  angleX: INITIAL_TILT,
  angleY: 0,
  speedX: BASE_SPEED_X,
  speedY: BASE_SPEED_Y,
  targetX: BASE_SPEED_X,
  targetY: BASE_SPEED_Y,
  last: 0,
});

function placeItems(scene: Scene, projected: readonly Projected[]): void {
  projected.forEach((p, index) => {
    const el = scene.items[index];
    if (!el) return;
    el.style.transform = `translate3d(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px, 0) scale(${p.scale.toFixed(3)})`;
    el.style.opacity = p.opacity.toFixed(3);
    el.style.zIndex = String(p.layer + 1);
  });
}

function placeEdges(scene: Scene, projected: readonly Projected[]): void {
  scene.mesh.edges.forEach(([from, to], index) => {
    const line = scene.lines[index];
    const a = projected[from];
    const b = projected[to];
    if (!line || !a || !b) return;
    line.setAttribute("x1", a.x.toFixed(1));
    line.setAttribute("y1", a.y.toFixed(1));
    line.setAttribute("x2", b.x.toFixed(1));
    line.setAttribute("y2", b.y.toFixed(1));
    line.setAttribute(
      "stroke-opacity",
      (Math.min(a.opacity, b.opacity) * EDGE_OPACITY).toFixed(3),
    );
  });
}

const toPoints = (...vertices: Projected[]): string =>
  vertices.map((v) => `${v.x.toFixed(1)},${v.y.toFixed(1)}`).join(" ");

function placeFaces(
  scene: Scene,
  rotated: readonly Point3[],
  projected: readonly Projected[],
): void {
  scene.mesh.faces.forEach(([a, b, c], index) => {
    const polygon = scene.polygons[index];
    const [ra, rb, rc] = [rotated[a], rotated[b], rotated[c]];
    const [pa, pb, pc] = [projected[a], projected[b], projected[c]];
    if (!polygon || !ra || !rb || !rc || !pa || !pb || !pc) return;
    const shade = shadeFace(ra, rb, rc);
    polygon.setAttribute("points", toPoints(pa, pb, pc));
    polygon.setAttribute("fill-opacity", shade.opacity.toFixed(3));
  });
}

function layout(scene: Scene, state: CloudState): void {
  const size = scene.container.clientWidth;
  const radius = size * RADIUS_RATIO;
  const rotated = scene.mesh.points.map((point) =>
    rotate(point, state.angleX, state.angleY),
  );
  const projected = rotated.map((point) => project(point, radius));
  scene.origin?.setAttribute("transform", `translate(${size / 2} ${size / 2})`);
  placeFaces(scene, rotated, projected);
  placeItems(scene, projected);
  placeEdges(scene, projected);
}

function advance(state: CloudState, now: number): void {
  const elapsed = state.last
    ? Math.min(now - state.last, MAX_FRAME_MS)
    : DEFAULT_FRAME_MS;
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

function runCloud(scene: Scene, isAnimated: boolean): Cleanup {
  const state = initialState();
  let frame = 0;
  let isVisible = true;
  const tick = (now: number) => {
    frame = 0;
    if (!isVisible) return;
    advance(state, now);
    layout(scene, state);
    frame = requestAnimationFrame(tick);
  };
  const sizeObserver = new ResizeObserver(() => layout(scene, state));
  const viewObserver = new IntersectionObserver(([entry]) => {
    isVisible = entry?.isIntersecting ?? true;
    state.last = 0;
    if (isVisible && isAnimated && !frame) frame = requestAnimationFrame(tick);
  });
  sizeObserver.observe(scene.container);
  viewObserver.observe(scene.container);
  const unbind = isAnimated
    ? bindSteering(scene.container, state)
    : () => undefined;
  layout(scene, state);
  return () => {
    cancelAnimationFrame(frame);
    sizeObserver.disconnect();
    viewObserver.disconnect();
    unbind();
  };
}

function collectScene(container: HTMLElement, mesh: CloudMesh): Scene {
  return {
    container,
    items: [...container.querySelectorAll<HTMLElement>(`[${CLOUD_ITEM_ATTR}]`)],
    lines: [
      ...container.querySelectorAll<SVGLineElement>(`[${CLOUD_EDGE_ATTR}]`),
    ],
    polygons: [
      ...container.querySelectorAll<SVGPolygonElement>(`[${CLOUD_FACE_ATTR}]`),
    ],
    origin: container.querySelector<SVGGElement>(`[${CLOUD_ORIGIN_ATTR}]`),
    mesh,
  };
}

export function useIconCloud(
  containerRef: RefObject<HTMLElement | null>,
  mesh: CloudMesh,
  isAnimated: boolean,
): void {
  useEffect(() => {
    const container = containerRef.current;
    if (!container || mesh.points.length === 0) return undefined;
    try {
      return runCloud(collectScene(container, mesh), isAnimated);
    } catch (error) {
      logger.warn("iconCloud.start", describeError(error));
      return undefined;
    }
  }, [containerRef, mesh, isAnimated]);
}
