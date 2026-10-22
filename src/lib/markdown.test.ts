/**
 * File: markdown.test.ts
 * Purpose: Tests for the safe Markdown parser: blocks, inline formatting, tables and link safety.
 * Author: Akilesh
 * Date: 2026-10-22
 */
import { describe, expect, it } from "vitest";
import { inlineText, isSafeHref, parseInline, parseMarkdown } from "./markdown";

describe("parseInline", () => {
  it("reads code, links, bold and italic, with code taken literally", () => {
    expect(parseInline("a `**x**` b")).toEqual([
      { kind: "text", text: "a " },
      { kind: "code", text: "**x**" },
      { kind: "text", text: " b" },
    ]);
    expect(
      parseInline("**bold** and *it* and __b2__ and _i2_").map((n) => n.kind),
    ).toEqual(["strong", "text", "em", "text", "strong", "text", "em"]);
    expect(parseInline("[site](https://x.dev)")).toEqual([
      {
        kind: "link",
        href: "https://x.dev",
        children: [{ kind: "text", text: "site" }],
      },
    ]);
  });
  it("keeps unsafe links as plain text", () => {
    expect(parseInline("[x](javascript:alert(1))")[0]).toMatchObject({
      kind: "text",
    });
    expect(isSafeHref("data:text/html,x")).toBe(false);
    expect(isSafeHref("/home")).toBe(true);
    expect(isSafeHref("mailto:a@b.c")).toBe(true);
  });
  it("turns single newlines into line breaks and leaves HTML as text", () => {
    expect(parseInline("a\nb").map((n) => n.kind)).toEqual([
      "text",
      "break",
      "text",
    ]);
    expect(parseInline("<script>x</script>")).toEqual([
      { kind: "text", text: "<script>x</script>" },
    ]);
  });
});

describe("parseMarkdown", () => {
  it("parses headings, paragraphs, lists, quotes, code and rules", () => {
    const blocks = parseMarkdown(
      "# Title\n\nPara one\ncontinues\n\n- a\n- b\n\n1. x\n2) y\n\n> quoted\n\n```\ncode **raw**\n```\n\n---",
    );
    expect(blocks.map((b) => b.kind)).toEqual([
      "heading",
      "paragraph",
      "list",
      "list",
      "quote",
      "code",
      "rule",
    ]);
    expect(blocks[2]).toMatchObject({ kind: "list", isOrdered: false });
    expect(blocks[3]).toMatchObject({ kind: "list", isOrdered: true });
    expect(blocks[5]).toEqual({ kind: "code", text: "code **raw**" });
  });
  it("parses tables with a header row", () => {
    const [table] = parseMarkdown(
      "| Key | Action |\n| --- | --- |\n| Ctrl+S | Save |",
    );
    expect(table?.kind).toBe("table");
    if (table?.kind === "table") {
      expect(table.head.map(inlineText)).toEqual(["Key", "Action"]);
      expect(table.rows[0]?.map(inlineText)).toEqual(["Ctrl+S", "Save"]);
    }
  });
  it("handles Windows line endings and empty input", () => {
    expect(parseMarkdown("a\r\n\r\nb")).toHaveLength(2);
    expect(parseMarkdown("")).toEqual([]);
  });
});
