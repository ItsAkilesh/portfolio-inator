/**
 * File: Group.tsx
 * Purpose: Heading row around a container field (title, count, problem badge, help), or a plain stack
 *          when the container already sits inside an expanded list item.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import type { ReactNode } from "react";
import { pathId, type Path } from "../paths";
import { issueCount, useForm } from "./FormContext";
import styles from "./form.module.css";

interface GroupProps {
  readonly label: string;
  readonly description?: string;
  readonly path: Path;
  readonly isBare?: boolean;
  /** Number of entries, shown next to list titles. */
  readonly count?: number;
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
  count,
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
    <section className={styles.group} aria-label={label}>
      <h3 className={styles.legend}>
        {label}
        {count !== undefined && <span className={styles.count}>{count}</span>}
        <ProblemBadge path={path} />
      </h3>
      {help}
      <div className={styles.groupBody}>{children}</div>
    </section>
  );
}
