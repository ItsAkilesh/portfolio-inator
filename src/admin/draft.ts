/**
 * File: draft.ts
 * Purpose: State of the content being edited: the saved snapshot, the working draft and save status.
 *          A pure reducer, so every transition is testable without React.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import { setIn, type Path } from "./paths";

export type SaveStatus = "loading" | "idle" | "saving" | "saved" | "error";

export interface DraftState {
  readonly status: SaveStatus;
  readonly version: string;
  readonly saved: unknown;
  readonly draft: unknown;
  /** Problems reported by the server on load or save. */
  readonly serverIssues: readonly string[];
}

export type DraftAction =
  | {
      readonly type: "loaded";
      readonly content: unknown;
      readonly version: string;
    }
  | { readonly type: "edit"; readonly path: Path; readonly value: unknown }
  | { readonly type: "revert" }
  | { readonly type: "saving" }
  | { readonly type: "saved"; readonly version: string }
  | { readonly type: "failed"; readonly issues: readonly string[] };

export const initialDraft: DraftState = {
  status: "loading",
  version: "",
  saved: null,
  draft: null,
  serverIssues: [],
};

export function draftReducer(
  state: DraftState,
  action: DraftAction,
): DraftState {
  switch (action.type) {
    case "loaded":
      return {
        /* Reloading the file this console just saved keeps the "saved" confirmation. */
        status:
          state.status === "saved" && action.version === state.version
            ? "saved"
            : "idle",
        version: action.version,
        saved: action.content,
        draft: action.content,
        serverIssues: [],
      };
    case "edit":
      return {
        ...state,
        status: state.status === "saved" ? "idle" : state.status,
        draft: setIn(state.draft, action.path, action.value),
      };
    case "revert":
      return { ...state, status: "idle", draft: state.saved, serverIssues: [] };
    case "saving":
      return { ...state, status: "saving", serverIssues: [] };
    case "saved":
      return {
        ...state,
        status: "saved",
        version: action.version,
        saved: state.draft,
      };
    case "failed":
      return { ...state, status: "error", serverIssues: action.issues };
    default:
      return state;
  }
}

export const isDirty = (state: DraftState): boolean =>
  state.draft !== state.saved;
