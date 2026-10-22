/**
 * File: ImageBlock.tsx
 * Purpose: "image" block: one image from public/images with an optional caption.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import { imageUrl } from "../lib/assets";
import type { BlockOf } from "../types/portfolio";
import styles from "./blocks.module.css";

export default function ImageBlock({
  block,
}: {
  readonly block: BlockOf<"image">;
}) {
  return (
    <figure className={styles.figure}>
      <img src={imageUrl(block.src)} alt={block.alt} loading="lazy" />
      {block.caption && (
        <figcaption className="muted">{block.caption}</figcaption>
      )}
    </figure>
  );
}
