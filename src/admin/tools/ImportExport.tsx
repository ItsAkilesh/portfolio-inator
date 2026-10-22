/**
 * File: ImportExport.tsx
 * Purpose: Import and export tool: the whole content as JSON, publications from BibTeX, and a JSON
 *          Resume. Imports change only the draft, so they can be reviewed, undone or saved.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import { useState } from "react";
import { BibtexPanel } from "./importExport/BibtexPanel";
import { JsonPanel } from "./importExport/JsonPanel";
import { ResumePanel } from "./importExport/ResumePanel";
import ui from "../ui.module.css";

const TABS = [
  { id: "json", label: "Content JSON", Panel: JsonPanel },
  { id: "bibtex", label: "Publications (BibTeX)", Panel: BibtexPanel },
  { id: "resume", label: "Resume (JSON Resume)", Panel: ResumePanel },
] as const;

export default function ImportExport() {
  const [active, setActive] = useState<(typeof TABS)[number]["id"]>("json");
  const tab = TABS.find((t) => t.id === active) ?? TABS[0];
  return (
    <div>
      <div className={ui.tabs} role="tablist" aria-label="Import and export">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            id={`tab-${t.id}`}
            aria-selected={t.id === active}
            aria-controls={`panel-${t.id}`}
            onClick={() => setActive(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div
        role="tabpanel"
        id={`panel-${tab.id}`}
        aria-labelledby={`tab-${tab.id}`}
      >
        <tab.Panel />
      </div>
    </div>
  );
}
