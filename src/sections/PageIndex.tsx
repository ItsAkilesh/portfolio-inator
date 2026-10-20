/**
 * File: PageIndex.tsx
 * Purpose: Home page "Explore" list: one oversized row per page, with a summary derived from config.
 * Author: Akilesh
 * Date: 2026-10-20
 */
import { Link } from "react-router-dom";
import { indexLabel } from "../lib/text";
import {
  contactPageData,
  degrees,
  experience,
  navigation,
  projects,
  research,
  ui,
} from "../portfolio";
import styles from "./PageIndex.module.css";

const PREVIEW_COUNT = 3;

const countedTitles = (
  sections: ReadonlyArray<{ title: string; count: number }>,
): string =>
  sections.map((section) => `${section.count} ${section.title}`).join(" · ");

function projectPreview(): string {
  const names = projects
    .slice(0, PREVIEW_COUNT)
    .map((project) => project.name)
    .join(", ");
  const extra = projects.length - PREVIEW_COUNT;
  return extra > 0 ? `${names} +${extra}` : names;
}

/** Short summary shown next to each page name; pages without one show nothing. */
export function summaryFor(path: string): string {
  switch (path) {
    case "/experience":
      return countedTitles(
        experience.sections.map((s) => ({
          title: s.title,
          count: s.experiences.length,
        })),
      );
    case "/education":
      return degrees.degrees.map((degree) => degree.alt_name).join(" · ");
    case "/research":
      return countedTitles(
        research.sections.map((s) => ({
          title: s.title,
          count: s.research.length,
        })),
      );
    case "/projects":
      return projectPreview();
    case "/contact":
      return contactPageData.phoneSection.title;
    default:
      return "";
  }
}

export function PageIndex() {
  const pages = navigation.filter((item) => item.path !== "/home");
  return (
    <section className={styles.section} aria-labelledby="page-index-title">
      <h2 id="page-index-title" className="wrap mono muted">
        {ui.indexTitle}
      </h2>
      <ul className={`wrap plain-list ${styles.list}`}>
        {pages.map((item, index) => (
          <li key={item.path}>
            <Link to={item.path} className={styles.row}>
              <span className={`mono ${styles.meta} ${styles.num}`}>
                {indexLabel(index)}
              </span>
              <span className={`display ${styles.big}`}>{item.label}</span>
              <span className={`mono ${styles.meta}`}>
                {summaryFor(item.path)}{" "}
                <span className="arrow" aria-hidden="true">
                  →
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
