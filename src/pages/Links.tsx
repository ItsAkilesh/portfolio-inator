/**
 * File: Links.tsx
 * Purpose: Link-in-bio page listing every profile from config; internal routes are emphasized.
 * Author: Akilesh
 * Date: 2026-10-20
 */
import { PageBand } from "../components/layout/PageBand";
import { isInternalPath } from "../components/ui/SmartLink";
import { LinkRow } from "../components/ui/LinkRow";
import { staggerDelay } from "../lib/text";
import { greeting, links, research } from "../portfolio";

const LIST_STYLE = {
  maxWidth: 640,
  display: "flex",
  flexDirection: "column",
  gap: 10,
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
      <div className="wrap" style={LIST_STYLE}>
        {links.links.map((item, index) => (
          <LinkRow
            key={item.name}
            item={item}
            isEmphasized={isInternalPath(item.link)}
            delay={staggerDelay(index)}
          />
        ))}
      </div>
    </div>
  );
}
