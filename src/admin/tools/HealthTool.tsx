/**
 * File: HealthTool.tsx
 * Purpose: Health check tool: runs the content checks on the draft, optionally tests every external
 *          link through the dev server, and lists findings by area with a jump to each field.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import { useEffect, useMemo, useState } from "react";
import { portfolioSchema } from "../../content/schema";
import { useAdmin } from "../AdminContext";
import { imageDetails } from "../api/assets";
import { checkLinks } from "../api/tools";
import { describePath } from "../describePath";
import { useFocusField } from "../focus";
import {
  externalLinks,
  runChecks,
  type Finding,
  type ImageFacts,
} from "../health/checks";
import { pathId } from "../paths";
import { isLarge } from "../media/imageFacts";
import ui from "../ui.module.css";
import tool from "./tools.module.css";

function useLinkFindings(content: unknown) {
  const [findings, setFindings] = useState<readonly Finding[] | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const run = async () => {
    const links = externalLinks(portfolioSchema, content);
    setIsChecking(true);
    const result = await checkLinks([...links.keys()]);
    setIsChecking(false);
    if (!result.ok)
      return setFindings([
        {
          severity: "error",
          area: "Links",
          message: result.issues.join("; "),
          path: [],
        },
      ]);
    setFindings(
      result.data.results
        .filter((r) => !r.ok)
        .map((r) => ({
          severity: "error",
          area: "Links",
          message: `${r.url}: ${r.reason ?? "failed"}`,
          path: links.get(r.url) ?? [],
        })),
    );
  };
  return {
    findings,
    isChecking,
    run,
    count: externalLinks(portfolioSchema, content).size,
  };
}

function FindingRow({ finding }: { readonly finding: Finding }) {
  const { content } = useAdmin();
  const focusField = useFocusField();
  return (
    <li className={tool.finding} data-severity={finding.severity}>
      <span className={ui.tag}>{finding.area}</span>
      <span>{finding.message}</span>
      {finding.path.length > 0 && (
        <button
          type="button"
          className={ui.secondary}
          onClick={() => focusField(finding.path)}
          title={describePath(finding.path, content.state.draft)}
        >
          Go to field
        </button>
      )}
    </li>
  );
}

function useImageFacts(): readonly ImageFacts[] {
  const [images, setImages] = useState<readonly ImageFacts[]>([]);
  useEffect(() => {
    void imageDetails().then(
      (r) =>
        r.ok &&
        setImages(
          r.data.images.map((i) => ({ name: i.name, isLarge: isLarge(i) })),
        ),
    );
  }, []);
  return images;
}

function ValidationProblems({
  messages,
}: {
  readonly messages: readonly string[];
}) {
  if (messages.length === 0) return null;
  return (
    <ul className={tool.findings} aria-label="Validation problems">
      {messages.map((message) => (
        <li key={message} data-severity="error">
          {message}
        </li>
      ))}
    </ul>
  );
}

function LinkCheck({
  links,
}: {
  readonly links: ReturnType<typeof useLinkFindings>;
}) {
  return (
    <div className={ui.actions}>
      <button
        type="button"
        className={ui.secondary}
        disabled={links.isChecking}
        onClick={() => void links.run()}
      >
        {links.isChecking
          ? "Checking links…"
          : `Check ${links.count} external links`}
      </button>
      {links.findings && (
        <span className={ui.muted}>
          {links.findings.length === 0
            ? "All links answered."
            : `${links.findings.length} failing`}
        </span>
      )}
    </div>
  );
}

export default function HealthTool() {
  const { content, issues } = useAdmin();
  const draft = content.state.draft;
  const images = useImageFacts();
  const findings = useMemo(
    () => runChecks(portfolioSchema, draft, images),
    [draft, images],
  );
  const links = useLinkFindings(draft);
  const all = [...findings, ...(links.findings ?? [])];
  const errors =
    all.filter((f) => f.severity === "error").length + issues.all.length;
  return (
    <div className={ui.tool}>
      <p className={errors === 0 ? ui.good : ui.warning}>
        {errors} error{errors === 1 ? "" : "s"},{" "}
        {all.length - all.filter((f) => f.severity === "error").length}{" "}
        warning(s)
      </p>
      <ValidationProblems messages={issues.all} />
      <LinkCheck links={links} />
      <ul className={tool.findings} aria-label="Findings">
        {all.map((f) => (
          <FindingRow
            key={`${f.area}:${f.message}:${pathId(f.path)}`}
            finding={f}
          />
        ))}
      </ul>
    </div>
  );
}
