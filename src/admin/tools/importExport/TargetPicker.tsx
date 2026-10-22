/**
 * File: TargetPicker.tsx
 * Purpose: Two pickers shared by the import panels: which block the entries go into, and which
 *          logo image they start with (changeable per entry afterwards).
 * Author: Akilesh
 * Date: 2026-10-21
 */
import { useId } from "react";
import type { Target } from "../../import/targets";
import { pathId } from "../../paths";
import ui from "../../ui.module.css";

interface TargetPickerProps {
  readonly label: string;
  readonly targets: readonly Target[];
  readonly value: string;
  readonly onChange: (pathIdValue: string) => void;
}

export function TargetPicker({
  label,
  targets,
  value,
  onChange,
}: TargetPickerProps) {
  const id = useId();
  if (targets.length === 0)
    return (
      <p className={ui.warning}>
        Add a block for these entries first ({label}).
      </p>
    );
  return (
    <span className={ui.pickRow}>
      <label htmlFor={id}>{label}</label>
      <select
        id={id}
        className={ui.select}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {targets.map((t) => (
          <option key={pathId(t.listPath)} value={pathId(t.listPath)}>
            {t.label}
          </option>
        ))}
      </select>
    </span>
  );
}

export function LogoPicker({
  images,
  value,
  onChange,
}: {
  readonly images: readonly string[];
  readonly value: string;
  readonly onChange: (v: string) => void;
}) {
  const id = useId();
  return (
    <span className={ui.pickRow}>
      <label htmlFor={id}>Logo for new entries</label>
      <select
        id={id}
        className={ui.select}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {images.map((image) => (
          <option key={image} value={image}>
            {image}
          </option>
        ))}
      </select>
    </span>
  );
}
