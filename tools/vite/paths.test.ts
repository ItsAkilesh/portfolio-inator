/**
 * File: paths.test.ts
 * Purpose: Tests that file identity survives Windows separators and drive-letter case.
 * Author: Akilesh
 * Date: 2026-10-21
 */
// @vitest-environment node
import { describe, expect, it } from "vitest";
import { isSameFile } from "./paths";

describe("isSameFile", () => {
  it("matches Vite's forward-slash paths against Windows paths", () => {
    expect(
      isSameFile(
        "D:/Projects/app/src/content/portfolio.json",
        "D:\\Projects\\app\\src\\content\\portfolio.json",
      ),
    ).toBe(true);
    expect(
      isSameFile("d:/Projects/app/x.json", "D:\\Projects\\app\\x.json"),
    ).toBe(true);
  });
  it("matches identical POSIX paths and rejects different files", () => {
    expect(isSameFile("/home/a/x.json", "/home/a/x.json")).toBe(true);
    expect(isSameFile("/home/a/x.json", "/home/a/y.json")).toBe(false);
    expect(isSameFile("D:/a/X.json", "D:\\a\\x.json")).toBe(false);
  });
});
