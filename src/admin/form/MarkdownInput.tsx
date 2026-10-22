/**
 * File: MarkdownInput.tsx
 * Purpose: Editor for Markdown fields: a text area with buttons that wrap the selection (bold,
 *          italic, link, code) or prefix its lines (heading, list), and a live preview rendered with
 *          the same component the site uses.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import { useRef, useState } from "react";
import { Markdown } from "../../components/ui/Markdown";
import styles from "./form.module.css";
import markdownStyles from "./markdown.module.css";

interface MarkdownInputProps {
  readonly id: string;
  readonly value: string;
  readonly onChange: (value: string) => void;
}

interface Selection {
  readonly start: number;
  readonly end: number;
}

/** Wraps the selected text, e.g. "**" + text + "**"; an empty selection gets placeholder text. */
export function wrapSelection(
  text: string,
  sel: Selection,
  before: string,
  after: string,
  placeholder: string,
): string {
  const chosen = text.slice(sel.start, sel.end) || placeholder;
  return `${text.slice(0, sel.start)}${before}${chosen}${after}${text.slice(sel.end)}`;
}

/** Adds `prefix` to every line the selection touches. */
export function prefixLines(
  text: string,
  sel: Selection,
  prefix: string,
): string {
  const lineStart =
    sel.start === 0 ? 0 : text.lastIndexOf("\n", sel.start - 1) + 1;
  const block = text.slice(lineStart, sel.end);
  return `${text.slice(0, lineStart)}${block
    .split("\n")
    .map((line) => `${prefix}${line}`)
    .join("\n")}${text.slice(sel.end)}`;
}

const TOOLS = [
  {
    label: "Bold",
    apply: (t: string, s: Selection) =>
      wrapSelection(t, s, "**", "**", "bold text"),
  },
  {
    label: "Italic",
    apply: (t: string, s: Selection) =>
      wrapSelection(t, s, "*", "*", "italic text"),
  },
  {
    label: "Link",
    apply: (t: string, s: Selection) =>
      wrapSelection(t, s, "[", "](https://)", "link text"),
  },
  {
    label: "Code",
    apply: (t: string, s: Selection) => wrapSelection(t, s, "`", "`", "code"),
  },
  {
    label: "Heading",
    apply: (t: string, s: Selection) => prefixLines(t, s, "## "),
  },
  {
    label: "List",
    apply: (t: string, s: Selection) => prefixLines(t, s, "- "),
  },
] as const;

/** Rows shown by the text area. */
const EDITOR_ROWS = 8;

type Apply = (text: string, sel: Selection) => string;

interface ToolbarProps {
  readonly isPreview: boolean;
  readonly onRun: (apply: Apply) => void;
  readonly onTogglePreview: () => void;
}

function MarkdownToolbar({ isPreview, onRun, onTogglePreview }: ToolbarProps) {
  return (
    <div
      className={markdownStyles.markdownBar}
      role="toolbar"
      aria-label="Formatting"
    >
      {TOOLS.map((tool) => (
        <button
          key={tool.label}
          type="button"
          className={markdownStyles.toolButton}
          disabled={isPreview}
          onClick={() => onRun(tool.apply)}
        >
          {tool.label}
        </button>
      ))}
      <button
        type="button"
        className={markdownStyles.toolButton}
        aria-pressed={isPreview}
        onClick={onTogglePreview}
      >
        Preview
      </button>
    </div>
  );
}

/** The text area's selection, or the end of the text when it is not mounted. */
function selectionOf(el: HTMLTextAreaElement | null, value: string): Selection {
  return el
    ? { start: el.selectionStart, end: el.selectionEnd }
    : { start: value.length, end: value.length };
}

export function MarkdownInput({ id, value, onChange }: MarkdownInputProps) {
  const area = useRef<HTMLTextAreaElement>(null);
  const [isPreview, setIsPreview] = useState(false);
  const run = (apply: Apply) => {
    const el = area.current;
    onChange(apply(value, selectionOf(el, value)));
    el?.focus();
  };
  return (
    <div className={markdownStyles.markdown}>
      <MarkdownToolbar
        isPreview={isPreview}
        onRun={run}
        onTogglePreview={() => setIsPreview((p) => !p)}
      />
      {isPreview ? (
        <Markdown
          source={value}
          headingOffset={1}
          className={markdownStyles.markdownPreview}
        />
      ) : (
        <textarea
          id={id}
          ref={area}
          className={styles.input}
          rows={EDITOR_ROWS}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
}
