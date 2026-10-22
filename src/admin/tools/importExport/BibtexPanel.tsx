/**
 * File: BibtexPanel.tsx
 * Purpose: Imports publications from BibTeX (Google Scholar, ORCID or a reference manager export):
 *          paste or choose a .bib file, tick the entries, pick the publications block and a logo,
 *          and they are appended to the draft. Entries already present (same title) are unticked.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import { useMemo, useState } from "react";
import { useAdmin } from "../../AdminContext";
import { parseBibtex, toPublication, type BibEntry } from "../../import/bibtex";
import { appendTo, blockTargets } from "../../import/targets";
import { useNotify } from "../../notices";
import { getIn, pathId } from "../../paths";
import { parsePathId } from "../../focus";
import { LogoPicker, TargetPicker } from "./TargetPicker";
import ui from "../../ui.module.css";
import pages from "../toolPages.module.css";

const titleKey = (title: string): string =>
  title.toLowerCase().replace(/[^a-z0-9]/g, "");

function useExistingTitles(
  draft: unknown,
  target: string,
): ReadonlySet<string> {
  return useMemo(
    () =>
      new Set(
        (
          (getIn(draft, parsePathId(target)) as
            | { title?: string }[]
            | undefined) ?? []
        ).map((e) => titleKey(e.title ?? "")),
      ),
    [draft, target],
  );
}

function useSkippedKeys() {
  const [skipped, setSkipped] = useState<ReadonlySet<string>>(new Set());
  const setIncluded = (key: string, isIncluded: boolean) =>
    setSkipped((s) => {
      const n = new Set(s);
      if (isIncluded) n.delete(key);
      else n.add(key);
      return n;
    });
  return { skipped, setIncluded };
}

function useEntrySelection(
  entries: readonly BibEntry[],
  draft: unknown,
  target: string,
) {
  const existing = useExistingTitles(draft, target);
  const { skipped, setIncluded } = useSkippedKeys();
  const isChosen = (key: string, title: string) =>
    !skipped.has(key) && !existing.has(titleKey(title));
  const chosen = entries.filter((e) =>
    isChosen(e.key, e.fields.title ?? e.key),
  );
  return { existing, setIncluded, isChosen, chosen };
}

function useBibtexImport() {
  const { content } = useAdmin();
  const notify = useNotify();
  const draft = content.state.draft;
  const targets = useMemo(() => blockTargets(draft, "publications"), [draft]);
  const [source, setSource] = useState("");
  const [target, setTarget] = useState(
    targets[0] ? pathId(targets[0].listPath) : "",
  );
  const [logo, setLogo] = useState(content.images[0] ?? "");
  const entries = useMemo(() => parseBibtex(source), [source]);
  const selection = useEntrySelection(entries, draft, target);
  const { chosen } = selection;
  const add = () => {
    content.replace(
      appendTo(
        draft,
        parsePathId(target),
        chosen.map((e) => toPublication(e, logo)),
      ),
      `import ${chosen.length} publications`,
    );
    notify(`Added ${chosen.length} publications; review and save`);
    setSource("");
  };
  const form = { source, setSource, target, setTarget, logo, setLogo };
  return { images: content.images, targets, entries, add, form, selection };
}

interface EntryRowProps {
  readonly entry: BibEntry;
  readonly logo: string;
  readonly existing: ReadonlySet<string>;
  readonly isChosen: (key: string, title: string) => boolean;
  readonly setIncluded: (key: string, isIncluded: boolean) => void;
}

function EntryRow({
  entry: e,
  logo,
  existing,
  isChosen,
  setIncluded,
}: EntryRowProps) {
  const title = toPublication(e, logo).title;
  const isDuplicate = existing.has(titleKey(title));
  return (
    <li>
      <label className={ui.checkLabel}>
        <input
          type="checkbox"
          disabled={isDuplicate}
          checked={isChosen(e.key, title)}
          onChange={(ev) => setIncluded(e.key, ev.target.checked)}
        />
        {title}
      </label>
      <span className={ui.muted}>
        {isDuplicate
          ? "already listed"
          : `${e.type}, ${e.fields.year ?? "no year"}`}
      </span>
    </li>
  );
}

function BibtexSource({
  source,
  setSource,
}: {
  readonly source: string;
  readonly setSource: (value: string) => void;
}) {
  return (
    <>
      <label className={ui.secondary}>
        Choose a .bib file
        <input
          type="file"
          accept=".bib,text/plain"
          hidden
          onChange={(e) => void e.target.files?.[0]?.text().then(setSource)}
        />
      </label>
      <textarea
        className={ui.textArea}
        aria-label="BibTeX"
        rows={6}
        placeholder="@article{key, title={...}, author={...}, year={2024}}"
        value={source}
        onChange={(e) => setSource(e.target.value)}
      />
    </>
  );
}

export function BibtexPanel() {
  const { images, targets, entries, add, form, selection } = useBibtexImport();
  const count = selection.chosen.length;
  return (
    <div className={ui.tool}>
      <BibtexSource source={form.source} setSource={form.setSource} />
      <TargetPicker
        label="Add to"
        targets={targets}
        value={form.target}
        onChange={form.setTarget}
      />
      <LogoPicker images={images} value={form.logo} onChange={form.setLogo} />
      <ul className={pages.pickList} aria-label="Entries found">
        {entries.map((e) => (
          <EntryRow
            key={e.key}
            entry={e}
            logo={form.logo}
            existing={selection.existing}
            isChosen={selection.isChosen}
            setIncluded={selection.setIncluded}
          />
        ))}
      </ul>
      <button
        type="button"
        className={ui.primary}
        disabled={count === 0 || !form.target || !form.logo}
        onClick={add}
      >
        Add {count} publication{count === 1 ? "" : "s"}
      </button>
    </div>
  );
}
