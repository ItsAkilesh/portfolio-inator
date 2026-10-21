/**
 * File: blocks.ts
 * Purpose: Test helper: every block of one type across all configured pages.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import { pages } from "../portfolio";
import type { BlockConfig, BlockOf } from "../types/portfolio";

export function blocksOf<T extends BlockConfig["type"]>(type: T): BlockOf<T>[] {
  return pages
    .flatMap((page) => page.blocks)
    .filter((block): block is BlockOf<T> => block.type === type);
}
