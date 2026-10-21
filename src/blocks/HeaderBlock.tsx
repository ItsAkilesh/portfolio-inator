/**
 * File: HeaderBlock.tsx
 * Purpose: "header" block: the accent title band, with the portrait and research cards as options.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import { PageBand } from "../components/layout/PageBand";
import { portrait, profile } from "../portfolio";
import { ResearchCards } from "../sections/ResearchCards";
import type { BlockOf } from "../types/portfolio";

export default function HeaderBlock({
  block,
}: {
  readonly block: BlockOf<"header">;
}) {
  const image = block.showPortrait
    ? { src: portrait, alt: `Portrait of ${profile.title}` }
    : undefined;
  return (
    <PageBand title={block.title} description={block.description} image={image}>
      {block.showResearchCards && <ResearchCards className="enter" />}
    </PageBand>
  );
}
