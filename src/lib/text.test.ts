/**
 * File: text.test.ts
 * Purpose: Tests for text helpers.
 * Author: Akilesh
 * Date: 2026-10-20
 */
import { describe, expect, it } from "vitest";
import {
  displayUrl,
  indexLabel,
  splitAuthors,
  splitName,
  staggerDelay,
  stripLeadingSymbols,
  yearOf,
} from "./text";

describe("stripLeadingSymbols", () => {
  it("removes leading emoji and spaces", () => {
    expect(stripLeadingSymbols("⚡ Built pipelines")).toBe("Built pipelines");
  });
  it("keeps text that starts with a letter, digit or parenthesis", () => {
    expect(stripLeadingSymbols("CGPA: 8.76")).toBe("CGPA: 8.76");
    expect(stripLeadingSymbols("2D games")).toBe("2D games");
    expect(stripLeadingSymbols("(beta) tool")).toBe("(beta) tool");
  });
  it("returns an empty string for symbols only", () => {
    expect(stripLeadingSymbols("⚡ ✨")).toBe("");
  });
});

describe("indexLabel", () => {
  it("is one-based and zero-padded", () => {
    expect(indexLabel(0)).toBe("01");
    expect(indexLabel(11)).toBe("12");
  });
  it("does not truncate three digits", () => {
    expect(indexLabel(99)).toBe("100");
  });
});

describe("staggerDelay", () => {
  it("grows with the index", () => {
    expect(staggerDelay(0)).toBe("0.04s");
    expect(staggerDelay(2)).toBe("0.16s");
  });
  it("clamps negative indexes to the base delay", () => {
    expect(staggerDelay(-3)).toBe("0.04s");
  });
});

describe("displayUrl", () => {
  it("drops protocol and trailing slash", () => {
    expect(displayUrl("https://www.cmu.edu/")).toBe("www.cmu.edu");
    expect(displayUrl("http://chennai.vit.ac.in")).toBe("chennai.vit.ac.in");
  });
  it("leaves non-http strings alone", () => {
    expect(displayUrl("mailto:a@b.c")).toBe("mailto:a@b.c");
  });
});

describe("splitAuthors", () => {
  const name = "Akilesh Srinivasa Kumar";
  it("splits around the highlighted name", () => {
    expect(splitAuthors(`Dr X, ${name}, Y`, name)).toEqual({
      before: "Dr X, ",
      highlight: name,
      after: ", Y",
    });
  });
  it("handles the name at the start", () => {
    expect(splitAuthors(`${name}, Y`, name).before).toBe("");
  });
  it("returns everything as before when the name is absent or empty", () => {
    expect(splitAuthors("A, B", name)).toEqual({
      before: "A, B",
      highlight: "",
      after: "",
    });
    expect(splitAuthors("A, B", "")).toEqual({
      before: "A, B",
      highlight: "",
      after: "",
    });
  });
});

describe("splitName", () => {
  it("separates the first word", () => {
    expect(splitName("Akilesh Srinivasa Kumar")).toEqual({
      first: "Akilesh",
      rest: "Srinivasa Kumar",
    });
  });
  it("handles single words and extra whitespace", () => {
    expect(splitName("  Akilesh ")).toEqual({ first: "Akilesh", rest: "" });
    expect(splitName("")).toEqual({ first: "", rest: "" });
  });
});

describe("yearOf", () => {
  it("reads the year from an ISO date", () => {
    expect(yearOf("2026-09-13T18:13:35Z")).toBe("2026");
  });
  it("returns empty for invalid input", () => {
    expect(yearOf("not a date")).toBe("");
  });
});
