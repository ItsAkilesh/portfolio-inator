/**
 * File: services.test.ts
 * Purpose: Unit tests for the admin server's helpers: git status parsing and repository URLs,
 *          process output handling, image dimensions, history pruning and the icon catalog.
 * Author: Akilesh
 * Date: 2026-10-21
 */
// @vitest-environment node
import { mkdtemp, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { isValidCommitMessage } from "../../../src/lib/commitMessage";
import { parseStatus, repoUrlOf } from "./gitService";
import { HistoryStore, MAX_VERSIONS, stampOf } from "./historyStore";
import { iconCatalog, searchCatalog } from "./iconCatalog";
import { imageSize } from "./imageSize";
import { LineLog, MAX_LOG_LINES, runProcess } from "./processRunner";

describe("git helpers", () => {
  it("parses branch, tracking counts and splits content from other files", () => {
    const status = parseStatus([
      "## release/1.0...origin/release/1.0 [ahead 1, behind 3]",
      " M src/content/portfolio.json",
      "A  public/images/a.webp",
      "?? src/icons/library.json",
      " M README.md",
    ]);
    expect(status).toMatchObject({
      branch: "release/1.0",
      upstream: "origin/release/1.0",
      ahead: 1,
      behind: 3,
      otherChanges: 1,
    });
    expect(status.files.map((f) => f.status)).toEqual(["M", "A", "??"]);
    expect(parseStatus(["## main"])).toMatchObject({
      branch: "main",
      upstream: null,
      ahead: 0,
    });
  });
  it("turns remotes into browser URLs without credentials", () => {
    expect(repoUrlOf("git@github.com:me/site.git")).toBe(
      "https://github.com/me/site",
    );
    expect(repoUrlOf("https://user:token@github.com/me/site.git")).toBe(
      "https://github.com/me/site",
    );
    expect(repoUrlOf("file:///tmp/repo")).toBeNull();
  });
  it("accepts Conventional Commits messages only", () => {
    expect(isValidCommitMessage("docs(content): update experience")).toBe(true);
    expect(isValidCommitMessage("feat!: new layout")).toBe(true);
    expect(isValidCommitMessage("update")).toBe(false);
    expect(isValidCommitMessage("docs: x\n\n--author=evil")).toBe(false);
    expect(isValidCommitMessage(`docs: ${"x".repeat(150)}`)).toBe(false);
  });
});

describe("process output", () => {
  it("splits lines across chunks, strips colours and caps the log", () => {
    const seen: string[] = [];
    const log = new LineLog((line) => seen.push(line));
    log.push("\u001b[32mgre");
    log.push("en\u001b[0m\nnext");
    expect(log.finish()).toEqual(["green", "next"]);
    expect(seen).toEqual(["green", "next"]);
    const big = new LineLog();
    big.push(
      `${Array.from({ length: MAX_LOG_LINES + 5 }, (_, i) => `l${i}`).join("\n")}\n`,
    );
    expect(big.finish()).toHaveLength(MAX_LOG_LINES);
  });
  it("runs a command without a shell and reports its exit code", async () => {
    const result = await runProcess(
      process.execPath,
      ["-e", "console.log('hi; rm -rf /'); process.exit(3)"],
      { cwd: tmpdir(), timeoutMs: 10_000 },
    );
    expect(result).toMatchObject({
      code: 3,
      isTimedOut: false,
      lines: ["hi; rm -rf /"],
    });
  });
  it("stops a command at its timeout", async () => {
    const result = await runProcess(
      process.execPath,
      ["-e", "setTimeout(() => {}, 10000)"],
      { cwd: tmpdir(), timeoutMs: 200 },
    );
    expect(result.isTimedOut).toBe(true);
  });
  it("reports a missing command instead of throwing", async () => {
    const result = await runProcess("definitely-not-a-command-xyz", [], {
      cwd: tmpdir(),
      timeoutMs: 5000,
    });
    expect(result.code).toBeNull();
  });
});

describe("imageSize", () => {
  it("reads PNG, GIF, WebP (lossless) and JPEG headers", () => {
    const png = Buffer.alloc(24);
    Buffer.from("89504e470d0a1a0a", "hex").copy(png);
    png.writeUInt32BE(640, 16);
    png.writeUInt32BE(480, 20);
    expect(imageSize(png)).toEqual({ width: 640, height: 480 });
    const gif = Buffer.from([
      0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x10, 0x00, 0x20, 0x00,
    ]);
    expect(imageSize(gif)).toEqual({ width: 16, height: 32 });
    const webp = Buffer.alloc(30);
    webp.write("RIFF", 0, "ascii");
    webp.write("WEBPVP8L", 8, "ascii");
    webp.writeUInt32LE((99 & 0x3fff) | ((49 & 0x3fff) << 14), 21);
    expect(imageSize(webp)).toEqual({ width: 100, height: 50 });
    const jpeg = Buffer.from([
      0xff, 0xd8, 0xff, 0xe0, 0x00, 0x04, 0, 0, 0xff, 0xc0, 0x00, 0x11, 0x08,
      0x00, 0x78, 0x00, 0xa0, 0, 0,
    ]);
    expect(imageSize(jpeg)).toEqual({ width: 160, height: 120 });
  });
  it("returns null for anything else", () => {
    expect(imageSize(Buffer.from("not an image"))).toBeNull();
  });
});

describe("HistoryStore", () => {
  let dir = "";
  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), "history-"));
  });
  afterEach(async () => rm(dir, { recursive: true, force: true }));

  it("keeps the newest versions, newest first", async () => {
    const store = new HistoryStore(dir);
    for (let i = 0; i < MAX_VERSIONS + 3; i += 1)
      await store.snapshot(
        `{"n":${i}}`,
        i.toString(16).padStart(16, "0"),
        new Date(Date.UTC(2026, 0, 1, 0, 0, i)),
      );
    const list = await store.list();
    expect(list).toHaveLength(MAX_VERSIONS);
    expect(list[0]?.savedAt).toBe("2026-01-01T00:00:32.000Z");
    expect(await store.read(list[0]?.id ?? "")).toEqual({
      n: MAX_VERSIONS + 2,
    });
  });
  it("moves files to the trash under a time-stamped name", async () => {
    const file = join(dir, "x.webp");
    await writeFile(file, "x");
    const store = new HistoryStore(join(dir, "h"));
    await store.trash(file, "x.webp", new Date(Date.UTC(2026, 0, 2)));
    expect(await readdir(join(dir, "h", "trash"))).toEqual([
      `${stampOf(new Date(Date.UTC(2026, 0, 2)))}-x.webp`,
    ]);
  });
});

describe("icon catalog", () => {
  it("ranks exact, prefix, then substring matches and caps the count", async () => {
    const icons = await iconCatalog();
    expect(icons.length).toBeGreaterThan(3000);
    const hits = searchCatalog(icons, "GitHub", 5);
    expect(hits[0]?.slug).toBe("github");
    expect(hits).toHaveLength(5);
    expect(searchCatalog(icons, "  ")).toEqual([]);
    expect(searchCatalog(icons, "zzzzqqq")).toEqual([]);
  });
});
