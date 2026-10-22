/**
 * File: netPolicy.test.ts
 * Purpose: Tests that only public addresses pass the link checker's network policy.
 * Author: Akilesh
 * Date: 2026-10-21
 */
// @vitest-environment node
import { describe, expect, it } from "vitest";
import { isPublicAddress } from "./netPolicy";

describe("isPublicAddress", () => {
  it.each(["93.184.216.34", "8.8.8.8", "2606:4700:4700::1111"])(
    "allows %s",
    (address) => {
      expect(isPublicAddress(address)).toBe(true);
    },
  );
  it.each([
    "127.0.0.1",
    "10.1.2.3",
    "172.16.0.1",
    "172.31.255.255",
    "192.168.1.1",
    "169.254.169.254",
    "100.64.0.1",
    "0.0.0.0",
    "224.0.0.1",
    "255.255.255.255",
    "::1",
    "::",
    "fe80::1",
    "fd00::1",
    "::ffff:127.0.0.1",
    "::ffff:7f00:1",
    "64:ff9b::a00:1",
    "2001:db8::1",
    "not an ip",
  ])("blocks %s", (address) => {
    expect(isPublicAddress(address)).toBe(false);
  });
});
