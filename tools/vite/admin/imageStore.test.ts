/**
 * File: imageStore.test.ts
 * Purpose: Tests for image upload naming, signature checks and storage.
 * Author: Akilesh
 * Date: 2026-10-21
 */
// @vitest-environment node
import { mkdtemp, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  ImageStore,
  MAX_IMAGE_BYTES,
  checkImage,
  safeFileName,
  uniqueName,
} from "./imageStore";

const PNG = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0,
]);

describe("safeFileName", () => {
  it("normalises names", () => {
    expect(safeFileName("My Logo (1).PNG")).toBe("my-logo-1.png");
  });
  it("strips any directory part", () => {
    expect(safeFileName("../../etc/passwd.png")).toBe("passwd.png");
    expect(safeFileName("..\\..\\x.webp")).toBe("x.webp");
  });
  it("rejects unsupported or empty names", () => {
    expect(safeFileName("vector.svg")).toBeNull();
    expect(safeFileName("script.js")).toBeNull();
    expect(safeFileName("---.png")).toBeNull();
  });
});

describe("uniqueName", () => {
  it("adds a counter when taken", () => {
    expect(uniqueName("a.png", new Set())).toBe("a.png");
    expect(uniqueName("a.png", new Set(["a.png", "a-2.png"]))).toBe("a-3.png");
  });
});

describe("checkImage", () => {
  it("accepts a matching signature", () => {
    expect(checkImage("a.png", PNG)).toBeNull();
  });
  it("rejects mismatched, empty and oversized files", () => {
    expect(checkImage("a.jpg", PNG)).toMatch(/do not match/);
    expect(checkImage("a.png", Buffer.alloc(0))).toMatch(/empty/);
    expect(
      checkImage("a.png", Buffer.concat([PNG, Buffer.alloc(MAX_IMAGE_BYTES)])),
    ).toMatch(/5 MB/);
  });
});

describe("ImageStore", () => {
  let dir = "";
  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), "images-"));
  });
  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it("stores uploads under a safe unique name", async () => {
    const store = new ImageStore(dir);
    const first = await store.save("Team Photo.png", PNG.toString("base64"));
    const second = await store.save("team photo.png", PNG.toString("base64"));
    expect(first).toEqual({ ok: true, fileName: "team-photo.png" });
    expect(second).toEqual({ ok: true, fileName: "team-photo-2.png" });
    expect(await store.list()).toEqual(["team-photo-2.png", "team-photo.png"]);
  });

  it("refuses files that are not images", async () => {
    const store = new ImageStore(dir);
    const result = await store.save(
      "x.png",
      Buffer.from("<script>").toString("base64"),
    );
    expect(result.ok).toBe(false);
    expect(await readdir(dir)).toEqual([]);
  });
});
