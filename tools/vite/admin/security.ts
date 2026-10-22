/**
 * File: security.ts
 * Purpose: Request checks for the dev-only admin API. The dev server listens on the developer's
 *          machine, where any open web page can send it requests, so every write must prove it came
 *          from the admin page itself: a localhost Host (defeats DNS rebinding), a same-origin Origin
 *          (defeats cross-site requests) and a per-server-start token only the admin page can read.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import { randomBytes, timingSafeEqual } from "node:crypto";

const TOKEN_BYTES = 32;
const LOCAL_HOSTNAMES: ReadonlySet<string> = new Set([
  "localhost",
  "127.0.0.1",
  "[::1]",
  "::1",
]);

export const TOKEN_HEADER = "x-portfolio-admin-token";

export interface RequestFacts {
  readonly host: string | undefined;
  readonly origin: string | undefined;
  readonly token: string | undefined;
  readonly method: string;
}

export type AccessResult =
  | { readonly ok: true }
  | { readonly ok: false; readonly reason: string };

export const createToken = (): string =>
  randomBytes(TOKEN_BYTES).toString("hex");

/** Hostname of a Host header value, without the port; IPv6 keeps its brackets. */
export function hostnameOf(host: string): string {
  const bracket = /^\[[^\]]+\]/.exec(host);
  if (bracket) return bracket[0];
  return host.split(":")[0] ?? host;
}

export const isLocalHost = (host: string | undefined): boolean =>
  !!host && LOCAL_HOSTNAMES.has(hostnameOf(host).toLowerCase());

/** True when the Origin header names the same scheme-less host:port the request was sent to. */
export function isSameOrigin(
  origin: string | undefined,
  host: string | undefined,
): boolean {
  if (!origin || !host) return false;
  try {
    return new URL(origin).host.toLowerCase() === host.toLowerCase();
  } catch {
    return false;
  }
}

export function tokensMatch(
  expected: string,
  received: string | undefined,
): boolean {
  if (!received) return false;
  const a = Buffer.from(expected);
  const b = Buffer.from(received);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Reads (GET) need a local Host and the token; writes also need a same-origin Origin. */
export function checkAccess(
  facts: RequestFacts,
  expectedToken: string,
): AccessResult {
  if (!isLocalHost(facts.host))
    return { ok: false, reason: "host is not localhost" };
  if (!tokensMatch(expectedToken, facts.token))
    return { ok: false, reason: "missing or wrong token" };
  const isWrite = facts.method !== "GET" && facts.method !== "HEAD";
  if (isWrite && !isSameOrigin(facts.origin, facts.host))
    return { ok: false, reason: "cross-origin write" };
  return { ok: true };
}
