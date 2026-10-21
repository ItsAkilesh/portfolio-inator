/**
 * File: Projects.tsx
 * Purpose: Projects page: header band, GitHub project list and a link to the full profile.
 * Author: Akilesh
 * Date: 2026-10-20
 */
import { PageBand } from "../components/layout/PageBand";
import { SmartLink } from "../components/ui/SmartLink";
import { projects, projectsHeader, ui } from "../portfolio";
import { ProjectList } from "../sections/ProjectList";

const CONTENT_STYLE = {
  paddingTop: "clamp(16px, 3vw, 40px)",
  paddingBottom: "clamp(72px, 9vw, 128px)",
} as const;
const MORE_STYLE = {
  display: "inline-flex",
  alignItems: "center",
  gap: 10,
  marginTop: 40,
  minHeight: 48,
  padding: "0 24px",
  borderRadius: 999,
  border: "1px solid var(--line)",
  color: "var(--ink)",
  fontWeight: 600,
} as const;

export default function Projects() {
  return (
    <div className="page">
      <PageBand
        title={projectsHeader.title}
        description={projectsHeader.description}
      />
      <div className="wrap" style={CONTENT_STYLE}>
        <ProjectList items={projects} />
        <SmartLink href={projectsHeader.moreLink} style={MORE_STYLE}>
          {ui.moreProjectsLabel}{" "}
          <span className="arrow" aria-hidden="true">
            ↗
          </span>
        </SmartLink>
      </div>
    </div>
  );
}
