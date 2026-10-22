/**
 * File: paths.test.ts
 * Purpose: Tests for the immutable path helpers.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import { describe, expect, it } from "vitest";
import { getIn, moveItem, pathId, removeAt, renameKey, setIn } from "./paths";

const ROOT = { a: { list: [{ name: "x" }, { name: "y" }] }, n: 1 };

describe("getIn", () => {
  it("reads nested keys and indexes", () => {
    expect(getIn(ROOT, ["a", "list", 1, "name"])).toBe("y");
    expect(getIn(ROOT, [])).toBe(ROOT);
  });
  it("returns undefined for missing or mismatched steps", () => {
    expect(getIn(ROOT, ["a", "missing"])).toBeUndefined();
    expect(getIn(ROOT, ["a", "list", "0"])).toBeUndefined();
    expect(getIn(ROOT, ["n", "deeper"])).toBeUndefined();
  });
});

describe("setIn", () => {
  it("replaces one value and copies only the path", () => {
    const next = setIn(ROOT, ["a", "list", 0, "name"], "z") as typeof ROOT;
    expect(next.a.list[0]?.name).toBe("z");
    expect(ROOT.a.list[0]?.name).toBe("x");
    expect(next.a.list[1]).toBe(ROOT.a.list[1]);
  });
  it("refuses paths that do not exist", () => {
    expect(() => setIn(ROOT, ["a", "list", 5, "name"], "z")).toThrow(
      /No value at a.list.5/,
    );
  });
});

describe("list helpers", () => {
  it("removes and moves items", () => {
    expect(removeAt([1, 2, 3], 1)).toEqual([1, 3]);
    expect(moveItem([1, 2, 3], 0, 2)).toEqual([2, 3, 1]);
    expect(moveItem([1, 2, 3], 0, 9)).toEqual([1, 2, 3]);
  });
});

describe("renameKey", () => {
  it("keeps order and refuses collisions", () => {
    expect(Object.keys(renameKey({ a: 1, b: 2 }, "a", "c"))).toEqual([
      "c",
      "b",
    ]);
    expect(renameKey({ a: 1, b: 2 }, "a", "b")).toEqual({ a: 1, b: 2 });
  });
  it("formats ids", () => {
    expect(pathId(["pages", 2, "blocks"])).toBe("pages.2.blocks");
  });
});
