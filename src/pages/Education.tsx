/**
 * File: Education.tsx
 * Purpose: Education page: header band and degree list.
 * Author: Akilesh
 * Date: 2026-10-20
 */
import { PageBand } from "../components/layout/PageBand";
import { degrees, educationHeader } from "../portfolio";
import { DegreeList } from "../sections/DegreeList";

const CONTENT_STYLE = {
  paddingTop: "clamp(16px, 3vw, 40px)",
  paddingBottom: "clamp(72px, 9vw, 128px)",
} as const;

export default function Education() {
  const kicker =
    degrees.degrees.map((degree) => degree.alt_name).join(" · ") ||
    educationHeader.subtitle;
  return (
    <div className="page">
      <PageBand
        kicker={kicker}
        title={educationHeader.title}
        description={educationHeader.description}
      />
      <div className="wrap" style={CONTENT_STYLE}>
        <DegreeList items={degrees.degrees} />
      </div>
    </div>
  );
}
