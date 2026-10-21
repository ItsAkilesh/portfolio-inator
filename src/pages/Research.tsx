/**
 * File: Research.tsx
 * Purpose: Research page: header with the research-profile cards, then each configured section in its layout.
 * Author: Akilesh
 * Date: 2026-10-20
 */
import { PageBand } from "../components/layout/PageBand";
import { research } from "../portfolio";
import { FeaturedResearch } from "../sections/FeaturedResearch";
import { PublicationList } from "../sections/PublicationList";
import { ResearchCards } from "../sections/ResearchCards";

const CONTENT_STYLE = {
  paddingTop: "clamp(48px, 6vw, 80px)",
  paddingBottom: "clamp(72px, 9vw, 128px)",
} as const;
export default function Research() {
  return (
    <div className="page">
      <PageBand title={research.title} description={research.description}>
        <ResearchCards className="enter" />
      </PageBand>
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
