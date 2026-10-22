/**
 * File: useAdminContent.ts
 * Purpose: The admin console's content state: loads it from the dev server, holds the draft with its
 *          undo history, saves it, restores unsaved edits kept in local storage, keeps the image
 *          library fresh, follows changes made on disk and handles the keyboard shortcuts.
 * Author: Akilesh
 * Date: 2026-10-21 (updated 2026-10-22)
 */
import { useCallback, useMemo, useReducer, type Dispatch } from "react";
import { loadContent, saveContent } from "./api/content";
import {
  draftReducer,
  initialDraft,
  isDirty,
  type DraftAction,
  type DraftState,
} from "./draft";
import { useAutosave, useDiskChanges, useUnsavedGuard } from "./effects";
import { useNotify } from "./notices";
import type { Path } from "./paths";
import { STALE_HINT } from "./staleHint";
import { useStashRestore, type RestoreOffer } from "./useStashRestore";
import { useImageLibrary } from "./useImageLibrary";
import { validateDraft } from "./validation";

export interface AdminContent {
  readonly state: DraftState;
  readonly images: readonly string[];
  readonly edit: (path: Path, value: unknown) => void;
  readonly replace: (draft: unknown, label: string) => void;
  readonly undo: () => void;
  readonly redo: () => void;
  readonly save: () => Promise<void>;
  readonly revert: () => void;
  readonly reload: () => Promise<void>;
  readonly upload: (file: File) => Promise<string | null>;
  readonly refreshImages: () => Promise<void>;
  readonly restoreOffer: RestoreOffer | null;
}

const CONFLICT = `portfolio.json ${STALE_HINT} (it was edited on disk); reload first`;

function useSave(
  state: DraftState,
  dispatch: Dispatch<DraftAction>,
): () => Promise<void> {
  return useCallback(async () => {
    if (!isDirty(state) || state.status === "saving") return;
    const problems = validateDraft(state.draft).all;
    if (problems.length > 0) {
      dispatch({ type: "failed", issues: problems });
      return;
    }
    dispatch({ type: "saving" });
    const result = await saveContent(state.draft, state.version);
    dispatch(
      result.ok
        ? { type: "saved", version: result.data.version }
        : { type: "failed", issues: result.issues },
    );
  }, [state, dispatch]);
}

/** Loads the file; `isCurrent` lets a caller drop a result it no longer wants (an effect re-run). */
export type ReloadContent = (isCurrent?: () => boolean) => Promise<void>;

function useReload(dispatch: Dispatch<DraftAction>): ReloadContent {
  return useCallback(
    async (isCurrent?: () => boolean) => {
      const result = await loadContent();
      if (isCurrent && !isCurrent()) return;
      dispatch(
        result.ok
          ? {
              type: "loaded",
              content: result.data.content,
              version: result.data.version,
            }
          : { type: "failed", issues: result.issues },
      );
    },
    [dispatch],
  );
}

function useActions(dispatch: Dispatch<DraftAction>) {
  return useMemo(
    () => ({
      edit: (path: Path, value: unknown) =>
        dispatch({ type: "edit", path, value, at: Date.now() }),
      replace: (draft: unknown, label: string) =>
        dispatch({ type: "replace", draft, label }),
      undo: () => dispatch({ type: "undo" }),
      redo: () => dispatch({ type: "redo" }),
      revert: () => dispatch({ type: "revert" }),
    }),
    [dispatch],
  );
}

export function useAdminContent(): AdminContent {
  const [state, dispatch] = useReducer(draftReducer, initialDraft);
  const notify = useNotify();
  const reportFailure = useCallback(
    (issues: readonly string[]) => dispatch({ type: "failed", issues }),
    [],
  );
  const library = useImageLibrary(reportFailure, notify);
  const reload = useReload(dispatch);
  const save = useSave(state, dispatch);
  const actions = useActions(dispatch);
  const restoreOffer = useStashRestore(state, actions.replace, reload, notify);
  const onConflict = useCallback(
    () => reportFailure([CONFLICT]),
    [reportFailure],
  );
  const hasUnsaved = isDirty(state);
  useUnsavedGuard(hasUnsaved);
  useDiskChanges(hasUnsaved && state.status !== "saving", reload, onConflict);
  useAutosave(
    state.draft,
    state.version,
    hasUnsaved,
    state.status !== "loading",
  );
  return {
    state,
    images: library.images,
    ...actions,
    save,
    reload,
    upload: library.upload,
    refreshImages: library.refresh,
    restoreOffer,
  };
}
