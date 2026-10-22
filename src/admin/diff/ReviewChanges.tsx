/**
 * File: ReviewChanges.tsx
 * Purpose: "Review changes" dialog: every difference between the saved file and the draft, where it
 *          is, before and after, with a jump to the field and a per-change undo.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import { useMemo } from "react";
import { useAdmin } from "../AdminContext";
import { describePath } from "../describePath";
import { useFocusField } from "../focus";
import { Modal } from "../Modal";
import { pathId } from "../paths";
import { diffContent, previewValue, type Change } from "./diff";
import { revertEdit } from "./revert";
import ui from "../ui.module.css";
import tool from "../tools/tools.module.css";

const KIND_LABEL = {
  added: "Added",
  removed: "Removed",
  changed: "Changed",
} as const;

function ChangeRow({
  change,
  onJump,
  onUndo,
}: {
  readonly change: Change;
  readonly onJump: () => void;
  readonly onUndo: () => void;
}) {
  const { content } = useAdmin();
  const where = describePath(
    change.path,
    change.kind === "removed" ? content.state.saved : content.state.draft,
  );
  return (
    <li className={tool.changeRow} data-kind={change.kind}>
      <span className={tool.changeKind}>{KIND_LABEL[change.kind]}</span>
      <span className={tool.changeWhere}>{where}</span>
      {change.before !== undefined && (
        <del className={tool.changeBefore}>{previewValue(change.before)}</del>
      )}
      {change.after !== undefined && (
        <ins className={tool.changeAfter}>{previewValue(change.after)}</ins>
      )}
      <span className={tool.changeActions}>
        {change.kind !== "removed" && (
          <button type="button" className={ui.secondary} onClick={onJump}>
            Go to field
          </button>
        )}
        <button type="button" className={ui.secondary} onClick={onUndo}>
          Undo this
        </button>
      </span>
    </li>
  );
}

export function ReviewChanges({ onClose }: { readonly onClose: () => void }) {
  const { content } = useAdmin();
  const { saved, draft } = content.state;
  const changes = useMemo(() => diffContent(saved, draft), [saved, draft]);
  const focusField = useFocusField();
  const undo = (change: Change) => {
    const edit = revertEdit(draft, change);
    if (edit) content.edit(edit.path, edit.value);
  };
  return (
    <Modal
      title={`Review changes (${changes.length})`}
      onClose={onClose}
      isWide
    >
      {changes.length === 0 ? (
        <p className={ui.muted}>No unsaved changes.</p>
      ) : (
        <ul className={tool.changeList}>
          {changes.map((change) => (
            <ChangeRow
              key={`${change.kind}:${pathId(change.path)}`}
              change={change}
              onJump={() => {
                onClose();
                focusField(change.path);
              }}
              onUndo={() => undo(change)}
            />
          ))}
        </ul>
      )}
    </Modal>
  );
}
