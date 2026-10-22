/**
 * File: FieldShell.tsx
 * Purpose: Label, help text and error messages around one generated input.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import type { ReactNode } from "react";
import styles from "./form.module.css";

interface FieldShellProps {
  readonly id: string;
  readonly label: string;
  readonly description?: string;
  readonly errors: readonly string[];
  readonly children: ReactNode;
}

export function FieldShell({
  id,
  label,
  description,
  errors,
  children,
}: FieldShellProps) {
  const helpId = `${id}-help`;
  return (
    <div className={styles.field} data-invalid={errors.length > 0 || undefined}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>
      {children}
      {description && (
        <p id={helpId} className={styles.help}>
          {description}
        </p>
      )}
      {errors.map((error) => (
        <p key={error} className={styles.error} role="alert">
          {error}
        </p>
      ))}
    </div>
  );
}
