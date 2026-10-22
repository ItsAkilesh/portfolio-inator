/**
 * File: draft.ts
 * Purpose: State of the content being edited: the saved snapshot, the working draft, save status and
 *          the undo/redo history. A pure reducer, so every transition is testable without React.
 *          Typing in one field within a short window is one undo step, not one per keystroke.
 * Author: Akilesh
 * Date: 2026-10-21 (updated 2026-10-22)
 */
import { pathId, setIn, type Path } from "./paths";

export type SaveStatus = "loading" | "idle" | "saving" | "saved" | "error";

export interface HistoryStep {
  readonly draft: unknown;
  /** What the step changed, e.g. "pages.1.label"; shown in the history menu. */
  readonly label: string;
}

export interface DraftState {
  readonly status: SaveStatus;
  readonly version: string;
  readonly saved: unknown;
  readonly draft: unknown;
  /** Problems reported by the server on load or save. */
  readonly serverIssues: readonly string[];
  readonly past: readonly HistoryStep[];
  readonly future: readonly HistoryStep[];
  /** Field and time of the last edit, to merge rapid edits of one field into one step. */
  readonly lastEdit: { readonly key: string; readonly at: number } | null;
}

export type DraftAction =
  | {
      readonly type: "loaded";
      readonly content: unknown;
      readonly version: string;
    }
  | {
      readonly type: "edit";
      readonly path: Path;
      readonly value: unknown;
      readonly at: number;
    }
  /** Replaces the whole draft (import, restore, history); one undo step. */
  | {
      readonly type: "replace";
      readonly draft: unknown;
      readonly label: string;
    }
  | { readonly type: "undo" }
  | { readonly type: "redo" }
  | { readonly type: "revert" }
  | { readonly type: "saving" }
  | { readonly type: "saved"; readonly version: string }
  | { readonly type: "failed"; readonly issues: readonly string[] };

export const MAX_HISTORY = 100;
export const MERGE_WINDOW_MS = 1000;

export const initialDraft: DraftState = {
  status: "loading",
  version: "",
  saved: null,
  draft: null,
  serverIssues: [],
  past: [],
  future: [],
  lastEdit: null,
};

const unsavedStatus = (status: SaveStatus): SaveStatus =>
  status === "saved" ? "idle" : status;

/** Moves to `draft`, recording the current draft as one undo step. */
function commit(state: DraftState, draft: unknown, label: string): DraftState {
  if (draft === state.draft) return state;
  return {
    ...state,
    status: unsavedStatus(state.status),
    draft,
    past: [...state.past, { draft: state.draft, label }].slice(-MAX_HISTORY),
    future: [],
    lastEdit: null,
  };
}

function edit(
  state: DraftState,
  action: Extract<DraftAction, { type: "edit" }>,
): DraftState {
  const key = pathId(action.path);
  const draft = setIn(state.draft, action.path, action.value);
  const last = state.lastEdit;
  const isSameBurst =
    last !== null && last.key === key && action.at - last.at < MERGE_WINDOW_MS;
  if (isSameBurst)
    return {
      ...state,
      status: unsavedStatus(state.status),
      draft,
      future: [],
      lastEdit: { key, at: action.at },
    };
  return {
    ...commit(state, draft, key || "(root)"),
    lastEdit: { key, at: action.at },
  };
}

function travel(state: DraftState, direction: "undo" | "redo"): DraftState {
  const from = direction === "undo" ? state.past : state.future;
  const step = from[from.length - 1];
  if (!step) return state;
  const back = { draft: state.draft, label: step.label };
  const rest = from.slice(0, -1);
  return {
    ...state,
    status: unsavedStatus(state.status),
    draft: step.draft,
    past: direction === "undo" ? rest : [...state.past, back],
    future: direction === "undo" ? [...state.future, back] : rest,
    lastEdit: null,
  };
}

function loaded(
  state: DraftState,
  action: Extract<DraftAction, { type: "loaded" }>,
): DraftState {
  return {
    ...initialDraft,
    /* Reloading the file this console just saved keeps the "saved" confirmation. */
    status:
      state.status === "saved" && action.version === state.version
        ? "saved"
        : "idle",
    version: action.version,
    saved: action.content,
    draft: action.content,
  };
}

function revert(state: DraftState): DraftState {
  return {
    ...commit(state, state.saved, "revert"),
    status: "idle",
    serverIssues: [],
  };
}

function saved(state: DraftState, version: string): DraftState {
  return {
    ...state,
    status: "saved",
    version,
    saved: state.draft,
    lastEdit: null,
  };
}

export function draftReducer(
  state: DraftState,
  action: DraftAction,
): DraftState {
  switch (action.type) {
    case "loaded":
      return loaded(state, action);
    case "edit":
      return edit(state, action);
    case "replace":
      return commit(state, action.draft, action.label);
    case "undo":
    case "redo":
      return travel(state, action.type);
    case "revert":
      return revert(state);
    case "saving":
      return { ...state, status: "saving", serverIssues: [] };
    case "saved":
      return saved(state, action.version);
    case "failed":
      return { ...state, status: "error", serverIssues: action.issues };
    default:
      return state;
  }
}

export const isDirty = (state: DraftState): boolean =>
  state.draft !== state.saved;
export const canUndo = (state: DraftState): boolean => state.past.length > 0;
export const canRedo = (state: DraftState): boolean => state.future.length > 0;
