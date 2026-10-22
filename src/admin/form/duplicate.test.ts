/**
 * File: duplicate.test.ts
 * Purpose: Tests for duplicating list items and the drop position of dragged items.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { pageSchema } from "../../content/schema";
import { duplicateAt, freeCopyName } from "./duplicate";
import { dropIndex } from "./useListDrag";

describe("duplicateAt", () => {
  it("places a deep copy right after the original", () => {
    const items = [{ a: { b: 1 } }, { a: { b: 2 } }];
    const next = duplicateAt(
      items,
      0,
      z.object({ a: z.object({ b: z.number() }) }),
    );
    expect(next).toEqual([{ a: { b: 1 } }, { a: { b: 1 } }, { a: { b: 2 } }]);
    expect(next[1]).not.toBe(items[0]);
  });
  it("makes a page's id and path unique", () => {
    const pages = [
      {
        id: "about",
        path: "/about",
        label: "About",
        showInNav: true,
        blocks: [],
      },
      {
        id: "about-copy",
        path: "/about-copy",
        label: "x",
        showInNav: true,
        blocks: [],
      },
    ];
    const next = duplicateAt(pages, 0, pageSchema) as typeof pages;
    expect(next[1]).toMatchObject({
      id: "about-copy-2",
      path: "/about-copy-2",
      label: "About",
    });
    expect(pageSchema.safeParse(next[1]).success).toBe(true);
  });
  it("returns a copy unchanged for an index out of range", () => {
    expect(duplicateAt(["a"], 3, z.string())).toEqual(["a"]);
  });
  it("finds a free copy name", () => {
    expect(freeCopyName("x", new Set())).toBe("x-copy");
    expect(freeCopyName("x", new Set(["x-copy", "x-copy-2"]))).toBe("x-copy-3");
  });
});

describe("dropIndex", () => {
  it.each([
    [0, { index: 2, side: "after" }, 2],
    [0, { index: 2, side: "before" }, 1],
    [3, { index: 0, side: "before" }, 0],
    [3, { index: 0, side: "after" }, 1],
    [1, { index: 1, side: "after" }, 1],
  ] as const)("from %i onto %o lands at %i", (from, target, expected) => {
    expect(dropIndex(from, target)).toBe(expected);
  });
});
