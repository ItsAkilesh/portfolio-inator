/**
 * File: linkChecker.ts
 * Purpose: Checks external links found in the content for the admin health page. Server-side
 *          requests are restricted (OWASP A10): only http(s) on standard ports, no credentials in
 *          URLs, and every host must resolve to public addresses only. The request connects to the
 *          exact address that was checked, so DNS cannot be switched to an internal one in between,
 *          and every redirect hop is checked the same way.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import { lookup } from "node:dns/promises";
import { request as httpRequest } from "node:http";
import { request as httpsRequest } from "node:https";
import { isIP } from "node:net";
import { isPublicAddress } from "./netPolicy";

export const MAX_LINKS = 100;
const MAX_REDIRECTS = 3;
const TIMEOUT_MS = 8000;
const CONCURRENCY = 6;
const ALLOWED_PORTS: ReadonlySet<string> = new Set(["", "80", "443"]);
const USER_AGENT = "portfolio-admin-link-check";

export interface LinkResult {
  readonly url: string;
  readonly ok: boolean;
  readonly status: number | null;
  readonly reason?: string;
}

export interface Resolved {
  readonly address: string;
  readonly family: 4 | 6;
}

export type Resolver = (host: string) => Promise<readonly Resolved[]>;

const systemResolver: Resolver = async (host) =>
  (await lookup(host, { all: true })).map((entry) => ({
    address: entry.address,
    family: entry.family === 6 ? 6 : 4,
  }));

/** Problem with a URL before any network access, or null. */
export function urlProblem(
  text: string,
  allowedPorts: ReadonlySet<string> = ALLOWED_PORTS,
): string | null {
  let url: URL;
  try {
    url = new URL(text);
  } catch {
    return "Not a valid URL";
  }
  if (url.protocol !== "http:" && url.protocol !== "https:")
    return "Only http and https links are checked";
  if (url.username || url.password)
    return "Links with credentials are not checked";
  if (!allowedPorts.has(url.port)) return "Only standard ports are checked";
  return null;
}

interface Hop {
  readonly status: number;
  readonly location: string | null;
}

function headOnce(
  url: URL,
  target: Resolved,
  method: "HEAD" | "GET",
): Promise<Hop> {
  const send = url.protocol === "https:" ? httpsRequest : httpRequest;
  return new Promise((resolve, reject) => {
    const req = send(
      url,
      {
        method,
        timeout: TIMEOUT_MS,
        headers: { "user-agent": USER_AGENT, accept: "*/*" },
        /* Connect to the address that passed the policy check, not a fresh lookup. */
        lookup: (_host, options, callback) =>
          options.all
            ? callback(null, [
                { address: target.address, family: target.family },
              ])
            : callback(null, target.address, target.family),
      },
      (res) => {
        res.resume();
        resolve({
          status: res.statusCode ?? 0,
          location: res.headers.location ?? null,
        });
      },
    );
    req.on("timeout", () => req.destroy(new Error("timed out")));
    req.on("error", reject);
    req.end();
  });
}

export interface LinkCheckerOptions {
  readonly resolve?: Resolver;
  readonly isAllowed?: (address: string) => boolean;
  /** Ports links may use; tests add the port of a local server. */
  readonly allowedPorts?: ReadonlySet<string>;
}

export class LinkChecker {
  private readonly resolve: Resolver;
  private readonly isAllowed: (address: string) => boolean;
  private readonly ports: ReadonlySet<string>;

  constructor(options: LinkCheckerOptions = {}) {
    this.resolve = options.resolve ?? systemResolver;
    this.isAllowed = options.isAllowed ?? isPublicAddress;
    this.ports = options.allowedPorts ?? ALLOWED_PORTS;
  }

  async checkAll(urls: readonly string[]): Promise<LinkResult[]> {
    const unique = [...new Set(urls)].slice(0, MAX_LINKS);
    const results: LinkResult[] = [];
    let next = 0;
    const worker = async () => {
      while (next < unique.length) {
        const url = unique[next++] ?? "";
        results.push(await this.check(url));
      }
    };
    await Promise.all(Array.from({ length: CONCURRENCY }, worker));
    return results.sort((a, b) => a.url.localeCompare(b.url));
  }

  async check(text: string): Promise<LinkResult> {
    const problem = urlProblem(text, this.ports);
    if (problem) return { url: text, ok: false, status: null, reason: problem };
    try {
      return await this.follow(text, new URL(text), 0);
    } catch (error) {
      const reason = error instanceof Error ? error.message : "request failed";
      return { url: text, ok: false, status: null, reason };
    }
  }

  private async target(url: URL): Promise<Resolved> {
    const host = url.hostname.replace(/^\[|\]$/g, "");
    const addresses = isIP(host)
      ? [{ address: host, family: isIP(host) === 6 ? 6 : 4 } as const]
      : await this.resolve(host);
    if (
      addresses.length === 0 ||
      !addresses.every((a) => this.isAllowed(a.address))
    )
      throw new Error("Host is not on the public internet");
    return addresses[0] as Resolved; // non-empty: checked above
  }

  private async follow(
    original: string,
    url: URL,
    depth: number,
  ): Promise<LinkResult> {
    const problem = urlProblem(url.toString(), this.ports);
    if (problem)
      return { url: original, ok: false, status: null, reason: problem };
    const target = await this.target(url);
    let hop = await headOnce(url, target, "HEAD");
    /* Some servers refuse HEAD; ask again with GET (the body is discarded). */
    if (hop.status === 405 || hop.status === 501)
      hop = await headOnce(url, target, "GET");
    if (hop.status >= 300 && hop.status < 400 && hop.location) {
      if (depth >= MAX_REDIRECTS)
        return {
          url: original,
          ok: false,
          status: hop.status,
          reason: "Too many redirects",
        };
      return this.follow(original, new URL(hop.location, url), depth + 1);
    }
    const ok = hop.status >= 200 && hop.status < 400;
    return ok
      ? { url: original, ok, status: hop.status }
      : { url: original, ok, status: hop.status, reason: `HTTP ${hop.status}` };
  }
}
