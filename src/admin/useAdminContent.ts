/**
 * File: useAdminContent.ts
 * Purpose: Loads the content from the dev server, holds the draft, saves it (Ctrl/Cmd+S too), keeps the
 *          image library fresh, follows changes made on disk and warns before leaving with unsaved changes.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import { useCallback, useEffect, useReducer, type Dispatch } from "react";
import { loadContent, saveContent } from "./api";
import {
  draftReducer,
  initialDraft,
  isDirty,
  type DraftAction,
  type DraftState,
} from "./draft";
import { useDiskChanges, useSaveShortcut, useUnsavedGuard } from "./effects";
import type { Path } from "./paths";
import { useImageLibrary } from "./useImageLibrary";
import { validateDraft } from "./validation";

export interface AdminContent {
  readonly state: DraftState;
  readonly images: readonly string[];
  readonly edit: (path: Path, value: unknown) => void;
  readonly save: () => Promise<void>;
  readonly revert: () => void;
  readonly reload: () => Promise<void>;
  readonly upload: (file: File) => Promise<string | null>;
}

const CONFLICT =
  "portfolio.json changed on disk since it was loaded; reload first";

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

function useReload(dispatch: Dispatch<DraftAction>): () => Promise<void> {
  return useCallback(async () => {
    const result = await loadContent();
    dispatch(
      result.ok
        ? {
            type: "loaded",
            content: result.data.content,
            version: result.data.version,
          }
        : { type: "failed", issues: result.issues },
    );
  }, [dispatch]);
}

export function useAdminContent(): AdminContent {
  const [state, dispatch] = useReducer(draftReducer, initialDraft);
  const reportFailure = useCallback(
    (issues: readonly string[]) => dispatch({ type: "failed", issues }),
    [],
  );
  const { images, upload } = useImageLibrary(reportFailure);
  const reload = useReload(dispatch);
  const save = useSave(state, dispatch);
  useEffect(() => {
    void reload();
  }, [reload]);
  const onConflict = useCallback(
    () => reportFailure([CONFLICT]),
    [reportFailure],
  );
  useUnsavedGuard(isDirty(state));
  useDiskChanges(
    isDirty(state) && state.status !== "saving",
    reload,
    onConflict,
  );
  useSaveShortcut(save);
  const edit = useCallback(
    (path: Path, value: unknown) => dispatch({ type: "edit", path, value }),
    [],
  );
  const revert = useCallback(() => dispatch({ type: "revert" }), []);
  return { state, images, edit, save, revert, reload, upload };
}
