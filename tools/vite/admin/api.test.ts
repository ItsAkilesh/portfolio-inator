/**
 * File: api.test.ts
 * Purpose: End-to-end tests of the admin API over real HTTP: access rules, optimistic versioning,
 *          validation and atomic saves, against a temporary copy of the content.
 * Author: Akilesh
 * Date: 2026-10-21
 */
// @vitest-environment node
import { copyFile, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ContentStore } from "./contentStore";
import { ImageStore } from "./imageStore";
import { createAdminHandler } from "./plugin";
import { TOKEN_HEADER, createToken } from "./security";

const TOKEN = createToken();
const SOURCE = resolve(__dirname, "../../../src/content/portfolio.json");
let dir = "";
let server: Server;
let base = "";

beforeAll(async () => {
  dir = await mkdtemp(join(tmpdir(), "admin-api-"));
  await copyFile(SOURCE, join(dir, "portfolio.json"));
  const stores = {
    content: new ContentStore(join(dir, "portfolio.json")),
    images: new ImageStore(dir),
  };
  server = createServer(createAdminHandler(TOKEN, stores));
  await new Promise<void>((done) => server.listen(0, "127.0.0.1", done));
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

afterAll(async () => {
  await new Promise((done) => server.close(done));
  await rm(dir, { recursive: true, force: true });
});

const call = (path: string, init: RequestInit = {}, token = TOKEN) =>
  fetch(`${base}${path}`, {
    ...init,
    headers: {
      "content-type": "application/json",
      origin: base,
      [TOKEN_HEADER]: token,
      ...init.headers,
    },
  });

interface Snapshot {
  content: { site: { profile: { nickname: string } }; pages: unknown[] };
  version: string;
}

describe("admin API", () => {
  it("refuses requests without the token", async () => {
    expect((await call("/content", {}, "wrong")).status).toBe(403);
  });

  it("refuses cross-origin writes", async () => {
    const res = await call("/content", {
      method: "PUT",
      body: "{}",
      headers: { origin: "https://evil.example" },
    });
    expect(res.status).toBe(403);
  });

  it("reads the content with a version", async () => {
    const body = (await (await call("/content")).json()) as Snapshot;
    expect(body.version).toMatch(/^[0-9a-f]{16}$/);
    expect(body.content.pages.length).toBeGreaterThan(0);
  });

  it("saves valid content and refuses a stale version", async () => {
    const { content, version } = (await (
      await call("/content")
    ).json()) as Snapshot;
    content.site.profile.nickname = "Saved";
    const put = (baseVersion: string) =>
      call("/content", {
        method: "PUT",
        body: JSON.stringify({ content, baseVersion }),
      });
    expect((await put(version)).status).toBe(200);
    expect(await readFile(join(dir, "portfolio.json"), "utf8")).toContain(
      '"nickname": "Saved"',
    );
    expect((await put(version)).status).toBe(409);
  });

  it("refuses invalid content with the problems listed", async () => {
    const { content, version } = (await (
      await call("/content")
    ).json()) as Snapshot;
    const res = await call("/content", {
      method: "PUT",
      body: JSON.stringify({
        content: { ...content, pages: [] },
        baseVersion: version,
      }),
    });
    expect(res.status).toBe(422);
    expect(((await res.json()) as { issues: string[] }).issues).toContain(
      "pages: Add at least one page",
    );
  });

  it("detects hand edits made after loading", async () => {
    const { content, version } = (await (
      await call("/content")
    ).json()) as Snapshot;
    const file = join(dir, "portfolio.json");
    await writeFile(file, `${await readFile(file, "utf8")} `);
    const res = await call("/content", {
      method: "PUT",
      body: JSON.stringify({ content, baseVersion: version }),
    });
    expect(res.status).toBe(409);
  });

  it("rejects non-JSON bodies and unknown routes", async () => {
    expect(
      (
        await call("/content", {
          method: "PUT",
          body: "x",
          headers: { "content-type": "text/plain" },
        })
      ).status,
    ).toBe(415);
    expect((await call("/nope")).status).toBe(404);
  });
});
