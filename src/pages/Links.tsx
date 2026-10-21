/**
 * File: Links.tsx
 * Purpose: Link-in-bio page: every profile from config as a tile grid; internal routes are emphasized.
 * Author: Akilesh
 * Date: 2026-10-20
 */
import { PageBand } from "../components/layout/PageBand";
import { LinkGrid } from "../components/ui/LinkGrid";
import { greeting, links, research } from "../portfolio";

const GRID_STYLE = {
  paddingTop: "clamp(40px, 6vw, 80px)",
  paddingBottom: "clamp(72px, 9vw, 120px)",
} as const;

export default function Links() {
  const { citations, hIndex } = research.scholarStats;
  return (
    <div className="page">
      <PageBand
        kicker={`${citations} citations · h-index ${hIndex}`}
        title={links.title}
        description={links.subtitle}
        image={{
          src: links.profile_image_path,
          alt: `Portrait of ${greeting.title}`,
        }}
      />
      <div className="wrap" style={GRID_STYLE}>
        <LinkGrid items={links.links} label={links.title} />
      </div>
    </div>
  );
}
