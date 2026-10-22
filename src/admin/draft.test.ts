/**
 * File: draft.test.ts
 * Purpose: Tests for the admin draft reducer: loading, edits, saving, failures, and the undo/redo
 *          history (merging rapid edits, limits, whole-draft replacements).
 * Author: Akilesh
 * Date: 2026-10-21 (updated 2026-10-22)
 */
import { describe, expect, it } from "vitest";
import {
  MAX_HISTORY,
  MERGE_WINDOW_MS,
  canRedo,
  canUndo,
  draftReducer,
  initialDraft,
  isDirty,
  type DraftAction,
  type DraftState,
} from "./draft";

const loaded = draftReducer(initialDraft, {
  type: "loaded",
  content: { a: 1, b: 1 },
  version: "v1",
});
const run = (state: DraftState, ...actions: DraftAction[]) =>
  actions.reduce(draftReducer, state);
const edit = (path: string, value: unknown, at: number): DraftAction => ({
  type: "edit",
  path: [path],
  value,
  at,
});

describe("draftReducer basics", () => {
  it("loads a clean draft with no history", () => {
    expect(loaded.status).toBe("idle");
    expect(isDirty(loaded)).toBe(false);
    expect(canUndo(loaded)).toBe(false);
  });
  it("tracks edits and reverts them (revert is undoable)", () => {
    const edited = run(loaded, edit("a", 2, 0));
    expect(isDirty(edited)).toBe(true);
    const reverted = run(edited, { type: "revert" });
    expect(isDirty(reverted)).toBe(false);
    expect(run(reverted, { type: "undo" }).draft).toEqual({ a: 2, b: 1 });
  });
  it("marks a save and keeps the confirmation when the same file reloads", () => {
    const saved = run(
      loaded,
      edit("a", 2, 0),
      { type: "saving" },
      { type: "saved", version: "v2" },
    );
    expect(saved.status).toBe("saved");
    expect(isDirty(saved)).toBe(false);
    expect(
      run(saved, { type: "loaded", content: { a: 2 }, version: "v2" }).status,
    ).toBe("saved");
    expect(
      run(saved, { type: "loaded", content: { a: 3 }, version: "v3" }).status,
    ).toBe("idle");
  });
  it("keeps the draft when a save fails", () => {
    const failed = run(loaded, edit("a", 2, 0), {
      type: "failed",
      issues: ["nope"],
    });
    expect(failed.status).toBe("error");
    expect(failed.serverIssues).toEqual(["nope"]);
    expect(isDirty(failed)).toBe(true);
  });
});

describe("undo and redo", () => {
  it("undoes and redoes edits in order", () => {
    const state = run(loaded, edit("a", 2, 0), edit("b", 5, 5000));
    const once = run(state, { type: "undo" });
    expect(once.draft).toEqual({ a: 2, b: 1 });
    const twice = run(once, { type: "undo" });
    expect(twice.draft).toEqual({ a: 1, b: 1 });
    expect(isDirty(twice)).toBe(false);
    expect(run(twice, { type: "redo" }, { type: "redo" }).draft).toEqual({
      a: 2,
      b: 5,
    });
  });
  it("merges rapid edits of one field into one step, but not across fields or pauses", () => {
    const typed = run(
      loaded,
      edit("a", 2, 0),
      edit("a", 3, 100),
      edit("a", 4, 200),
    );
    expect(typed.past).toHaveLength(1);
    expect(run(typed, { type: "undo" }).draft).toEqual({ a: 1, b: 1 });
    const paused = run(
      loaded,
      edit("a", 2, 0),
      edit("a", 3, MERGE_WINDOW_MS + 1),
    );
    expect(paused.past).toHaveLength(2);
    const fields = run(loaded, edit("a", 2, 0), edit("b", 3, 10));
    expect(fields.past.map((s) => s.label)).toEqual(["a", "b"]);
  });
  it("drops the redo stack after a new edit", () => {
    const state = run(
      loaded,
      edit("a", 2, 0),
      { type: "undo" },
      edit("b", 9, 5000),
    );
    expect(canRedo(state)).toBe(false);
  });
  it("records replacements as one labelled step and ignores no-op replacements", () => {
    const replaced = run(loaded, {
      type: "replace",
      draft: { a: 7 },
      label: "import x",
    });
    expect(replaced.past.at(-1)?.label).toBe("import x");
    expect(run(replaced, { type: "undo" }).draft).toBe(loaded.draft);
    expect(
      run(loaded, { type: "replace", draft: loaded.draft, label: "same" }),
    ).toBe(loaded);
  });
  it("keeps at most MAX_HISTORY steps", () => {
    const many = Array.from({ length: MAX_HISTORY + 20 }, (_, i) =>
      edit("a", i, i * MERGE_WINDOW_MS * 2),
    );
    expect(run(loaded, ...many).past).toHaveLength(MAX_HISTORY);
  });
  it("does nothing when there is nothing to undo or redo", () => {
    expect(run(loaded, { type: "undo" })).toBe(loaded);
    expect(run(loaded, { type: "redo" })).toBe(loaded);
  });
  it("clears history when a new file is loaded", () => {
    const state = run(loaded, edit("a", 2, 0), {
      type: "loaded",
      content: { a: 9 },
      version: "v9",
    });
    expect(canUndo(state)).toBe(false);
  });
});
