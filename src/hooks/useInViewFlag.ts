/**
 * File: useInViewFlag.ts
 * Purpose: Mirrors whether an element is on screen into a data attribute on <html>, so unrelated
 *          components (the header logo) can react in CSS. Removes the attribute on unmount.
 * Author: Akilesh
 * Date: 2026-10-20
 */
import { useEffect, type RefObject } from "react";
import { describeError, logger } from "../lib/logger";

/** Portion of the element that must remain visible for it to count as in view. */
const VISIBLE_THRESHOLD = 0.15;

export function useInViewFlag(
  ref: RefObject<HTMLElement | null>,
  attribute: string,
): void {
  useEffect(() => {
    const element = ref.current;
    const root = document.documentElement;
    if (!element) return undefined;
    let observer: IntersectionObserver | null = null;
    try {
      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry?.isIntersecting) root.setAttribute(attribute, "true");
          else root.removeAttribute(attribute);
        },
        { threshold: VISIBLE_THRESHOLD },
      );
      observer.observe(element);
    } catch (error) {
      logger.warn("inViewFlag.observe", describeError(error));
    }
    return () => {
      observer?.disconnect();
      root.removeAttribute(attribute);
    };
  }, [ref, attribute]);
}
