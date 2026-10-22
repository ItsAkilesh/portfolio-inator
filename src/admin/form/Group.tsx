/**
 * File: Group.tsx
 * Purpose: Frame around a container field (legend, help, problem badge), or a frameless stack when the
 *          container already sits inside an expanded list item.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import type { ReactNode } from "react";
import type { Path } from "../paths";
import { pathId } from "../paths";
import { issueCount, useForm } from "./FormContext";
import styles from "./form.module.css";

interface GroupProps {
  readonly label: string;
  readonly description?: string;
  readonly path: Path;
  readonly isBare?: boolean;
  readonly children: ReactNode;
}

export function ProblemBadge({ path }: { readonly path: Path }) {
  const { issues } = useForm();
  const count = issueCount(issues, pathId(path));
  return count > 0 ? <span className={styles.badge}>{count}</span> : null;
}

export function Group({
  label,
  description,
  path,
  isBare = false,
  children,
}: GroupProps) {
  const help = description && <p className={styles.help}>{description}</p>;
  if (isBare)
    return (
      <div className={styles.bare}>
        {help}
        {children}
      </div>
    );
  return (
    <fieldset className={styles.group}>
      <legend className={styles.legend}>
        {label}
        <ProblemBadge path={path} />
      </legend>
      {help}
      {children}
    </fieldset>
  );
}
