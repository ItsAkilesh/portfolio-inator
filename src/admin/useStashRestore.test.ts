/**
 * File: useStashRestore.test.ts
 * Purpose: Tests that the console's first load ignores results from an effect run React discarded,
 *          so a late duplicate load cannot replace a restored draft.
 * Author: Akilesh
 * Date: 2026-10-22
 */
import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { initialDraft } from "./draft";
import { useStashRestore } from "./useStashRestore";

const noop = () => undefined;

describe("useStashRestore first load", () => {
  it("marks a load as no longer current once its effect is cleaned up", () => {
    const checks: Array<() => boolean> = [];
    const reload = vi.fn((isCurrent: () => boolean) => {
      checks.push(isCurrent);
      return Promise.resolve();
    });
    const { unmount } = renderHook(() =>
      useStashRestore(initialDraft, noop, reload, noop),
    );
    expect(reload).toHaveBeenCalled();
    expect(checks.at(-1)?.()).toBe(true);
    unmount();
    expect(checks.every((isCurrent) => !isCurrent())).toBe(true);
  });

  it("offers nothing while the content is still loading", () => {
    const { result } = renderHook(() =>
      useStashRestore(initialDraft, noop, () => Promise.resolve(), noop),
    );
    expect(result.current).toBeNull();
  });
});
