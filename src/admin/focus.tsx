/**
 * File: focus.tsx
 * Purpose: Jumping to a field from anywhere (search, health check, review changes, a click in the
 *          preview): the target path travels in the URL (?focus=pages.1.blocks.2), list items on the
 *          way open themselves, and the field scrolls into view, is highlighted and focused.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import { useCallback, useEffect, useMemo } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { pathId, type Path } from "./paths";
import { isPathPrefix, sectionForPath } from "./sections";

const FOCUS_PARAM = "focus";
const HIGHLIGHT_MS = 1600;
/** Frames to wait for nested items to open before revealing what exists. */
const MAX_REVEAL_FRAMES = 30;
/** Navigation state of a focus set by opening an item: the item is already in view. */
const MARK_STATE = "isMarkOnly";

/** "pages.1.label" back to ["pages", 1, "label"]. */
export const parsePathId = (id: string): Path =>
  id === ""
    ? []
    : id.split(".").map((part) => (/^\d+$/.test(part) ? Number(part) : part));

export function useFocusTarget(): Path | null {
  const [params] = useSearchParams();
  const value = params.get(FOCUS_PARAM);
  return useMemo(() => (value === null ? null : parsePathId(value)), [value]);
}

/** Navigates to the section that edits `path` and focuses it there. */
export function useFocusField(): (path: Path) => void {
  const navigate = useNavigate();
  return useCallback(
    (path: Path) => {
      const section = sectionForPath(path);
      if (section)
        navigate(
          `/admin/${section.id}?${FOCUS_PARAM}=${encodeURIComponent(pathId(path))}`,
        );
    },
    [navigate],
  );
}

/** Marks `path` as the field being worked on (opening an item), without scrolling the history. */
export function useMarkFocus(): (path: Path) => void {
  const [, setParams] = useSearchParams();
  return useCallback(
    (path: Path) =>
      setParams(
        { [FOCUS_PARAM]: pathId(path) },
        { replace: true, state: { [MARK_STATE]: true } },
      ),
    [setParams],
  );
}

/** True while `itemPath` is on the way to the focused field, so the item should be open. */
export function useIsOnFocusPath(itemPath: Path): boolean {
  const target = useFocusTarget();
  return target !== null && isPathPrefix(itemPath, target);
}

/** The deepest rendered element for the target path (fields render data-path). */
function findTarget(container: HTMLElement, target: Path): HTMLElement | null {
  for (let length = target.length; length >= 0; length -= 1) {
    const id = pathId(target.slice(0, length));
    const element = container.querySelector<HTMLElement>(
      `[data-path="${CSS.escape(id)}"]`,
    );
    if (element) return element;
  }
  return null;
}

/** Highlights the element and focuses its first field (or its toggle for a closed item). */
function reveal(element: HTMLElement): void {
  element.scrollIntoView?.({ block: "center" });
  element.dataset.focused = "true";
  element
    .querySelector<HTMLElement>("input, textarea, select, [data-summary]")
    ?.focus({ preventScroll: true });
}

/**
 * Waits a few frames for the items on the way to open (each opens in its own render), then reveals
 * the exact field, or the deepest part of the path that exists.
 */
function revealWhenRendered(container: HTMLElement, target: Path): () => void {
  let frame = 0;
  let tries = 0;
  const step = () => {
    tries += 1;
    const exact = container.querySelector<HTMLElement>(
      `[data-path="${CSS.escape(pathId(target))}"]`,
    );
    if (exact || tries >= MAX_REVEAL_FRAMES) {
      const element = exact ?? findTarget(container, target);
      if (element) reveal(element);
      return;
    }
    frame = requestAnimationFrame(step);
  };
  frame = requestAnimationFrame(step);
  return () => cancelAnimationFrame(frame);
}

/** Scrolls to, highlights and focuses the target once it has rendered. */
export function useRevealFocus(container: HTMLElement | null): void {
  const target = useFocusTarget();
  const { key, state } = useLocation();
  const isMarkOnly =
    typeof state === "object" && state !== null && MARK_STATE in state;
  useEffect(() => {
    if (!container || !target || isMarkOnly) return undefined;
    const cancel = revealWhenRendered(container, target);
    const timer = setTimeout(
      () =>
        container
          .querySelector("[data-focused]")
          ?.removeAttribute("data-focused"),
      HIGHLIGHT_MS,
    );
    return () => {
      cancel();
      clearTimeout(timer);
    };
  }, [container, target, key, isMarkOnly]);
}
