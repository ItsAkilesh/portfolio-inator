/**
 * File: listParts.tsx
 * Purpose: Pieces shared by list editors: collapsed-row summaries, move/remove buttons and the
 *          add control (with a type picker for lists of blocks or other unions).
 * Author: Akilesh
 * Date: 2026-10-21
 */
import { useState } from "react";
import type { z } from "zod";
import {
  emptyValue,
  kindOf,
  metaOf,
  optionFor,
  unionOptions,
} from "./introspect";
import styles from "./form.module.css";

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
    return [type, detail].filter(Boolean).join(" · ") || fallback;
  }
  const key = metaOf(element).summaryKey;
  const text = key ? asRecord(value)[key] : value;
  return typeof text === "string" && text.trim() ? text : fallback;
}

interface ItemControlsProps {
  readonly index: number;
  readonly total: number;
  readonly onMove: (to: number) => void;
  readonly onRemove: () => void;
}

export function ItemControls({
  index,
  total,
  onMove,
  onRemove,
}: ItemControlsProps) {
  return (
    <span className={styles.controls}>
      <button
        type="button"
        className={styles.icon}
        aria-label="Move up"
        disabled={index === 0}
        onClick={() => onMove(index - 1)}
      >
        ↑
      </button>
      <button
        type="button"
        className={styles.icon}
        aria-label="Move down"
        disabled={index === total - 1}
        onClick={() => onMove(index + 1)}
      >
        ↓
      </button>
      <button
        type="button"
        className={styles.icon}
        aria-label="Remove"
        onClick={onRemove}
      >
        ✕
      </button>
    </span>
  );
}

export function AddItem({
  element,
  onAdd,
}: {
  readonly element: z.ZodType;
  readonly onAdd: (value: unknown) => void;
}) {
  const options = kindOf(element) === "union" ? unionOptions(element) : [];
  const [choice, setChoice] = useState(options[0]?.value ?? "");
  const add = () => {
    const option = options.find((o) => o.value === choice);
    onAdd(emptyValue(option ? option.schema : element));
  };
  return (
    <div className={styles.inline}>
      {options.length > 0 && (
        <select
          className={styles.input}
          value={choice}
          aria-label="Type to add"
          onChange={(e) => setChoice(e.target.value)}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {metaOf(o.schema).title ?? o.value}
            </option>
          ))}
        </select>
      )}
      <button type="button" className={styles.button} onClick={add}>
        Add
      </button>
    </div>
  );
}
