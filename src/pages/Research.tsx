/**
 * File: Research.tsx
 * Purpose: Research page: header with citation stats, then each configured section in its layout.
 * Author: Akilesh
 * Date: 2026-10-20
 */
import { PageBand } from "../components/layout/PageBand";
import { SmartLink } from "../components/ui/SmartLink";
import { research } from "../portfolio";
import { FeaturedResearch } from "../sections/FeaturedResearch";
import { PublicationList } from "../sections/PublicationList";

const CONTENT_STYLE = {
  paddingTop: "clamp(48px, 6vw, 80px)",
  paddingBottom: "clamp(72px, 9vw, 128px)",
} as const;
const STATS_STYLE = {
  color: "var(--on-accent-muted)",
  lineHeight: 1.9,
} as const;
const STAT_LINK_STYLE = { color: "var(--on-accent)" } as const;

function Stats() {
  const { scholarStats: scholar, researchGateStats: gate } = research;
  return (
    <span className="mono" style={STATS_STYLE}>
      {scholar.citations} citations · h-index {scholar.hIndex} · i10-index{" "}
      {scholar.i10Index} on{" "}
      <SmartLink href={scholar.profileUrl} style={STAT_LINK_STYLE}>
        Google Scholar
      </SmartLink>
      <br />
      Interest score {gate.interestScore} on{" "}
      <SmartLink href={gate.profileUrl} style={STAT_LINK_STYLE}>
        ResearchGate
      </SmartLink>
    </span>
  );
}

export default function Research() {
  return (
    <div className="page">
      <PageBand
        kicker={research.subtitle}
        title={research.title}
        description={
          <>
            {research.description}
            <br />
            <br />
            <Stats />
          </>
        }
      />
      <div className="wrap" style={CONTENT_STYLE}>
        {research.sections.map((section) =>
          section.layout === "featured" ? (
            <FeaturedResearch key={section.title} section={section} />
          ) : (
            <PublicationList key={section.title} section={section} />
          ),
        )}
      </div>
    </div>
  );
}
