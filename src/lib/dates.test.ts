/**
 * File: dates.test.ts
 * Purpose: Tests for partial dates and date ranges: parsing, ordering and display.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import { describe, expect, it } from "vitest";
import {
  displayDate,
  displayRange,
  formatDateValue,
  isOrdered,
  machineDate,
  parseDate,
  type DateRange,
} from "./dates";

const LABELS = { locale: "en-US", present: "Present", expected: "expected" };
const range = (over: Partial<DateRange>): DateRange => ({
  label: "",
  start: "",
  end: "",
  isEndExpected: false,
  ...over,
});

describe("parseDate", () => {
  it("accepts a year, a month and an optional day", () => {
    expect(parseDate("2025")).toEqual({ year: 2025 });
    expect(parseDate("2025-08")).toEqual({ year: 2025, month: 8 });
    expect(parseDate("2024-02-29")).toEqual({ year: 2024, month: 2, day: 29 });
  });
  it("rejects impossible or malformed dates", () => {
    for (const bad of [
      "",
      "25",
      "2025-13",
      "2025-00",
      "2023-02-29",
      "2025-8",
      "present",
      "1800",
    ])
      expect(parseDate(bad)).toBeNull();
  });
  it("round-trips through formatDateValue", () => {
    for (const value of ["2025", "2025-08", "2025-08-04"]) {
      const parsed = parseDate(value);
      expect(parsed && formatDateValue(parsed)).toBe(value);
    }
  });
});

describe("isOrdered", () => {
  it("orders by precision-aware keys and ignores empty or present ends", () => {
    expect(isOrdered("2024-03", "2024-11")).toBe(true);
    expect(isOrdered("2024", "2024-01")).toBe(true);
    expect(isOrdered("2024-11", "2024-03")).toBe(false);
    expect(isOrdered("2024", "present")).toBe(true);
    expect(isOrdered("", "")).toBe(true);
  });
});

describe("display", () => {
  it("shows each precision in the locale", () => {
    expect(displayDate("2021", "en-US")).toBe("2021");
    expect(displayDate("2025-08", "en-US")).toBe("Aug 2025");
    expect(displayDate("2025-10-14", "en-US")).toBe("Oct 14, 2025");
    expect(displayDate("2025-08", "de-DE")).toBe("Aug. 2025");
  });
  it("falls back to English for an unknown locale", () => {
    expect(displayDate("2025-08", "not a locale")).toBe("Aug 2025");
  });
  it("formats ranges, present, expected and prefixes", () => {
    expect(
      displayRange(range({ start: "2025-08", end: "present" }), LABELS),
    ).toBe("Aug 2025 - Present");
    expect(
      displayRange(
        range({ start: "2026-08", end: "2027-12", isEndExpected: true }),
        LABELS,
      ),
    ).toBe("Aug 2026 - Dec 2027 (expected)");
    expect(
      displayRange(range({ label: "Filed", start: "2025-10-14" }), LABELS),
    ).toBe("Filed Oct 14, 2025");
    expect(displayRange(range({ start: "2024", end: "2024" }), LABELS)).toBe(
      "2024",
    );
  });
  it("shows nothing without a start date", () => {
    expect(displayRange(range({}), LABELS)).toBe("");
    expect(machineDate(range({}))).toBe("");
    expect(machineDate(range({ start: "2025-08" }))).toBe("2025-08");
  });
});
