/**
 * File: Markdown.tsx
 * Purpose: Renders parsed Markdown (src/lib/markdown.ts) as React elements. No HTML strings are
 *          ever injected; links go through SmartLink, which opens external links safely.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import { createElement, useMemo, type ReactNode } from "react";
import { parseMarkdown, type Block, type Inline } from "../../lib/markdown";
import { SmartLink } from "./SmartLink";

const MAX_HEADING = 6;

function renderInline(nodes: readonly Inline[], key = "i"): ReactNode[] {
  return nodes.map((node, i) => {
    const k = `${key}-${i}`;
    switch (node.kind) {
      case "text":
        return node.text;
      case "code":
        return <code key={k}>{node.text}</code>;
      case "strong":
        return <strong key={k}>{renderInline(node.children, k)}</strong>;
      case "em":
        return <em key={k}>{renderInline(node.children, k)}</em>;
      case "link":
        return (
          <SmartLink key={k} href={node.href}>
            {renderInline(node.children, k)}
          </SmartLink>
        );
      case "break":
        return <br key={k} />;
      default:
        return null;
    }
  });
}

type TableBlock = Extract<Block, { kind: "table" }>;

function renderTable(block: TableBlock, key: string): ReactNode {
  return (
    <table key={key}>
      <thead>
        <tr>
          {block.head.map((cell, i) => (
            <th key={`${key}-h${i}`} scope="col">
              {renderInline(cell, `${key}-h${i}`)}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {block.rows.map((row, r) => (
          <tr key={`${key}-r${r}`}>
            {row.map((cell, c) => (
              <td key={`${key}-r${r}c${c}`}>
                {renderInline(cell, `${key}-r${r}c${c}`)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

type ListBlock = Extract<Block, { kind: "list" }>;
type QuoteBlock = Extract<Block, { kind: "quote" }>;
type HeadingBlock = Extract<Block, { kind: "heading" }>;

function renderHeading(
  block: HeadingBlock,
  key: string,
  headingOffset: number,
): ReactNode {
  return createElement(
    `h${Math.min(block.level + headingOffset, MAX_HEADING)}`,
    { key },
    renderInline(block.children, key),
  );
}

function renderList(block: ListBlock, key: string): ReactNode {
  const items = block.items.map((item, i) => (
    <li key={`${key}-${i}`}>{renderInline(item, `${key}-${i}`)}</li>
  ));
  return block.isOrdered ? (
    <ol key={key}>{items}</ol>
  ) : (
    <ul key={key}>{items}</ul>
  );
}

function renderQuote(
  block: QuoteBlock,
  key: string,
  headingOffset: number,
): ReactNode {
  return (
    <blockquote key={key}>
      {block.children.map((child, i) =>
        renderBlock(child, `${key}-${i}`, headingOffset),
      )}
    </blockquote>
  );
}

function renderBlock(
  block: Block,
  key: string,
  headingOffset: number,
): ReactNode {
  switch (block.kind) {
    case "heading":
      return renderHeading(block, key, headingOffset);
    case "paragraph":
      return <p key={key}>{renderInline(block.children, key)}</p>;
    case "list":
      return renderList(block, key);
    case "quote":
      return renderQuote(block, key, headingOffset);
    case "code":
      return (
        <pre key={key}>
          <code>{block.text}</code>
        </pre>
      );
    case "table":
      return renderTable(block, key);
    case "rule":
      return <hr key={key} />;
    default:
      return null;
  }
}

interface MarkdownProps {
  readonly source: string;
  /** Added to heading levels, e.g. 1 makes "# Title" an <h2> inside a page section. */
  readonly headingOffset?: number;
  readonly className?: string;
}

export function Markdown({
  source,
  headingOffset = 0,
  className,
}: MarkdownProps) {
  const blocks = useMemo(() => parseMarkdown(source), [source]);
  return (
    <div className={className}>
      {blocks.map((block, i) => renderBlock(block, `b${i}`, headingOffset))}
    </div>
  );
}
