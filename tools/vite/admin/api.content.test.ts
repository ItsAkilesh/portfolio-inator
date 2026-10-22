/**
 * File: api.content.test.ts
 * Purpose: Admin API over real HTTP: access rules, content reads and saves with optimistic
 *          versioning and validation, and the local history of saved versions.
 * Author: Akilesh
 * Date: 2026-10-21
 */
// @vitest-environment node
import { readFile, writeFile } from "node:fs/promises";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { startHarness, type Harness } from "./testHarness";

let h: Harness;
beforeAll(async () => {
  h = await startHarness();
});
afterAll(async () => h.close());

interface Snapshot {
  content: { site: { profile: { nickname: string } }; pages: unknown[] };
  version: string;
}

const put = (content: unknown, baseVersion: string) =>
  h.call("/content", {
    method: "PUT",
    body: JSON.stringify({ content, baseVersion }),
  });

describe("access", () => {
  it("refuses requests without the token", async () => {
    expect((await h.call("/content", {}, "wrong")).status).toBe(403);
  });
  it("refuses cross-origin writes", async () => {
    const res = await h.call("/content", {
      method: "PUT",
      body: "{}",
      headers: { origin: "https://evil.example" },
    });
    expect(res.status).toBe(403);
  });
  it("rejects non-JSON bodies, bad shapes and unknown routes", async () => {
    expect(
      (
        await h.call("/content", {
          method: "PUT",
          body: "x",
          headers: { "content-type": "text/plain" },
        })
      ).status,
    ).toBe(415);
    expect(
      (await h.call("/content", { method: "PUT", body: "{}" })).status,
    ).toBe(400);
    expect((await h.call("/nope")).status).toBe(404);
  });
});

describe("content", () => {
  it("reads the content with a version", async () => {
    const body = await h.json<Snapshot>("/content");
    expect(body.version).toMatch(/^[0-9a-f]{16}$/);
    expect(body.content.pages.length).toBeGreaterThan(0);
  });

  it("saves valid content, keeps the previous file in history and refuses a stale version", async () => {
    const { content, version } = await h.json<Snapshot>("/content");
    content.site.profile.nickname = "Saved";
    expect((await put(content, version)).status).toBe(200);
    expect(await readFile(h.paths.contentFile, "utf8")).toContain(
      '"nickname": "Saved"',
    );
    expect((await put(content, version)).status).toBe(409);
    const { versions } = await h.json<{
      versions: { id: string; version: string }[];
    }>("/history");
    expect(versions[0]?.version).toBe(version);
    const old = await h.json<{ content: Snapshot["content"] }>(
      `/history/item?id=${versions[0]?.id ?? ""}`,
    );
    expect(old.content.site.profile.nickname).not.toBe("Saved");
  });

  it("does not add history for a save that changes nothing", async () => {
    const before = (await h.json<{ versions: unknown[] }>("/history")).versions
      .length;
    const { content, version } = await h.json<Snapshot>("/content");
    expect((await put(content, version)).status).toBe(200);
    expect(
      (await h.json<{ versions: unknown[] }>("/history")).versions,
    ).toHaveLength(before);
  });

  it("refuses invalid content with the problems listed", async () => {
    const { content, version } = await h.json<Snapshot>("/content");
    const res = await put({ ...content, pages: [] }, version);
    expect(res.status).toBe(422);
    expect(((await res.json()) as { issues: string[] }).issues).toContain(
      "pages: Add at least one page",
    );
  });

  it("detects hand edits made after loading", async () => {
    const { content, version } = await h.json<Snapshot>("/content");
    await writeFile(
      h.paths.contentFile,
      `${await readFile(h.paths.contentFile, "utf8")} `,
    );
    expect((await put(content, version)).status).toBe(409);
  });

  it("rejects unknown or malformed history ids", async () => {
    expect((await h.call("/history/item?id=../../etc/passwd")).status).toBe(
      404,
    );
    expect(
      (
        await h.call(
          "/history/item?id=20990101T000000000Z-0123456789abcdef.json",
        )
      ).status,
    ).toBe(404);
  });
});
