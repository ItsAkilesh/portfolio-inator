/**
 * File: SaveBar.tsx
 * Purpose: The admin console's bottom bar: save status and problems, undo/redo with a short history
 *          list, "Review changes", and the save/revert/reload actions.
 * Author: Akilesh
 * Date: 2026-10-21 (updated 2026-10-22)
 */
import { useState } from "react";
import { useAdmin } from "./AdminContext";
import { ReviewChanges } from "./diff/ReviewChanges";
import { canRedo, canUndo, isDirty, type SaveStatus } from "./draft";
import { STALE_HINT } from "./staleHint";
import styles from "./admin.module.css";
import ui from "./ui.module.css";
import overlay from "./overlay.module.css";

const HISTORY_SHOWN = 10;

const STATUS_TEXT: Readonly<Record<SaveStatus, string>> = {
  loading: "Loading…",
  idle: "",
  saving: "Saving…",
  saved: "Saved to portfolio.json",
  error: "Not saved",
};

function HistoryMenu() {
  const { content } = useAdmin();
  const steps = content.state.past.slice(-HISTORY_SHOWN).reverse();
  if (steps.length === 0) return null;
  const goBack = (count: number) => {
    for (let i = 0; i < count; i += 1) content.undo();
  };
  return (
    <details className={overlay.menu}>
      <summary className={ui.secondary}>History</summary>
      <ol className={overlay.menuList} aria-label="Undo history, newest first">
        {steps.map((step, index) => (
          <li key={`${steps.length - index}-${step.label}`}>
            <button
              type="button"
              className={overlay.menuItem}
              onClick={() => goBack(index + 1)}
            >
              Undo back to before “{step.label}”
            </button>
          </li>
        ))}
      </ol>
    </details>
  );
}

function StatusText({ problems }: { readonly problems: readonly string[] }) {
  const { content } = useAdmin();
  const { status } = content.state;
  const text =
    isDirty(content.state) && status !== "saving" && status !== "error"
      ? "Unsaved changes"
      : STATUS_TEXT[status];
  return (
    <span className={styles.status} data-status={status}>
      {text}
      {problems.length > 0 &&
        ` · ${problems.length} problem${problems.length === 1 ? "" : "s"}`}
    </span>
  );
}

function UndoRedo() {
  const { content } = useAdmin();
  return (
    <span className={ui.actions} aria-label="Undo and redo">
      <button
        type="button"
        className={ui.secondary}
        disabled={!canUndo(content.state)}
        onClick={content.undo}
        title="Ctrl/Cmd+Z"
      >
        Undo
      </button>
      <button
        type="button"
        className={ui.secondary}
        disabled={!canRedo(content.state)}
        onClick={content.redo}
        title="Ctrl/Cmd+Shift+Z"
      >
        Redo
      </button>
      <HistoryMenu />
    </span>
  );
}

function ProblemDetails({
  messages,
}: {
  readonly messages: readonly string[];
}) {
  if (messages.length === 0) return null;
  return (
    <details className={styles.problems}>
      <summary>Details</summary>
      <ul>
        {messages.map((message) => (
          <li key={message}>{message}</li>
        ))}
      </ul>
    </details>
  );
}

function SaveActions({ onReview }: { readonly onReview: () => void }) {
  const { content } = useAdmin();
  const { state } = content;
  const hasChanges = isDirty(state);
  return (
    <span className={`${ui.actions} ${styles.push}`}>
      {state.serverIssues.some((m) => m.includes(STALE_HINT)) && (
        <button
          type="button"
          className={ui.secondary}
          onClick={() => void content.reload()}
        >
          Reload file
        </button>
      )}
      <button
        type="button"
        className={ui.secondary}
        disabled={!hasChanges}
        onClick={onReview}
      >
        Review changes
      </button>
      <button
        type="button"
        className={ui.secondary}
        disabled={!hasChanges}
        onClick={content.revert}
      >
        Revert
      </button>
      <SaveButton />
    </span>
  );
}

function SaveButton() {
  const { content, issues } = useAdmin();
  const { state } = content;
  return (
    <button
      type="button"
      className={ui.primary}
      disabled={
        !isDirty(state) || issues.all.length > 0 || state.status === "saving"
      }
      onClick={() => void content.save()}
      title="Ctrl/Cmd+S"
    >
      Save
    </button>
  );
}

export function SaveBar() {
  const { content, issues } = useAdmin();
  const [isReviewing, setIsReviewing] = useState(false);
  const { state } = content;
  const messages =
    state.serverIssues.length > 0 ? state.serverIssues : issues.all;
  return (
    <div className={styles.saveBar}>
      <span role="status" aria-live="polite">
        <StatusText problems={issues.all} />
      </span>
      <ProblemDetails messages={messages} />
      <UndoRedo />
      <SaveActions onReview={() => setIsReviewing(true)} />
      {isReviewing && <ReviewChanges onClose={() => setIsReviewing(false)} />}
    </div>
  );
}
