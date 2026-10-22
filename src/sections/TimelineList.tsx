/**
 * File: TimelineList.tsx
 * Purpose: Dated list of roles with logo, company link and description. Used by the Experience page.
 * Author: Akilesh
 * Date: 2026-10-20 (updated 2026-10-22)
 */
import { DateText } from "../components/ui/DateText";
import { SmartLink } from "../components/ui/SmartLink";
import { imageUrl } from "../lib/assets";
import { staggerDelay } from "../lib/text";
import type { TimelineEntry } from "../types/portfolio";
import styles from "./Lists.module.css";

interface TimelineListProps {
  readonly entries: readonly TimelineEntry[];
}

export function TimelineList({ entries }: TimelineListProps) {
  return (
    <ol className={`plain-list ${styles.list}`}>
      {entries.map((entry, index) => (
        <li
          key={`${entry.company}-${entry.title}-${entry.dates.start}`}
          className={`hover-row enter ${styles.item}`}
          style={{ animationDelay: staggerDelay(index) }}
        >
          <div className={styles.aside}>
            <DateText className={styles.meta} dates={entry.dates} />
            <span className={`muted ${styles.meta}`}>{entry.location}</span>
          </div>
          <div className={styles.main}>
            <div className={styles.heading}>
              <img
                className="logo"
                src={imageUrl(entry.logo_path)}
                alt={`${entry.company} logo`}
                loading="lazy"
              />
              <div>
                <h2 className={`display ${styles.itemTitle}`}>{entry.title}</h2>
                <SmartLink href={entry.company_url} className={styles.org}>
                  {entry.company}
                </SmartLink>
              </div>
            </div>
            <p className={`muted ${styles.description}`}>{entry.description}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
