/**
 * File: TextBlock.tsx
 * Purpose: "text" block: an optional heading and Markdown text.
 * Author: Akilesh
 * Date: 2026-10-21 (updated 2026-10-22)
 */
import { Markdown } from "../components/ui/Markdown";
import type { BlockOf } from "../types/portfolio";
import styles from "./blocks.module.css";

/* The block heading is an <h2>, so Markdown "#" headings start at <h3>. */
const HEADING_OFFSET = 2;

export default function TextBlock({
  block,
}: {
  readonly block: BlockOf<"text">;
}) {
  return (
    <div className={styles.prose}>
      {block.heading && <h2 className="section-title">{block.heading}</h2>}
      <Markdown source={block.body} headingOffset={HEADING_OFFSET} />
    </div>
  );
}
