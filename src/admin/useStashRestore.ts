/**
 * File: useStashRestore.ts
 * Purpose: Loads the content on start and, if this browser kept unsaved edits from last time, offers
 *          to restore them (or restores them silently after a reload the console made itself).
 * Author: Akilesh
 * Date: 2026-10-21 (updated 2026-10-22)
 */
import { useCallback, useEffect, useRef, useState } from "react";
import type { DraftState } from "./draft";
import {
  clearStash,
  isWorthRestoring,
  readStash,
  type DraftStash,
} from "./draftStash";

export interface RestoreOffer {
  readonly savedAt: string;
  /** The file changed since these edits were made; restoring may undo those changes. */
  readonly isStale: boolean;
  readonly accept: () => void;
  readonly dismiss: () => void;
}

/** Once the file has loaded, checks the stash and either restores it silently or offers it. */
function useStashCheck(
  state: DraftState,
  replace: (draft: unknown, label: string) => void,
  notify: (message: string) => void,
  offer: (stash: DraftStash) => void,
): void {
  const hasChecked = useRef(false);
  useEffect(() => {
    if (
      hasChecked.current ||
      state.status === "loading" ||
      state.saved === null
    )
      return;
    hasChecked.current = true;
    const found = readStash();
    if (!found) return;
    if (!isWorthRestoring(found, state.saved)) {
      clearStash();
      return;
    }
    if (found.isAutoRestore && found.baseVersion === state.version) {
      /* The stash stays until autosave stores the restored draft, so a second reload restores too. */
      replace(found.draft, "restored edits");
      notify("Your unsaved edits were restored");
    } else offer(found);
  }, [state.status, state.saved, state.version, replace, notify, offer]);
}

export function useStashRestore(
  state: DraftState,
  replace: (draft: unknown, label: string) => void,
  reload: (isCurrent: () => boolean) => Promise<void>,
  notify: (message: string) => void,
): RestoreOffer | null {
  const [stash, setStash] = useState<DraftStash | null>(null);
  useEffect(() => {
    /*
     * Only the latest load counts: in development React runs this effect twice, and a second
     * result landing after the restore below would replace the restored draft.
     */
    let isActive = true;
    void reload(() => isActive);
    return () => {
      isActive = false;
    };
  }, [reload]);
  useStashCheck(state, replace, notify, setStash);
  const accept = useCallback(() => {
    if (stash) replace(stash.draft, "restored edits");
    setStash(null);
  }, [stash, replace]);
  const dismiss = useCallback(() => {
    clearStash();
    setStash(null);
  }, []);
  if (!stash) return null;
  return {
    savedAt: stash.savedAt,
    isStale: stash.baseVersion !== state.version,
    accept,
    dismiss,
  };
}
