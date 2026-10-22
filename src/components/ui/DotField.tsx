/**
 * File: DotField.tsx
 * Purpose: Decorative canvas filling its positioned parent; colors itself from the parent's text color.
 * Author: Akilesh
 * Date: 2026-10-20
 */
import { useRef } from "react";
import { useDotField } from "../../hooks/useDotField";
import { useReducedMotion } from "../../hooks/useReducedMotion";

const CANVAS_STYLE = {
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
} as const;

export function DotField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isReduced = useReducedMotion();
  useDotField(canvasRef, !isReduced);
  return <canvas ref={canvasRef} style={CANVAS_STYLE} aria-hidden="true" />;
}
