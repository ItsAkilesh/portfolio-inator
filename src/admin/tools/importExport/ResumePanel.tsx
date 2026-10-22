/**
 * File: ResumePanel.tsx
 * Purpose: Prefills the draft from a JSON Resume file: profile name and summary, social links, work
 *          (into a timeline group), education (into a degrees block) and publications. Each part can
 *          be switched off; everything lands in the draft for review before saving.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import { useMemo, useState, type Dispatch, type SetStateAction } from "react";
import { useAdmin } from "../../AdminContext";
import { parsePathId } from "../../focus";
import {
  parseResume,
  toDegrees,
  toPublications,
  toSocialLinks,
  toTimeline,
  type Resume,
} from "../../import/jsonResume";
import { appendTo, blockTargets } from "../../import/targets";
import { useNotify } from "../../notices";
import { getIn, pathId, setIn } from "../../paths";
import { LogoPicker, TargetPicker } from "./TargetPicker";
import ui from "../../ui.module.css";

type Part = "profile" | "socials" | "work" | "education" | "publications";
const FALLBACK_SITE_URL = "https://example.com/";
const PARTS: readonly Part[] = [
  "profile",
  "socials",
  "work",
  "education",
  "publications",
];

interface Targets {
  readonly work: string;
  readonly education: string;
  readonly publications: string;
}

function applyResume(
  draft: unknown,
  resume: Resume,
  parts: ReadonlySet<Part>,
  targets: Targets,
  logo: string,
): unknown {
  let next = draft;
  const basics = resume.basics;
  if (parts.has("profile") && basics) {
    if (basics.name)
      next = setIn(next, ["site", "profile", "title"], basics.name);
    if (basics.summary)
      next = setIn(next, ["site", "profile", "subTitle"], basics.summary);
  }
  if (parts.has("socials"))
    next = appendTo(next, ["site", "socialLinks"], toSocialLinks(resume));
  if (parts.has("work") && targets.work)
    next = appendTo(next, parsePathId(targets.work), toTimeline(resume, logo));
  const siteUrl = String(
    getIn(next, ["site", "seo", "siteUrl"]) ?? FALLBACK_SITE_URL,
  );
  if (parts.has("education") && targets.education)
    next = appendTo(
      next,
      parsePathId(targets.education),
      toDegrees(resume, logo, siteUrl),
    );
  if (parts.has("publications") && targets.publications)
    next = appendTo(
      next,
      parsePathId(targets.publications),
      toPublications(resume, logo),
    );
  return next;
}

const firstPath = (
  list: readonly { listPath: readonly (string | number)[] }[],
) => (list[0] ? pathId(list[0].listPath) : "");

type TargetOptions = Readonly<
  Record<keyof Targets, ReturnType<typeof blockTargets>>
>;

function useResumeFile() {
  const [resume, setResume] = useState<Resume | null>(null);
  const [error, setError] = useState("");
  const load = async (file: File | undefined) => {
    if (!file) return;
    const result = parseResume(await file.text());
    setResume(result.ok ? result.resume : null);
    setError(result.ok ? "" : result.reason);
  };
  return { resume, error, load };
}

function usePartToggles() {
  const [parts, setParts] = useState<ReadonlySet<Part>>(new Set(PARTS));
  const toggle = (part: Part) =>
    setParts((s) => {
      const n = new Set(s);
      if (n.has(part)) n.delete(part);
      else n.add(part);
      return n;
    });
  return { parts, toggle };
}

function useTargetOptions(draft: unknown): TargetOptions {
  return useMemo(
    () => ({
      work: blockTargets(draft, "timeline"),
      education: blockTargets(draft, "degrees"),
      publications: blockTargets(draft, "publications"),
    }),
    [draft],
  );
}

function useResumeImport() {
  const { content } = useAdmin();
  const notify = useNotify();
  const draft = content.state.draft;
  const options = useTargetOptions(draft);
  const file = useResumeFile();
  const { parts, toggle } = usePartToggles();
  const [targets, setTargets] = useState<Targets>({
    work: firstPath(options.work),
    education: firstPath(options.education),
    publications: firstPath(options.publications),
  });
  const [logo, setLogo] = useState(content.images[0] ?? "");
  const apply = () => {
    if (!file.resume) return;
    content.replace(
      applyResume(draft, file.resume, parts, targets, logo),
      "import resume",
    );
    notify("Resume imported into the editor; review and save");
  };
  const choices = { parts, toggle, targets, setTargets, logo, setLogo };
  return { images: content.images, options, file, choices, apply };
}

function PartsFieldset({
  parts,
  toggle,
}: {
  readonly parts: ReadonlySet<Part>;
  readonly toggle: (part: Part) => void;
}) {
  return (
    <fieldset className={ui.settings}>
      <legend>Import</legend>
      {PARTS.map((part) => (
        <label key={part} className={ui.checkLabel}>
          <input
            type="checkbox"
            checked={parts.has(part)}
            onChange={() => toggle(part)}
          />
          {part}
        </label>
      ))}
    </fieldset>
  );
}

function TargetPickers({
  options,
  targets,
  setTargets,
}: {
  readonly options: TargetOptions;
  readonly targets: Targets;
  readonly setTargets: Dispatch<SetStateAction<Targets>>;
}) {
  return (
    <>
      <TargetPicker
        label="Work goes to"
        targets={options.work}
        value={targets.work}
        onChange={(v) => setTargets((t) => ({ ...t, work: v }))}
      />
      <TargetPicker
        label="Education goes to"
        targets={options.education}
        value={targets.education}
        onChange={(v) => setTargets((t) => ({ ...t, education: v }))}
      />
      <TargetPicker
        label="Publications go to"
        targets={options.publications}
        value={targets.publications}
        onChange={(v) => setTargets((t) => ({ ...t, publications: v }))}
      />
    </>
  );
}

export function ResumePanel() {
  const { images, options, file, choices, apply } = useResumeImport();
  return (
    <div className={ui.tool}>
      <label className={ui.secondary}>
        Choose a resume.json
        <input
          type="file"
          accept="application/json,.json"
          hidden
          onChange={(e) => void file.load(e.target.files?.[0])}
        />
      </label>
      {file.error && <p className={ui.warning}>{file.error}</p>}
      {file.resume && (
        <>
          <PartsFieldset parts={choices.parts} toggle={choices.toggle} />
          <TargetPickers
            options={options}
            targets={choices.targets}
            setTargets={choices.setTargets}
          />
          <LogoPicker
            images={images}
            value={choices.logo}
            onChange={choices.setLogo}
          />
          <button
            type="button"
            className={ui.primary}
            disabled={choices.parts.size === 0}
            onClick={apply}
          >
            Import into the draft
          </button>
        </>
      )}
    </div>
  );
}
