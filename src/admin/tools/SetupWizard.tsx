/**
 * File: SetupWizard.tsx
 * Purpose: First-run setup for a fork: who you are, your links, a look, and clearing the sample
 *          content, step by step. Every step edits the draft with the same generated fields as the
 *          rest of the console; nothing is written until you save. Spots a fresh fork from git.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import { useEffect, useState, type ComponentType } from "react";
import { Link } from "react-router-dom";
import { portfolioSchema } from "../../content/schema";
import { schemaAt, titleOf } from "../../content/introspect";
import { useAdmin } from "../AdminContext";
import { gitStatus } from "../api/tools";
import { FormContext } from "../form/FormContext";
import { SchemaField } from "../form/SchemaField";
import { useDraftForm } from "../form/useDraftForm";
import { useNotify } from "../notices";
import { getIn, type Path } from "../paths";
import {
  QUICK_PALETTES,
  SAMPLE_AREAS,
  applyQuickPalette,
  clearSample,
  looksLikeFreshFork,
  type SampleArea,
} from "../setup/sample";
import ui from "../ui.module.css";
import tool from "./tools.module.css";
import pages from "./toolPages.module.css";

const SWATCH_LIGHTNESS = 0.55;

function Fields({ paths }: { readonly paths: readonly Path[] }) {
  const form = useDraftForm();
  const draft = form.root;
  return (
    <FormContext.Provider value={form}>
      {paths.map((path) => {
        const schema = draft
          ? schemaAt(portfolioSchema, path, draft)
          : undefined;
        return schema ? (
          <SchemaField
            key={path.join(".")}
            schema={schema}
            path={path}
            label={titleOf(schema, String(path[path.length - 1]))}
          />
        ) : null;
      })}
    </FormContext.Provider>
  );
}

function LookStep() {
  const { content } = useAdmin();
  const active = String(
    getIn(content.state.draft, ["theme", "activePalette"]) ?? "",
  );
  return (
    <>
      <div className={ui.actions} role="group" aria-label="Quick palettes">
        {QUICK_PALETTES.map((p) => (
          <button
            key={p.name}
            type="button"
            className={ui.secondary}
            aria-pressed={active === p.name}
            onClick={() =>
              content.replace(
                applyQuickPalette(content.state.draft, p),
                `palette ${p.name}`,
              )
            }
          >
            <span
              className={tool.swatchDot}
              style={{
                background: `oklch(${SWATCH_LIGHTNESS} ${p.chroma} ${p.hue})`,
              }}
              aria-hidden="true"
            />
            {p.label}
          </button>
        ))}
      </div>
      <p className={ui.muted}>
        Fine-tune colours in Theme, which also checks contrast.
      </p>
      <Fields paths={[["theme", "defaultMode"]]} />
    </>
  );
}

function useAreaToggles() {
  const [areas, setAreas] = useState<ReadonlySet<SampleArea>>(new Set());
  const toggle = (id: SampleArea) =>
    setAreas((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  return { areas, toggle };
}

function SampleStep() {
  const { content } = useAdmin();
  const notify = useNotify();
  const { areas, toggle } = useAreaToggles();
  return (
    <>
      <p>
        Tick what to empty. Pages and blocks stay, so you can fill them in from
        Pages.
      </p>
      {SAMPLE_AREAS.map((a) => (
        <label key={a.id} className={ui.checkLabel}>
          <input
            type="checkbox"
            checked={areas.has(a.id)}
            onChange={() => toggle(a.id)}
          />
          {a.label}
        </label>
      ))}
      <button
        type="button"
        className={ui.secondary}
        disabled={areas.size === 0}
        onClick={() => {
          content.replace(
            clearSample(content.state.draft, areas),
            "clear sample content",
          );
          notify("Cleared; undo is still available");
        }}
      >
        Clear the ticked content
      </button>
    </>
  );
}

const STEPS: readonly {
  readonly title: string;
  readonly body: ComponentType;
}[] = [
  {
    title: "About you",
    body: () => (
      <Fields
        paths={[
          ["site", "profile", "title"],
          ["site", "profile", "logo_name"],
          ["site", "profile", "nickname"],
          ["site", "profile", "subTitle"],
          ["site", "profile", "githubProfile"],
        ]}
      />
    ),
  },
  {
    title: "Your links",
    body: () => (
      <Fields
        paths={[
          ["site", "socialLinks"],
          ["site", "profile", "resumeLink"],
        ]}
      />
    ),
  },
  {
    title: "Search and sharing",
    body: () => (
      <Fields
        paths={[
          ["site", "seo", "title"],
          ["site", "seo", "description"],
          ["site", "seo", "siteUrl"],
        ]}
      />
    ),
  },
  { title: "Look", body: LookStep },
  { title: "Sample content", body: SampleStep },
  {
    title: "Done",
    body: () => (
      <p>
        Review your changes, save, and continue in{" "}
        <Link to="/admin/pages">Pages</Link>. The{" "}
        <Link to="/admin/docs">guides</Link> explain everything else.
      </p>
    ),
  },
];

function useForkHint(): boolean {
  const { content } = useAdmin();
  const [repoUrl, setRepoUrl] = useState<string | null>(null);
  useEffect(() => {
    void gitStatus().then((r) => r.ok && setRepoUrl(r.data.repoUrl));
  }, []);
  return looksLikeFreshFork(
    repoUrl,
    String(
      getIn(content.state.draft, ["site", "profile", "githubProfile"]) ?? "",
    ),
  );
}

function StepList({
  step,
  onStep,
}: {
  readonly step: number;
  readonly onStep: (step: number) => void;
}) {
  return (
    <ol className={pages.steps} aria-label="Steps">
      {STEPS.map((s, i) => (
        <li key={s.title} aria-current={i === step ? "step" : undefined}>
          <button
            type="button"
            className={pages.stepButton}
            onClick={() => onStep(i)}
          >
            {i + 1}. {s.title}
          </button>
        </li>
      ))}
    </ol>
  );
}

function StepNav({
  step,
  onStep,
}: {
  readonly step: number;
  readonly onStep: (step: number) => void;
}) {
  return (
    <div className={ui.actions}>
      <button
        type="button"
        className={ui.secondary}
        disabled={step === 0}
        onClick={() => onStep(step - 1)}
      >
        Back
      </button>
      <button
        type="button"
        className={ui.primary}
        disabled={step === STEPS.length - 1}
        onClick={() => onStep(step + 1)}
      >
        Next
      </button>
    </div>
  );
}

export default function SetupWizard() {
  const [step, setStep] = useState(0);
  const isFork = useForkHint();
  const current = STEPS[step] ?? STEPS[0];
  if (!current) return null;
  const Body = current.body;
  return (
    <div className={ui.tool}>
      {isFork && (
        <p className={ui.banner}>
          This looks like a fresh fork: the repository is not on the GitHub
          profile in the content. This wizard makes it yours.
        </p>
      )}
      <StepList step={step} onStep={setStep} />
      <section className={ui.panel} aria-label={current.title}>
        <h2 className={ui.panelTitle}>{current.title}</h2>
        <Body />
      </section>
      <StepNav step={step} onStep={setStep} />
    </div>
  );
}
