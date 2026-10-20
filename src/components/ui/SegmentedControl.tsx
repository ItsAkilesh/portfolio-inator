/**
 * File: SegmentedControl.tsx
 * Purpose: Pill-shaped single-choice control used for tabs and filters.
 * Author: Akilesh
 * Date: 2026-10-20
 */
import styles from "./SegmentedControl.module.css";

export interface SegmentOption<T extends string> {
  readonly value: T;
  readonly label: string;
}

interface SegmentedControlProps<T extends string> {
  readonly label: string;
  readonly options: readonly SegmentOption<T>[];
  readonly value: T;
  readonly onChange: (value: T) => void;
}

export function SegmentedControl<T extends string>({
  label,
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  return (
    <div className={styles.group} role="group" aria-label={label}>
      {options.map((option) => {
        const isOn = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            className={isOn ? `${styles.option} ${styles.on}` : styles.option}
            aria-pressed={isOn}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
