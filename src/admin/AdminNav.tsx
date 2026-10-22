/**
 * File: AdminNav.tsx
 * Purpose: Section navigation of the admin console, grouped, with a problem count per form section
 *          and a search button (Ctrl/Cmd+K).
 * Author: Akilesh
 * Date: 2026-10-21 (updated 2026-10-22)
 */
import { NavLink } from "react-router-dom";
import { issueCount } from "./form/FormContext";
import { pathId } from "./paths";
import { ADMIN_SECTIONS, type AdminSection } from "./sections";
import type { DraftIssues } from "./validation";
import styles from "./admin.module.css";
import ui from "./ui.module.css";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  isActive ? `${styles.navLink} ${styles.active}` : styles.navLink;

function SectionLink({
  section,
  issues,
}: {
  readonly section: AdminSection;
  readonly issues: DraftIssues;
}) {
  const count =
    section.kind === "form"
      ? issueCount(issues.byPath, pathId(section.path))
      : 0;
  return (
    <NavLink to={`/admin/${section.id}`} className={linkClass}>
      {section.label}
      {count > 0 && <span className={ui.badge}>{count}</span>}
    </NavLink>
  );
}

interface AdminNavProps {
  readonly issues: DraftIssues;
  readonly onSearch: () => void;
}

export function AdminNav({ issues, onSearch }: AdminNavProps) {
  const groups = [...new Set(ADMIN_SECTIONS.map((s) => s.group))];
  return (
    <nav className={styles.nav} aria-label="Admin sections">
      <p className={styles.brand}>Portfolio admin</p>
      <button type="button" className={styles.searchButton} onClick={onSearch}>
        Search <kbd>Ctrl K</kbd>
      </button>
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
