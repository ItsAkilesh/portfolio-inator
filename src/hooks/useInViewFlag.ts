/**
 * File: useInViewFlag.ts
 * Purpose: Mirrors whether an element is on screen into a data attribute on <html>, so unrelated
 *          components (the header) can react in CSS. Removes the attribute on unmount.
 * Author: Akilesh
 * Date: 2026-10-20
 */
import { useEffect, type RefObject } from "react";
import { describeError, logger } from "../lib/logger";

/** Portion of the element that must remain visible for it to count as in view. */
const VISIBLE_THRESHOLD = 0.15;

interface InViewOptions {
  readonly threshold?: number;
  readonly rootMargin?: string;
}

export function useInViewFlag(
  ref: RefObject<HTMLElement | null>,
  attribute: string,
  options: InViewOptions = {},
): void {
  const { threshold = VISIBLE_THRESHOLD, rootMargin = "0px" } = options;
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
        { threshold, rootMargin },
      );
      observer.observe(element);
    } catch (error) {
      logger.warn("inViewFlag.observe", describeError(error));
    }
    return () => {
      observer?.disconnect();
      root.removeAttribute(attribute);
    };
  }, [ref, attribute, threshold, rootMargin]);
}
