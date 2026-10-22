/**
 * File: primitives.tsx
 * Purpose: Leaf editors for generated forms: text (single or multi-line), number, toggle, select and
 *          colour (text with a live swatch, since palettes use oklch() which the native picker lacks).
 * Author: Akilesh
 * Date: 2026-10-21
 */
import type { ChangeEvent } from "react";
import styles from "./form.module.css";

interface InputProps<T> {
  readonly id: string;
  readonly value: T;
  readonly onChange: (value: T) => void;
  readonly describedBy?: string;
}

export function TextInput({
  id,
  value,
  onChange,
  isMultiline = false,
}: InputProps<string> & { readonly isMultiline?: boolean }) {
  const handle = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    onChange(event.target.value);
  return isMultiline ? (
    <textarea
      id={id}
      className={styles.input}
      rows={3}
      value={value}
      onChange={handle}
    />
  ) : (
    <input id={id} className={styles.input} value={value} onChange={handle} />
  );
}

export function NumberInput({ id, value, onChange }: InputProps<number>) {
  return (
    <input
      id={id}
      type="number"
      step="any"
      className={styles.input}
      value={Number.isFinite(value) ? value : ""}
      onChange={(event) =>
        onChange(event.target.value === "" ? 0 : Number(event.target.value))
      }
    />
  );
}

export function ToggleInput({ id, value, onChange }: InputProps<boolean>) {
  return (
    <input
      id={id}
      type="checkbox"
      className={styles.toggle}
      checked={value}
      onChange={(event) => onChange(event.target.checked)}
    />
  );
}

export function SelectInput({
  id,
  value,
  onChange,
  options,
}: InputProps<string> & { readonly options: readonly string[] }) {
  return (
    <select
      id={id}
      className={styles.input}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

export function ColorInput({ id, value, onChange }: InputProps<string>) {
  return (
    <div className={styles.inline}>
      <span
        className={styles.swatch}
        style={{ background: value }}
        aria-hidden="true"
      />
      <input
        id={id}
        className={styles.input}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
