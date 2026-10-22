/**
 * File: listParts.tsx
 * Purpose: Pieces shared by list editors: collapsed-row summaries and the per-item controls (drag
 *          handle, move up/down, duplicate, remove).
 * Author: Akilesh
 * Date: 2026-10-21 (updated 2026-10-22)
 */
import type { z } from "zod";
import { kindOf, metaOf, optionFor } from "../../content/introspect";
import styles from "./form.module.css";
import listStyles from "./listItems.module.css";

const asRecord = (value: unknown): Record<string, unknown> =>
  typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : {};

/** Collapsed-row label: block type plus its title, the summary field, or "Item n". */
export function summaryOf(
  element: z.ZodType,
  value: unknown,
  index: number,
): string {
  const fallback = `Item ${index + 1}`;
  if (kindOf(element) === "union") {
    const option = optionFor(element, value);
    const type = option ? (metaOf(option).title ?? "") : "";
    const record = asRecord(value);
    const detail = [record.title, record.heading].find(
      (v) => typeof v === "string" && v.trim(),
    );
    const parts = detail === type ? [type] : [type, detail];
    return parts.filter(Boolean).join(" · ") || fallback;
  }
  const key = metaOf(element).summaryKey;
  const text = key ? asRecord(value)[key] : value;
  return typeof text === "string" && text.trim() ? text : fallback;
}

interface ItemControlsProps {
  readonly index: number;
  readonly total: number;
  readonly label: string;
  readonly onMove: (to: number) => void;
  readonly onDuplicate: () => void;
  readonly onRemove: () => void;
  readonly handleProps: Readonly<Record<string, unknown>>;
}

export function ItemControls({
  index,
  total,
  label,
  onMove,
  onDuplicate,
  onRemove,
  handleProps,
}: ItemControlsProps) {
  return (
    <span className={listStyles.controls}>
      <span
        className={listStyles.handle}
        title="Drag to reorder"
        aria-hidden="true"
        {...handleProps}
      >
        ⠿
      </span>
      <button
        type="button"
        className={styles.icon}
        aria-label={`Move ${label} up`}
        disabled={index === 0}
        onClick={() => onMove(index - 1)}
      >
        ↑
      </button>
      <button
        type="button"
        className={styles.icon}
        aria-label={`Move ${label} down`}
        disabled={index === total - 1}
        onClick={() => onMove(index + 1)}
      >
        ↓
      </button>
      <button
        type="button"
        className={styles.icon}
        aria-label={`Duplicate ${label}`}
        onClick={onDuplicate}
      >
        ⧉
      </button>
      <button
        type="button"
        className={styles.icon}
        aria-label={`Remove ${label}`}
        onClick={onRemove}
      >
        ✕
      </button>
    </span>
  );
}
