/**
 * File: markdown.ts
 * Purpose: A small, safe Markdown parser for text blocks and the admin guides. It produces a tree
 *          (no HTML strings), so nothing in the text can inject markup: raw HTML stays literal text
 *          and links are kept only for safe schemes. Supports headings, paragraphs, lists, block
 *          quotes, fenced code, rules, and inline code, bold, italic and links.
 * Author: Akilesh
 * Date: 2026-10-21
 */

export type Inline =
  | { readonly kind: "text"; readonly text: string }
  | { readonly kind: "code"; readonly text: string }
  | { readonly kind: "strong"; readonly children: readonly Inline[] }
  | { readonly kind: "em"; readonly children: readonly Inline[] }
  | {
      readonly kind: "link";
      readonly href: string;
      readonly children: readonly Inline[];
    }
  | { readonly kind: "break" };

export type Block =
  | {
      readonly kind: "heading";
      readonly level: 1 | 2 | 3 | 4;
      readonly children: readonly Inline[];
    }
  | { readonly kind: "paragraph"; readonly children: readonly Inline[] }
  | {
      readonly kind: "list";
      readonly isOrdered: boolean;
      readonly items: readonly (readonly Inline[])[];
    }
  | { readonly kind: "quote"; readonly children: readonly Block[] }
  | { readonly kind: "code"; readonly text: string }
  | {
      readonly kind: "table";
      readonly head: readonly (readonly Inline[])[];
      readonly rows: readonly (readonly (readonly Inline[])[])[];
    }
  | { readonly kind: "rule" };

const SAFE_HREF = /^(https?:\/\/|mailto:|tel:|\/|#)/i;
const HEADING = /^(#{1,4})\s+(.*)$/;
const BULLET = /^\s*[-*+]\s+(.*)$/;
const NUMBERED = /^\s*\d+[.)]\s+(.*)$/;
const RULE = /^\s*([-*_])(\s*\1){2,}\s*$/;
const FENCE = /^\s*```/;
const TABLE_ROW = /^\s*\|.*\|\s*$/;
const TABLE_RULE = /^\s*\|(\s*:?-+:?\s*\|)+\s*$/;
/* Order matters: code first (its content is literal), then links, then emphasis. */
const INLINE =
  /`([^`]+)`|\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*|__([^_]+)__|\*([^*]+)\*|_([^_]+)_/;

export const isSafeHref = (href: string): boolean =>
  SAFE_HREF.test(href.trim());

export function parseInline(text: string): Inline[] {
  const out: Inline[] = [];
  let rest = text;
  while (rest) {
    const match = INLINE.exec(rest);
    if (!match) {
      pushText(out, rest);
      break;
    }
    pushText(out, rest.slice(0, match.index));
    out.push(inlineFor(match));
    rest = rest.slice(match.index + match[0].length);
  }
  return out;
}

function pushText(out: Inline[], text: string): void {
  if (!text) return;
  const parts = text.split("\n");
  parts.forEach((part, i) => {
    if (i > 0) out.push({ kind: "break" });
    if (part) out.push({ kind: "text", text: part });
  });
}

function inlineFor(m: RegExpExecArray): Inline {
  if (m[1] !== undefined) return { kind: "code", text: m[1] };
  if (m[2] !== undefined && m[3] !== undefined)
    return isSafeHref(m[3])
      ? { kind: "link", href: m[3], children: parseInline(m[2]) }
      : { kind: "text", text: m[0] };
  const strong = m[4] ?? m[5];
  if (strong !== undefined)
    return { kind: "strong", children: parseInline(strong) };
  return { kind: "em", children: parseInline(m[6] ?? m[7] ?? "") };
}

interface Cursor {
  readonly lines: readonly string[];
  index: number;
}

function takeWhile(cursor: Cursor, test: (line: string) => boolean): string[] {
  const taken: string[] = [];
  while (
    cursor.index < cursor.lines.length &&
    test(cursor.lines[cursor.index] ?? "")
  ) {
    taken.push(cursor.lines[cursor.index] ?? "");
    cursor.index += 1;
  }
  return taken;
}

function codeBlock(cursor: Cursor): Block {
  cursor.index += 1;
  const body = takeWhile(cursor, (line) => !FENCE.test(line));
  cursor.index += 1;
  return { kind: "code", text: body.join("\n") };
}

function listBlock(cursor: Cursor, isOrdered: boolean): Block {
  const pattern = isOrdered ? NUMBERED : BULLET;
  const lines = takeWhile(cursor, (line) => pattern.test(line));
  return {
    kind: "list",
    isOrdered,
    items: lines.map((line) => parseInline(pattern.exec(line)?.[1] ?? "")),
  };
}

const cells = (line: string): Inline[][] =>
  line
    .trim()
    .replace(/^\||\|$/g, "")
    .split("|")
    .map((cell) => parseInline(cell.trim()));

function tableBlock(cursor: Cursor): Block {
  const head = cells(cursor.lines[cursor.index] ?? "");
  cursor.index += 2;
  const rows = takeWhile(cursor, (line) => TABLE_ROW.test(line)).map(cells);
  return { kind: "table", head, rows };
}

const isTableStart = (cursor: Cursor): boolean =>
  TABLE_ROW.test(cursor.lines[cursor.index] ?? "") &&
  TABLE_RULE.test(cursor.lines[cursor.index + 1] ?? "");

const startsBlock = (line: string): boolean =>
  !line.trim() ||
  HEADING.test(line) ||
  BULLET.test(line) ||
  NUMBERED.test(line) ||
  FENCE.test(line) ||
  line.startsWith(">") ||
  RULE.test(line);

function nextBlock(cursor: Cursor): Block | null {
  const line = cursor.lines[cursor.index] ?? "";
  if (!line.trim()) {
    cursor.index += 1;
    return null;
  }
  if (FENCE.test(line)) return codeBlock(cursor);
  if (isTableStart(cursor)) return tableBlock(cursor);
  if (RULE.test(line)) {
    cursor.index += 1;
    return { kind: "rule" };
  }
  const heading = HEADING.exec(line);
  if (heading) {
    cursor.index += 1;
    return {
      kind: "heading",
      level: heading[1]?.length as 1 | 2 | 3 | 4,
      children: parseInline(heading[2] ?? ""),
    };
  }
  if (BULLET.test(line)) return listBlock(cursor, false);
  if (NUMBERED.test(line)) return listBlock(cursor, true);
  if (line.startsWith(">")) {
    const quoted = takeWhile(cursor, (l) => l.startsWith(">")).map((l) =>
      l.replace(/^>\s?/, ""),
    );
    return { kind: "quote", children: parseMarkdown(quoted.join("\n")) };
  }
  const first = cursor.lines[cursor.index] ?? "";
  cursor.index += 1;
  const rest = takeWhile(cursor, (l) => !startsBlock(l));
  return {
    kind: "paragraph",
    children: parseInline([first, ...rest].join("\n")),
  };
}

export function parseMarkdown(source: string): Block[] {
  const cursor: Cursor = {
    lines: source.replace(/\r\n?/g, "\n").split("\n"),
    index: 0,
  };
  const blocks: Block[] = [];
  while (cursor.index < cursor.lines.length) {
    const block = nextBlock(cursor);
    if (block) blocks.push(block);
  }
  return blocks;
}

/** Plain text of inline content, e.g. for heading ids. */
export const inlineText = (nodes: readonly Inline[]): string =>
  nodes
    .map((n) =>
      n.kind === "text" || n.kind === "code"
        ? n.text
        : n.kind === "break"
          ? " "
          : "children" in n
            ? inlineText(n.children)
            : "",
    )
    .join("");
