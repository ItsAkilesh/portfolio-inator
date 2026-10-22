/**
 * File: Preview.tsx
 * Purpose: Live site preview beside the editor. It shows the saved content: saving rewrites
 *          portfolio.json and the dev server reloads the frame.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import { useState } from "react";
import styles from "./admin.module.css";

interface PreviewProps {
  readonly pages: readonly { readonly path: string; readonly label: string }[];
}

export function Preview({ pages }: PreviewProps) {
  const [path, setPath] = useState(pages[0]?.path ?? "/");
  return (
    <section className={styles.preview} aria-label="Preview">
      <div className={styles.previewBar}>
        <span>Preview (saved version)</span>
        <select
          className={styles.select}
          value={path}
          aria-label="Preview page"
          onChange={(e) => setPath(e.target.value)}
        >
          {pages.map((page) => (
            <option key={page.path} value={page.path}>
              {page.label}
            </option>
          ))}
        </select>
      </div>
      <iframe className={styles.frame} title="Site preview" src={path} />
    </section>
  );
}
