/**
 * File: TextBlock.tsx
 * Purpose: "text" block: an optional heading and plain paragraphs.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import type { BlockOf } from "../types/portfolio";
import styles from "./blocks.module.css";

export default function TextBlock({
  block,
}: {
  readonly block: BlockOf<"text">;
}) {
  return (
    <div className={styles.prose}>
      {block.heading && <h2 className="section-title">{block.heading}</h2>}
      {block.paragraphs.map((paragraph, index) => (
        <p key={`${index}-${paragraph.slice(0, 16)}`}>{paragraph}</p>
      ))}
    </div>
  );
}
