/**
 * File: JsonPanel.tsx
 * Purpose: Export the draft or the saved content as JSON, and import a portfolio.json (validated
 *          first; problems are listed). An import changes only the draft, so it can be reviewed,
 *          undone or saved.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import { useState } from "react";
import { useAdmin } from "../../AdminContext";
import { useNotify } from "../../notices";
import { validateDraft } from "../../validation";
import { downloadText } from "./download";
import ui from "../../ui.module.css";
import tool from "../tools.module.css";

const MAX_SHOWN_PROBLEMS = 20;
const ISO_DATE_LENGTH = 10;
const JSON_INDENT = 2;
const stamp = (): string => new Date().toISOString().slice(0, ISO_DATE_LENGTH);

const exportJson = (value: unknown, label: string): void =>
  downloadText(
    `portfolio-${label}-${stamp()}.json`,
    `${JSON.stringify(value, null, JSON_INDENT)}\n`,
  );

function useJsonImport() {
  const { content } = useAdmin();
  const notify = useNotify();
  const [problems, setProblems] = useState<readonly string[]>([]);
  const importJson = async (file: File | undefined) => {
    if (!file) return;
    let value: unknown;
    try {
      value = JSON.parse(await file.text());
    } catch {
      setProblems(["The file is not valid JSON"]);
      return;
    }
    const issues = validateDraft(value).all;
    setProblems(issues);
    if (issues.length > 0) return;
    content.replace(value, `import ${file.name}`);
    notify("Imported into the editor; review and save to keep it");
  };
  return { problems, importJson };
}

function ExportActions() {
  const { content } = useAdmin();
  return (
    <div className={ui.actions}>
      <button
        type="button"
        className={ui.secondary}
        onClick={() => exportJson(content.state.draft, "draft")}
      >
        Download the draft
      </button>
      <button
        type="button"
        className={ui.secondary}
        onClick={() => exportJson(content.state.saved, "saved")}
      >
        Download the saved file
      </button>
    </div>
  );
}

function ImportProblems({
  problems,
}: {
  readonly problems: readonly string[];
}) {
  if (problems.length === 0) return null;
  return (
    <ul className={tool.findings} aria-label="Import problems">
      {problems.slice(0, MAX_SHOWN_PROBLEMS).map((p) => (
        <li key={p} data-severity="error">
          {p}
        </li>
      ))}
    </ul>
  );
}

export function JsonPanel() {
  const { problems, importJson } = useJsonImport();
  return (
    <div className={ui.tool}>
      <h2 className={ui.panelTitle}>Export</h2>
      <ExportActions />
      <h2 className={ui.panelTitle}>Import</h2>
      <label className={ui.secondary}>
        Choose a portfolio.json
        <input
          type="file"
          accept="application/json,.json"
          hidden
          onChange={(e) => void importJson(e.target.files?.[0])}
        />
      </label>
      <ImportProblems problems={problems} />
    </div>
  );
}
