/**
 * File: Experience.tsx
 * Purpose: Experience page: one tab per configured section (Work, Volunteering, ...).
 * Author: Akilesh
 * Date: 2026-10-20
 */
import { useState } from "react";
import { PageBand } from "../components/layout/PageBand";
import { SegmentedControl } from "../components/ui/SegmentedControl";
import { experience } from "../portfolio";
import { TimelineList } from "../sections/TimelineList";

const CONTENT_STYLE = {
  paddingTop: "clamp(40px, 5vw, 64px)",
  paddingBottom: "clamp(72px, 9vw, 128px)",
} as const;
const TABS_STYLE = { marginBottom: 32 } as const;

export default function Experience() {
  const [active, setActive] = useState(experience.sections[0]?.title ?? "");
  const section =
    experience.sections.find((item) => item.title === active) ??
    experience.sections[0];
  const options = experience.sections.map((item) => ({
    value: item.title,
    label: `${item.title} · ${item.experiences.length}`,
  }));

  return (
    <div className="page">
      <PageBand title={experience.title} description={experience.description} />
      <div className="wrap" style={CONTENT_STYLE}>
        {options.length > 1 && (
          <div style={TABS_STYLE}>
            <SegmentedControl
              label={experience.title}
              options={options}
              value={active}
              onChange={setActive}
            />
          </div>
        )}
        {section && (
          <TimelineList key={section.title} entries={section.experiences} />
        )}
      </div>
    </div>
  );
}
