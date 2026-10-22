/**
 * File: misc.test.ts
 * Purpose: Tests for asset URLs, storage, logging, dot field math and analytics ID validation.
 * Author: Akilesh
 * Date: 2026-10-20
 */
import { describe, expect, it, vi } from "vitest";
import { isValidClarityId, isValidGaId } from "./analytics";
import { imageUrl } from "./assets";
import { computeDot, gridPoints } from "./dotField";
import { describeError, log, setLogSink, type LogEntry } from "./logger";
import { readStored, writeStored } from "./storage";

describe("imageUrl", () => {
  it("prefixes the images folder and base path", () => {
    expect(imageUrl("cmu.webp", "/")).toBe("/images/cmu.webp");
    expect(imageUrl("/cmu.webp", "/site")).toBe("/site/images/cmu.webp");
  });
  it("passes absolute URLs through", () => {
    expect(imageUrl("https://cdn.example.com/a.png", "/")).toBe(
      "https://cdn.example.com/a.png",
    );
  });
});

describe("storage", () => {
  it("round-trips values", () => {
    expect(writeStored("local", "k", "v")).toBe(true);
    expect(readStored("local", "k")).toBe("v");
  });
  it("returns null for missing keys", () => {
    expect(readStored("session", "missing")).toBeNull();
  });
  it("never throws when storage fails", () => {
    const spy = vi
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(() => {
        throw new Error("quota");
      });
    expect(writeStored("local", "k", "v")).toBe(false);
    spy.mockRestore();
  });
});

describe("logger", () => {
  it("emits timestamped entries to the sink", () => {
    const entries: LogEntry[] = [];
    setLogSink((entry) => entries.push(entry));
    log("ERROR", "op", "failed");
    expect(entries[0]).toMatchObject({
      level: "ERROR",
      operation: "op",
      outcome: "failed",
    });
    expect(Number.isNaN(Date.parse(entries[0]?.timestamp ?? ""))).toBe(false);
    setLogSink(() => undefined);
  });
  it("describes unknown errors without stack traces", () => {
    expect(describeError(new Error("boom"))).toBe("boom");
    expect(describeError("text")).toBe("text");
    expect(describeError({})).toBe("unknown error");
  });
});

describe("dot field", () => {
  it("builds a centered grid", () => {
    expect(gridPoints(48, 24, 24)).toEqual([
      [12, 12],
      [36, 12],
    ]);
  });
  it("returns no points for empty or invalid sizes", () => {
    expect(gridPoints(0, 100, 24)).toEqual([]);
    expect(gridPoints(100, 100, 0)).toEqual([]);
  });
  it("pushes dots away from an active pointer and leaves them when inactive", () => {
    const near = computeDot(110, 100, { x: 100, y: 100, strength: 1 }, 0);
    const idle = computeDot(110, 100, { x: 100, y: 100, strength: 0 }, 0);
    expect(near.x).toBeGreaterThan(110);
    expect(near.r).toBeGreaterThan(idle.r);
    expect(idle.x).toBe(110);
  });
});

describe("analytics ids", () => {
  it("accepts well-formed ids", () => {
    expect(isValidGaId("G-DDW4JPG9S7")).toBe(true);
    expect(isValidClarityId("uwpnm1dcod")).toBe(true);
  });
  it("rejects empty or injected ids", () => {
    expect(isValidGaId("")).toBe(false);
    expect(isValidGaId('G-1"><script>')).toBe(false);
    expect(isValidClarityId(undefined)).toBe(false);
    expect(isValidClarityId("../evil")).toBe(false);
  });
});
