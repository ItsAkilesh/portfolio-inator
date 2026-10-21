/**
 * File: PageRenderer.tsx
 * Purpose: Renders any configured page as its ordered list of blocks.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import { Suspense } from "react";
import type { PageConfig } from "../types/portfolio";
import { BlockView } from "./BlockView";

export function PageRenderer({ page }: { readonly page: PageConfig }) {
  return (
    <div className="page" data-page={page.id}>
      {page.blocks.map((block, index) => (
        /* Each block suspends on its own, so a code-split block never blanks the page. */
        <Suspense key={`${page.id}-${index}-${block.type}`} fallback={null}>
          <BlockView block={block} />
        </Suspense>
      ))}
    </div>
  );
}
