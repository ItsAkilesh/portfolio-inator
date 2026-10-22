/**
 * File: AdminNav.tsx
 * Purpose: Section navigation of the admin console, grouped, with a problem count per section.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import { NavLink } from "react-router-dom";
import { issueCount } from "./form/FormContext";
import { pathId } from "./paths";
import { ADMIN_SECTIONS, type AdminSection } from "./sections";
import type { DraftIssues } from "./validation";
import styles from "./admin.module.css";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  isActive ? `${styles.navLink} ${styles.active}` : styles.navLink;

function SectionLink({
  section,
  issues,
}: {
  readonly section: AdminSection;
  readonly issues: DraftIssues;
}) {
  const count = issueCount(issues.byPath, pathId(section.path));
  return (
    <NavLink to={`/admin/${section.id}`} className={linkClass}>
      {section.label}
      {count > 0 && <span className={styles.badge}>{count}</span>}
    </NavLink>
  );
}

export function AdminNav({ issues }: { readonly issues: DraftIssues }) {
  const groups = [...new Set(ADMIN_SECTIONS.map((s) => s.group))];
  return (
    <nav className={styles.nav} aria-label="Admin sections">
      <p className={styles.brand}>Portfolio admin</p>
      {groups.map((group) => (
        <div key={group} className={styles.navGroup}>
          <p className={styles.navTitle}>{group}</p>
          {ADMIN_SECTIONS.filter((s) => s.group === group).map((s) => (
            <SectionLink key={s.id} section={s} issues={issues} />
          ))}
        </div>
      ))}
    </nav>
  );
}
