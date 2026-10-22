/**
 * File: effects.ts
 * Purpose: Window-level effects of the admin console, each cleaned up on unmount: the unsaved-changes
 *          warning, keyboard shortcuts, following content changes announced by the dev server, and
 *          keeping unsaved edits in local storage.
 * Author: Akilesh
 * Date: 2026-10-21 (updated 2026-10-22)
 */
import { useEffect } from "react";
import { CONTENT_CHANGED_EVENT } from "../content/events";
import { clearStash, writeStash } from "./draftStash";

const AUTOSAVE_DELAY_MS = 400;

export function useUnsavedGuard(isActive: boolean): void {
  useEffect(() => {
    if (!isActive) return undefined;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [isActive]);
}

export interface Shortcuts {
  readonly save: () => void;
  readonly undo: () => void;
  readonly redo: () => void;
  readonly search: () => void;
}

/** The action for a key press with Ctrl or Cmd, or null. */
export function shortcutFor(
  event: Pick<KeyboardEvent, "key" | "ctrlKey" | "metaKey" | "shiftKey">,
  actions: Shortcuts,
): (() => void) | null {
  if (!event.ctrlKey && !event.metaKey) return null;
  const key = event.key.toLowerCase();
  if (key === "s") return actions.save;
  if (key === "k") return actions.search;
  if (key === "y" || (key === "z" && event.shiftKey)) return actions.redo;
  if (key === "z") return actions.undo;
  return null;
}

/** Ctrl/Cmd+S save, +Z undo, +Shift+Z or +Y redo, +K search. Undo is the console's, in text fields too. */
export function useShortcuts(actions: Shortcuts): void {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const action = shortcutFor(event, actions);
      if (!action) return;
      event.preventDefault();
      action();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [actions]);
}

/** Refreshes the draft when portfolio.json changes on disk, unless there are unsaved edits. */
export function useDiskChanges(
  hasUnsavedEdits: boolean,
  reload: () => Promise<void>,
  onConflict: () => void,
): void {
  useEffect(() => {
    const hot = import.meta.hot;
    if (!hot) return undefined;
    const onChange = () => (hasUnsavedEdits ? onConflict() : void reload());
    hot.on(CONTENT_CHANGED_EVENT, onChange);
    /* Test runners provide a partial hot context without off(). */
    return () => hot.off?.(CONTENT_CHANGED_EVENT, onChange);
  }, [hasUnsavedEdits, reload, onConflict]);
}

/** Keeps unsaved edits in local storage (debounced); clears them once nothing is unsaved. */
export function useAutosave(
  draft: unknown,
  baseVersion: string,
  isDirty: boolean,
  isReady: boolean,
): void {
  useEffect(() => {
    if (!isReady) return undefined;
    if (!isDirty) {
      clearStash(true);
      return undefined;
    }
    const timer = setTimeout(
      () => writeStash(draft, baseVersion),
      AUTOSAVE_DELAY_MS,
    );
    return () => clearTimeout(timer);
  }, [draft, baseVersion, isDirty, isReady]);
}
