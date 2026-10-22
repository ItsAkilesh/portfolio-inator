/**
 * File: tools.test.ts
 * Purpose: Tests for the pure logic behind admin tools: search, diff and per-change undo, path
 *          descriptions and SEO checks.
 * Author: Akilesh
 * Date: 2026-10-22
 */
import { describe, expect, it } from "vitest";
import rawContent from "../content/portfolio.json";
import { portfolioSchema } from "../content/schema";
import { describePath } from "./describePath";
import { diffContent, previewValue } from "./diff/diff";
import { revertEdit } from "./diff/revert";
import { setIn } from "./paths";
import { buildIndex, searchIndex } from "./search/searchIndex";
import { checkSeo, clipTo, hostOf, previewImageUrl } from "./seo/seoChecks";

type Content = typeof rawContent;
const content: Content = rawContent;

describe("search", () => {
  const index = buildIndex(portfolioSchema, content);
  it("finds sections first, then fields with all words, and skips $schema", () => {
    expect(searchIndex(index, "")[0]?.kind).toBe("section");
    expect(searchIndex(index, "theme")[0]).toMatchObject({
      kind: "section",
      sectionId: "theme",
    });
    const hit = searchIndex(index, "carnegie mellon")[0];
    expect(hit?.kind).toBe("field");
    expect(hit?.path?.[0]).toBe("pages");
    expect(index.some((e) => e.path?.[0] === "$schema")).toBe(false);
    expect(searchIndex(index, "zzqqxx")).toEqual([]);
  });
});

describe("diff and undo of one change", () => {
  it("lists changed, added and removed values and reverts each", () => {
    const after = setIn(
      setIn(content, ["site", "profile", "nickname"], "New"),
      ["skills"],
      content.skills.slice(1),
    );
    const changes = diffContent(content, after);
    const nick = changes.find(
      (c) =>
        c.kind === "changed" && c.path.join(".") === "site.profile.nickname",
    );
    expect(nick?.before).toBe(content.site.profile.nickname);
    const reverted = changes.map((c) => revertEdit(after, c));
    expect(reverted.every((e) => e !== null)).toBe(true);
    if (!nick) throw new Error("nickname change not found");
    const edit = revertEdit(after, nick);
    expect(edit).toEqual({
      path: ["site", "profile", "nickname"],
      value: content.site.profile.nickname,
    });
  });
  it("puts a removed list item back and removes an added one", () => {
    const after = { list: ["a", "c"] };
    const changes = diffContent({ list: ["a", "b", "c"] }, after);
    expect(changes.map((c) => c.kind)).toEqual(["changed", "removed"]);
    expect(
      revertEdit(
        { list: ["a", "b", "c", "d"] },
        { path: ["list", 3], kind: "added", before: undefined, after: "d" },
      ),
    ).toEqual({ path: ["list"], value: ["a", "b", "c"] });
    expect(
      revertEdit(
        { r: { a: 1 } },
        { path: ["r", "b"], kind: "removed", before: 2, after: undefined },
      ),
    ).toEqual({ path: ["r"], value: { a: 1, b: 2 } });
  });
  it("finds nothing between equal values and previews long values", () => {
    expect(diffContent(content, structuredClone(content))).toEqual([]);
    expect(previewValue("x".repeat(100))).toHaveLength(80);
    expect(previewValue({ a: 1 })).toBe('{"a":1}');
  });
});

describe("describePath", () => {
  it("uses titles and item summaries", () => {
    expect(describePath(["pages", 0, "label"], content)).toBe(
      `Pages › ${content.pages[0]?.label} › Name`,
    );
    expect(describePath([], content)).toBe("Everything");
  });
});

describe("SEO checks", () => {
  const seo = content.site.seo;
  it("flags lengths, address form, language, image description and handle", () => {
    const findings = checkSeo({
      ...seo,
      title: "Hi",
      siteUrl: "http://x.dev",
      language: "english",
      social: {
        ...seo.social,
        image: "a.png",
        imageAlt: "",
        twitterHandle: "@me",
      },
    });
    const fields = findings.map((f) => f.field);
    expect(fields).toEqual(
      expect.arrayContaining([
        "title",
        "siteUrl",
        "language",
        "social.imageAlt",
        "social.twitterHandle",
      ]),
    );
    expect(
      checkSeo({ ...seo, title: "" }).find((f) => f.field === "title")
        ?.severity,
    ).toBe("error");
  });
  it("formats previews", () => {
    expect(clipTo("abcdef", 4)).toBe("abc…");
    expect(previewImageUrl("icons/me.png")).toBe("/icons/me.png");
    expect(previewImageUrl("https://x.dev/a.png")).toBe("https://x.dev/a.png");
    expect(hostOf("https://me.github.io/")).toBe("me.github.io");
  });
});
