/**
 * File: HistoryTool.tsx
 * Purpose: History tool: the copies of portfolio.json kept before each save (newest first, in the
 *          git-ignored .admin-history folder). Each can be compared with the draft and loaded into
 *          the editor, where it can be reviewed and saved like any other change.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import { useEffect, useState } from "react";
import { useAdmin } from "../AdminContext";
import { listHistory, readHistory, type HistoryEntry } from "../api/content";
import { describePath } from "../describePath";
import { diffContent, previewValue } from "../diff/diff";
import { useNotify } from "../notices";
import { pathId } from "../paths";
import ui from "../ui.module.css";
import tool from "./tools.module.css";
import pages from "./toolPages.module.css";

const SHOWN_CHANGES = 40;
const BYTES_PER_KB = 1024;

const when = (iso: string): string => {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? iso : date.toLocaleString();
};

function Comparison({ version }: { readonly version: unknown }) {
  const { content } = useAdmin();
  const changes = diffContent(version, content.state.draft);
  if (changes.length === 0)
    return <p className={ui.muted}>Same as the draft.</p>;
  return (
    <ul className={tool.changeList}>
      {changes.slice(0, SHOWN_CHANGES).map((change) => (
        <li
          key={`${change.kind}:${pathId(change.path)}`}
          className={tool.changeRow}
          data-kind={change.kind}
        >
          <span className={tool.changeWhere}>
            {describePath(
              change.path,
              change.kind === "removed" ? version : content.state.draft,
            )}
          </span>
          <del className={tool.changeBefore}>{previewValue(change.before)}</del>
          <ins className={tool.changeAfter}>{previewValue(change.after)}</ins>
        </li>
      ))}
      {changes.length > SHOWN_CHANGES && (
        <li className={ui.muted}>…and {changes.length - SHOWN_CHANGES} more</li>
      )}
    </ul>
  );
}

interface OpenVersion {
  readonly id: string;
  readonly content: unknown;
}

function useHistory() {
  const { content } = useAdmin();
  const notify = useNotify();
  const [versions, setVersions] = useState<readonly HistoryEntry[]>([]);
  const [open, setOpen] = useState<OpenVersion | null>(null);
  const savedVersion = content.state.version;
  useEffect(() => {
    void listHistory().then((r) => r.ok && setVersions(r.data.versions));
  }, [savedVersion]);
  const show = async (id: string) => {
    const result = await readHistory(id);
    if (result.ok) setOpen({ id, content: result.data.content });
    else notify(result.issues.join("; "), "error");
  };
  const load = (entry: HistoryEntry, value: unknown) => {
    content.replace(value, `version from ${when(entry.savedAt)}`);
    notify("Loaded into the editor; review and save to keep it");
  };
  return { versions, open, show, load };
}

function HistoryItem({
  entry,
  open,
  onShow,
  onLoad,
}: {
  readonly entry: HistoryEntry;
  readonly open: OpenVersion | null;
  readonly onShow: (id: string) => void;
  readonly onLoad: (entry: HistoryEntry, value: unknown) => void;
}) {
  return (
    <li className={pages.historyItem}>
      <span>{when(entry.savedAt)}</span>
      <span className={ui.muted}>
        {Math.round(entry.bytes / BYTES_PER_KB)} KB
      </span>
      <button
        type="button"
        className={ui.secondary}
        onClick={() => onShow(entry.id)}
      >
        Compare with draft
      </button>
      {open?.id === entry.id && (
        <>
          <button
            type="button"
            className={ui.primary}
            onClick={() => onLoad(entry, open.content)}
          >
            Load into editor
          </button>
          <Comparison version={open.content} />
        </>
      )}
    </li>
  );
}

export default function HistoryTool() {
  const { versions, open, show, load } = useHistory();
  return (
    <div className={ui.tool}>
      <p className={ui.muted}>
        A copy is kept before every save from this console (the newest 30).
        Loading one changes only the draft.
      </p>
      {versions.length === 0 && <p>No earlier versions yet.</p>}
      <ul className={pages.historyList}>
        {versions.map((entry) => (
          <HistoryItem
            key={entry.id}
            entry={entry}
            open={open}
            onShow={(id) => void show(id)}
            onLoad={load}
          />
        ))}
      </ul>
    </div>
  );
}
