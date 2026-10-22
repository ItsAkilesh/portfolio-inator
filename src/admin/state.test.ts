/**
 * File: state.test.ts
 * Purpose: Tests for admin state helpers: the draft stash in local storage, keyboard shortcuts,
 *          sections and focus paths, image optimisation decisions, icon keys and the preview
 *          bridge's message checks.
 * Author: Akilesh
 * Date: 2026-10-22
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import { asToAdmin, asToSite } from "../previewBridge/protocol";
import {
  AUTO_RESTORE_WINDOW_MS,
  clearStash,
  isWorthRestoring,
  readStash,
  writeStash,
} from "./draftStash";
import { shortcutFor } from "./effects";
import { parsePathId } from "./focus";
import { freeKey } from "./icons/useIconImport";
import {
  DEFAULT_SETTINGS,
  fittedSize,
  readSettings,
  saveSettings,
  shouldOptimise,
  webpName,
} from "./media/optimiseImage";
import { ADMIN_SECTIONS, sectionById, sectionForPath } from "./sections";
import { prefixLines, wrapSelection } from "./form/MarkdownInput";

afterEach(() => localStorage.clear());

describe("draft stash", () => {
  it("writes, reads and clears, keeping a reload marker when asked", () => {
    expect(readStash()).toBeNull();
    writeStash({ a: 1 }, "v1", "set", new Date("2026-01-01T00:00:00Z"));
    expect(readStash()).toEqual({
      draft: { a: 1 },
      baseVersion: "v1",
      savedAt: "2026-01-01T00:00:00.000Z",
      isAutoRestore: true,
      markedAt: "2026-01-01T00:00:00.000Z",
    });
    clearStash(true);
    expect(readStash()).not.toBeNull();
    clearStash();
    expect(readStash()).toBeNull();
  });
  it("keeps a restore mark through autosaves for a short window only", () => {
    const start = new Date("2026-01-01T00:00:00Z");
    writeStash({ a: 1 }, "v1", "set", start);
    writeStash({ a: 2 }, "v1", "keep", new Date(start.getTime() + 1000));
    expect(readStash()?.isAutoRestore).toBe(true);
    writeStash(
      { a: 3 },
      "v1",
      "keep",
      new Date(start.getTime() + AUTO_RESTORE_WINDOW_MS + 1),
    );
    expect(readStash()?.isAutoRestore).toBe(false);
    writeStash({ a: 1 }, "v1", "set", start);
    writeStash({ a: 1 }, "v1", "clear", start);
    expect(readStash()?.isAutoRestore).toBe(false);
  });
  it("ignores malformed data and compares with the loaded content", () => {
    localStorage.setItem("portfolio-admin.draft", "{not json");
    expect(readStash()).toBeNull();
    localStorage.setItem("portfolio-admin.draft", JSON.stringify({ draft: 1 }));
    expect(readStash()).toBeNull();
    const stash = {
      draft: { a: 1 },
      baseVersion: "v",
      savedAt: "",
      isAutoRestore: false,
    };
    expect(isWorthRestoring(stash, { a: 1 })).toBe(false);
    expect(isWorthRestoring(stash, { a: 2 })).toBe(true);
  });
});

describe("shortcuts", () => {
  const actions = {
    save: vi.fn(),
    undo: vi.fn(),
    redo: vi.fn(),
    search: vi.fn(),
  };
  const key = (
    k: string,
    mods: Partial<{
      ctrlKey: boolean;
      metaKey: boolean;
      shiftKey: boolean;
    }> = {},
  ) =>
    shortcutFor(
      { key: k, ctrlKey: false, metaKey: false, shiftKey: false, ...mods },
      actions,
    );
  it("maps Ctrl and Cmd combinations and ignores plain keys", () => {
    expect(key("s", { ctrlKey: true })).toBe(actions.save);
    expect(key("S", { metaKey: true })).toBe(actions.save);
    expect(key("z", { ctrlKey: true })).toBe(actions.undo);
    expect(key("Z", { ctrlKey: true, shiftKey: true })).toBe(actions.redo);
    expect(key("y", { ctrlKey: true })).toBe(actions.redo);
    expect(key("k", { metaKey: true })).toBe(actions.search);
    expect(key("s")).toBeNull();
    expect(key("q", { ctrlKey: true })).toBeNull();
  });
});

describe("sections and focus paths", () => {
  it("finds the most specific form section for a path", () => {
    expect(sectionForPath(["site", "seo", "title"])?.id).toBe("seo");
    expect(sectionForPath(["pages", 2, "blocks"])?.id).toBe("pages");
    expect(sectionForPath(["nowhere"])).toBeUndefined();
    expect(sectionById("missing")).toBe(ADMIN_SECTIONS[0]);
    expect(new Set(ADMIN_SECTIONS.map((s) => s.id)).size).toBe(
      ADMIN_SECTIONS.length,
    );
  });
  it("parses path ids back into paths", () => {
    expect(parsePathId("pages.1.blocks.0.title")).toEqual([
      "pages",
      1,
      "blocks",
      0,
      "title",
    ]);
    expect(parsePathId("")).toEqual([]);
  });
});

describe("image optimisation", () => {
  it("fits within the maximum width without upscaling", () => {
    expect(fittedSize(4000, 3000, 1600)).toEqual({ width: 1600, height: 1200 });
    expect(fittedSize(800, 600, 1600)).toEqual({ width: 800, height: 600 });
    expect(fittedSize(5000, 1, 100)).toEqual({ width: 100, height: 1 });
  });
  it("names the WebP output and skips GIFs and non-images", () => {
    expect(webpName("My Photo.PNG")).toBe("My Photo.webp");
    expect(webpName(".png")).toBe("image.webp");
    expect(shouldOptimise("image/png", DEFAULT_SETTINGS)).toBe(true);
    expect(shouldOptimise("image/gif", DEFAULT_SETTINGS)).toBe(false);
    expect(shouldOptimise("application/pdf", DEFAULT_SETTINGS)).toBe(false);
    expect(
      shouldOptimise("image/png", { ...DEFAULT_SETTINGS, isEnabled: false }),
    ).toBe(false);
  });
  it("stores settings and repairs invalid ones", () => {
    saveSettings({ isEnabled: false, maxWidth: 1200, quality: 0.7 });
    expect(readSettings()).toEqual({
      isEnabled: false,
      maxWidth: 1200,
      quality: 0.7,
    });
    localStorage.setItem(
      "portfolio-admin.optimise",
      JSON.stringify({ maxWidth: 3, quality: 9 }),
    );
    expect(readSettings()).toEqual(DEFAULT_SETTINGS);
  });
});

describe("icon keys", () => {
  it("cleans names and avoids taken keys", () => {
    expect(freeKey("Node.js", new Set())).toBe("nodejs");
    expect(freeKey("github", new Set(["github", "github2"]))).toBe("github3");
    expect(freeKey("---", new Set())).toBe("icon");
  });
});

describe("Markdown editing helpers", () => {
  it("wraps the selection or inserts a placeholder", () => {
    expect(
      wrapSelection("say hi now", { start: 4, end: 6 }, "**", "**", "x"),
    ).toBe("say **hi** now");
    expect(wrapSelection("ab", { start: 1, end: 1 }, "*", "*", "it")).toBe(
      "a*it*b",
    );
  });
  it("prefixes every selected line", () => {
    expect(prefixLines("one\ntwo\nthree", { start: 5, end: 9 }, "- ")).toBe(
      "one\n- two\n- three",
    );
    expect(prefixLines("solo", { start: 0, end: 0 }, "## ")).toBe("## solo");
  });
});

describe("preview bridge messages", () => {
  it("accepts well-formed messages only", () => {
    expect(
      asToSite({
        type: "portfolio-admin:reveal",
        pageId: "home",
        blockIndex: 2,
      }),
    ).not.toBeNull();
    expect(
      asToSite({
        type: "portfolio-admin:reveal",
        pageId: "home",
        blockIndex: "2",
      }),
    ).toBeNull();
    expect(asToSite({ type: "portfolio-admin:mode", mode: "blue" })).toBeNull();
    expect(
      asToSite({ type: "portfolio-admin:palette", palette: null }),
    ).not.toBeNull();
    expect(asToSite({ type: "other", isOn: true })).toBeNull();
    expect(asToSite("text")).toBeNull();
    expect(
      asToAdmin({ type: "portfolio-admin:edit", pageId: "x", blockIndex: 0 }),
    ).not.toBeNull();
    expect(
      asToAdmin({ type: "portfolio-admin:ready", pageId: null }),
    ).not.toBeNull();
    expect(
      asToAdmin({ type: "portfolio-admin:edit", pageId: 3, blockIndex: 0 }),
    ).toBeNull();
  });
});
