/**
 * File: SaveBar.tsx
 * Purpose: Save status, problem summary and the save/revert/reload actions of the admin console.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import type { SaveStatus } from "./draft";
import styles from "./admin.module.css";

interface SaveBarProps {
  readonly status: SaveStatus;
  readonly isDirty: boolean;
  readonly problems: readonly string[];
  readonly serverIssues: readonly string[];
  readonly onSave: () => void;
  readonly onRevert: () => void;
  readonly onReload: () => void;
}

const STATUS_TEXT: Readonly<Record<SaveStatus, string>> = {
  loading: "Loading…",
  idle: "",
  saving: "Saving…",
  saved: "Saved to portfolio.json",
  error: "Not saved",
};

export function SaveBar({
  status,
  isDirty,
  problems,
  serverIssues,
  onSave,
  onRevert,
  onReload,
}: SaveBarProps) {
  const messages = serverIssues.length > 0 ? serverIssues : problems;
  const text =
    isDirty && status !== "saving" && status !== "error"
      ? "Unsaved changes"
      : STATUS_TEXT[status];
  return (
    <div className={styles.saveBar} role="status" aria-live="polite">
      <span className={styles.status} data-status={status}>
        {text}
        {problems.length > 0 &&
          ` · ${problems.length} problem${problems.length === 1 ? "" : "s"}`}
      </span>
      {messages.length > 0 && (
        <details className={styles.problems}>
          <summary>Details</summary>
          <ul>
            {messages.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        </details>
      )}
      <span className={styles.actions}>
        {serverIssues.some((m) => m.includes("changed since")) && (
          <button type="button" className={styles.secondary} onClick={onReload}>
            Reload file
          </button>
        )}
        <button
          type="button"
          className={styles.secondary}
          disabled={!isDirty}
          onClick={onRevert}
        >
          Revert
        </button>
        <button
          type="button"
          className={styles.primary}
          disabled={!isDirty || problems.length > 0 || status === "saving"}
          onClick={onSave}
        >
          Save
        </button>
      </span>
    </div>
  );
}
