/**
 * File: TimelineList.tsx
 * Purpose: Dated list of roles with logo, company link and description. Used by the Experience page.
 * Author: Akilesh
 * Date: 2026-10-20
 */
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
          key={`${entry.company}-${entry.title}-${entry.duration}`}
          className={`hover-row enter ${styles.item}`}
          style={{ animationDelay: staggerDelay(index) }}
        >
          <div className={styles.aside}>
            <span className="mono">{entry.duration}</span>
            <span className="mono muted">{entry.location}</span>
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
                <SmartLink href={entry.company_url}>{entry.company}</SmartLink>
              </div>
            </div>
            <p className={`muted ${styles.description}`}>{entry.description}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
