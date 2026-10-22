/**
 * File: effects.ts
 * Purpose: Window-level effects of the admin console, each cleaned up on unmount: the unsaved-changes
 *          warning, the save shortcut and following content changes announced by the dev server.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import { useEffect } from "react";
import { CONTENT_CHANGED_EVENT } from "../content/events";

export function useUnsavedGuard(isActive: boolean): void {
  useEffect(() => {
    if (!isActive) return undefined;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [isActive]);
}

export function useSaveShortcut(save: () => Promise<void>): void {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        void save();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [save]);
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
