/**
 * File: linkChecker.test.ts
 * Purpose: Tests for the link checker against a local HTTP server (allowed only through an injected
 *          policy): status handling, HEAD to GET fallback, redirects and their limits.
 * Author: Akilesh
 * Date: 2026-10-21
 */
// @vitest-environment node
import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { LinkChecker, urlProblem } from "./linkChecker";

let server: Server;
let port = 0;
beforeAll(async () => {
  server = createServer((req, res) => {
    const routes: Record<string, () => void> = {
      "/ok": () => res.writeHead(200).end(),
      "/missing": () => res.writeHead(404).end(),
      "/no-head": () => res.writeHead(req.method === "HEAD" ? 405 : 200).end(),
      "/hop": () => res.writeHead(301, { location: "/ok" }).end(),
      "/loop": () => res.writeHead(302, { location: "/loop" }).end(),
      "/away": () =>
        res.writeHead(302, { location: "ftp://elsewhere.example/" }).end(),
    };
    (routes[req.url ?? ""] ?? (() => res.writeHead(500).end()))();
  });
  await new Promise<void>((done) => server.listen(0, "127.0.0.1", done));
  port = (server.address() as AddressInfo).port;
});
afterAll(() => new Promise<void>((done) => server.close(() => done())));

const checker = () =>
  new LinkChecker({
    resolve: async () => [{ address: "127.0.0.1", family: 4 }],
    isAllowed: () => true,
    allowedPorts: new Set(["", "80", "443", String(port)]),
  });
const at = (path: string) => `http://site.test:${port}${path}`;

describe("urlProblem", () => {
  it("allows only plain http(s) URLs on standard ports", () => {
    expect(urlProblem("https://example.com/a")).toBeNull();
    expect(urlProblem("mailto:x@example.com")).not.toBeNull();
    expect(urlProblem("https://a:b@example.com")).not.toBeNull();
    expect(urlProblem("https://example.com:22")).not.toBeNull();
    expect(urlProblem("nonsense")).not.toBeNull();
  });
});

describe("LinkChecker", () => {
  it("connects to the checked address and reports statuses", async () => {
    const results = await checker().checkAll([
      at("/ok"),
      at("/missing"),
      at("/ok"),
    ]);
    expect(results).toEqual([
      { url: at("/missing"), ok: false, status: 404, reason: "HTTP 404" },
      { url: at("/ok"), ok: true, status: 200 },
    ]);
  });
  it("retries with GET when HEAD is refused", async () => {
    expect((await checker().check(at("/no-head"))).ok).toBe(true);
  });
  it("follows redirects within the limit and re-checks every hop", async () => {
    expect(await checker().check(at("/hop"))).toEqual({
      url: at("/hop"),
      ok: true,
      status: 200,
    });
    expect((await checker().check(at("/loop"))).reason).toBe(
      "Too many redirects",
    );
    expect((await checker().check(at("/away"))).reason).toBe(
      "Only http and https links are checked",
    );
  });
  it("refuses hosts that resolve to blocked addresses", async () => {
    const blocked = new LinkChecker({
      resolve: async () => [{ address: "127.0.0.1", family: 4 }],
    });
    expect((await blocked.check("http://site.test/")).reason).toBe(
      "Host is not on the public internet",
    );
    expect((await blocked.check("http://127.0.0.1/")).reason).toBe(
      "Host is not on the public internet",
    );
  });
  it("refuses non-standard ports by default", async () => {
    const plain = new LinkChecker({ isAllowed: () => true });
    expect((await plain.check(at("/ok"))).reason).toBe(
      "Only standard ports are checked",
    );
  });
});
