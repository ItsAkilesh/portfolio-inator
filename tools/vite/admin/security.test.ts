/**
 * File: security.test.ts
 * Purpose: Tests for the admin API access rules.
 * Author: Akilesh
 * Date: 2026-10-21
 */
// @vitest-environment node
import { describe, expect, it } from "vitest";
import {
  checkAccess,
  createToken,
  hostnameOf,
  isLocalHost,
  isSameOrigin,
  tokensMatch,
} from "./security";

const TOKEN = createToken();
const base = {
  host: "localhost:5173",
  origin: "http://localhost:5173",
  token: TOKEN,
  method: "PUT",
};

describe("host and origin checks", () => {
  it("accepts loopback hosts with any port", () => {
    for (const host of [
      "localhost:5173",
      "127.0.0.1:4000",
      "[::1]:5173",
      "LOCALHOST",
    ])
      expect(isLocalHost(host)).toBe(true);
  });
  it("rejects other hosts, including rebinding names", () => {
    for (const host of [
      "evil.example:5173",
      "localhost.evil.example",
      "192.168.1.5:5173",
      undefined,
    ])
      expect(isLocalHost(host)).toBe(false);
  });
  it("parses IPv6 hostnames", () => {
    expect(hostnameOf("[::1]:5173")).toBe("[::1]");
  });
  it("matches the origin to the host exactly", () => {
    expect(isSameOrigin("http://localhost:5173", "localhost:5173")).toBe(true);
    expect(isSameOrigin("http://localhost:3000", "localhost:5173")).toBe(false);
    expect(isSameOrigin("not a url", "localhost:5173")).toBe(false);
    expect(isSameOrigin(undefined, "localhost:5173")).toBe(false);
  });
});

describe("tokens", () => {
  it("creates long random tokens", () => {
    expect(TOKEN).toMatch(/^[0-9a-f]{64}$/);
    expect(createToken()).not.toBe(TOKEN);
  });
  it("compares exactly", () => {
    expect(tokensMatch(TOKEN, TOKEN)).toBe(true);
    expect(tokensMatch(TOKEN, TOKEN.slice(1))).toBe(false);
    expect(tokensMatch(TOKEN, undefined)).toBe(false);
  });
});

describe("checkAccess", () => {
  it("allows a same-origin write with the token", () => {
    expect(checkAccess(base, TOKEN)).toEqual({ ok: true });
  });
  it("allows a read without an Origin header", () => {
    expect(
      checkAccess({ ...base, method: "GET", origin: undefined }, TOKEN),
    ).toEqual({ ok: true });
  });
  it.each([
    ["foreign host", { host: "evil.example" }, "host is not localhost"],
    ["no token", { token: undefined }, "missing or wrong token"],
    ["wrong token", { token: "x" }, "missing or wrong token"],
    [
      "cross-origin write",
      { origin: "https://evil.example" },
      "cross-origin write",
    ],
    ["write without origin", { origin: undefined }, "cross-origin write"],
  ])("denies %s", (_name, change, reason) => {
    expect(checkAccess({ ...base, ...change }, TOKEN)).toEqual({
      ok: false,
      reason,
    });
  });
});
