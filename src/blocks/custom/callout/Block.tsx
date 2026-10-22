/**
 * File: Block.tsx
 * Purpose: Renders the example "callout" custom block: a title and Markdown text in a panel.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import { Markdown } from "../../../components/ui/Markdown";
import type { BlockOf } from "../../../types/portfolio";
import styles from "./callout.module.css";

export default function CalloutBlock({
  block,
}: {
  readonly block: BlockOf<"callout">;
}) {
  return (
    <div className="wrap">
      <aside className={styles.callout} data-tone={block.tone}>
        <h2 className={styles.title}>{block.title}</h2>
        <Markdown source={block.body} headingOffset={2} />
      </aside>
    </div>
  );
}
