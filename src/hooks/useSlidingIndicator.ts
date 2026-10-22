/**
 * File: useSlidingIndicator.ts
 * Purpose: Measures the active option of a segmented control and publishes its box as CSS
 *          variables on the group, so one indicator element can slide between options.
 *          Re-measures when the group resizes (wrapping, fonts loading) and on value change.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import { useLayoutEffect, type RefObject } from "react";
import { describeError, logger } from "../lib/logger";

/** Attribute that marks the selected option inside the group. */
export const ACTIVE_OPTION_ATTR = "aria-pressed";

export interface IndicatorBox {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

/** Box of the active option relative to its group, or null when none is selected. */
export function activeBox(group: HTMLElement): IndicatorBox | null {
  const active = group.querySelector<HTMLElement>(
    `[${ACTIVE_OPTION_ATTR}="true"]`,
  );
  if (!active) return null;
  return {
    x: active.offsetLeft,
    y: active.offsetTop,
    width: active.offsetWidth,
    height: active.offsetHeight,
  };
}

function publish(group: HTMLElement): void {
  const box = activeBox(group);
  group.dataset.indicator = box ? "on" : "off";
  if (!box) return;
  group.style.setProperty("--ind-x", `${box.x}px`);
  group.style.setProperty("--ind-y", `${box.y}px`);
  group.style.setProperty("--ind-w", `${box.width}px`);
  group.style.setProperty("--ind-h", `${box.height}px`);
}

export function useSlidingIndicator(
  groupRef: RefObject<HTMLElement | null>,
  value: string,
): void {
  useLayoutEffect(() => {
    const group = groupRef.current;
    if (!group) return undefined;
    publish(group);
    let observer: ResizeObserver | null = null;
    try {
      observer = new ResizeObserver(() => publish(group));
      observer.observe(group);
    } catch (error) {
      logger.warn("slidingIndicator.observe", describeError(error));
    }
    return () => observer?.disconnect();
  }, [groupRef, value]);
}
