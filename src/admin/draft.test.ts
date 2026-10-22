/**
 * File: draft.test.ts
 * Purpose: Tests for the admin draft reducer.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import { describe, expect, it } from "vitest";
import { draftReducer, initialDraft, isDirty } from "./draft";

const loaded = draftReducer(initialDraft, {
  type: "loaded",
  content: { a: 1 },
  version: "v1",
});

describe("draftReducer", () => {
  it("loads a clean draft", () => {
    expect(loaded.status).toBe("idle");
    expect(isDirty(loaded)).toBe(false);
  });
  it("tracks edits and reverts them", () => {
    const edited = draftReducer(loaded, {
      type: "edit",
      path: ["a"],
      value: 2,
    });
    expect(isDirty(edited)).toBe(true);
    expect(isDirty(draftReducer(edited, { type: "revert" }))).toBe(false);
  });
  it("marks a save and keeps the confirmation when the same file reloads", () => {
    const edited = draftReducer(loaded, {
      type: "edit",
      path: ["a"],
      value: 2,
    });
    const saved = draftReducer(draftReducer(edited, { type: "saving" }), {
      type: "saved",
      version: "v2",
    });
    expect(saved.status).toBe("saved");
    expect(isDirty(saved)).toBe(false);
    expect(
      draftReducer(saved, { type: "loaded", content: { a: 2 }, version: "v2" })
        .status,
    ).toBe("saved");
    expect(
      draftReducer(saved, { type: "loaded", content: { a: 3 }, version: "v3" })
        .status,
    ).toBe("idle");
  });
  it("keeps the draft when a save fails", () => {
    const edited = draftReducer(loaded, {
      type: "edit",
      path: ["a"],
      value: 2,
    });
    const failed = draftReducer(edited, { type: "failed", issues: ["nope"] });
    expect(failed.status).toBe("error");
    expect(failed.serverIssues).toEqual(["nope"]);
    expect(isDirty(failed)).toBe(true);
  });
});
