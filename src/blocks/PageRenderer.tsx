/**
 * File: PageRenderer.tsx
 * Purpose: Renders any configured page as its ordered list of blocks. Each block sits in a slot that
 *          adds no box (display: contents) but carries its index, so the admin preview can find it.
 * Author: Akilesh
 * Date: 2026-10-21 (updated 2026-10-22)
 */
import { Suspense } from "react";
import type { PageConfig } from "../types/portfolio";
import { BlockView } from "./BlockView";

export function PageRenderer({ page }: { readonly page: PageConfig }) {
  return (
    <div className="page" data-page={page.id}>
      {page.blocks.map((block, index) => (
        /* Each block suspends on its own, so a code-split block never blanks the page. */
        <div
          key={`${page.id}-${index}-${block.type}`}
          className="block-slot"
          data-block-index={index}
        >
          <Suspense fallback={null}>
            <BlockView block={block} />
          </Suspense>
        </div>
      ))}
    </div>
  );
}
