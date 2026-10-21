/**
 * File: PublicationList.tsx
 * Purpose: Filterable bibliography for "list" research sections: venue filter, highlighted author,
 *          and an expandable summary per entry.
 * Author: Akilesh
 * Date: 2026-10-20 (updated 2026-10-21)
 */
import { useId, useMemo, useState } from "react";
import { Expander } from "../components/ui/Expander";
import { SegmentedControl } from "../components/ui/SegmentedControl";
import { SmartLink } from "../components/ui/SmartLink";
import { imageUrl } from "../lib/assets";
import { indexLabel, splitAuthors, staggerDelay } from "../lib/text";
import { profile, ui } from "../portfolio";
import type { TimelineEntry } from "../types/portfolio";
import lists from "./Lists.module.css";
import styles from "./PublicationList.module.css";

/** Unique venues in order of first appearance, preceded by the "all" option. */
export function venueOptions(
  entries: readonly TimelineEntry[],
  allLabel: string,
): string[] {
  return [allLabel, ...new Set(entries.map((entry) => entry.location))];
}

interface PublicationProps {
  readonly entry: TimelineEntry;
  readonly delay: string;
}

/** Entries keyed by original position (stable React keys), then filtered to one venue (or all). */
export function numberedForVenue(
  entries: readonly TimelineEntry[],
  venue: string,
  allLabel: string,
): Array<{ entry: TimelineEntry; number: string }> {
  return entries
    .map((entry, index) => ({ entry, number: indexLabel(index) }))
    .filter(({ entry }) => venue === allLabel || entry.location === venue);
}

function PublicationHeading({ entry }: { readonly entry: TimelineEntry }) {
  const authors = splitAuthors(entry.company, profile.title);
  return (
    <>
      <SmartLink href={entry.company_url} className={styles.title}>
        {entry.title}{" "}
        <span className={`arrow ${styles.arrow}`} aria-hidden="true">
          ↗
        </span>
      </SmartLink>
      <p className={`muted ${styles.authors}`}>
        {authors.before}
        {authors.highlight && <strong>{authors.highlight}</strong>}
        {authors.after}
      </p>
    </>
  );
}

function Publication({ entry, delay }: PublicationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const panelId = useId();
  return (
    <li
      className={`hover-row enter ${styles.item}`}
      style={{ animationDelay: delay }}
    >
      <div className={styles.body}>
        <PublicationHeading entry={entry} />
        <div className={styles.meta}>
          <span className={styles.venue}>
            <img src={imageUrl(entry.logo_path)} alt="" loading="lazy" />
            {entry.location}
          </span>
          <button
            type="button"
            className={styles.toggle}
            aria-expanded={isOpen}
            aria-controls={panelId}
            onClick={() => setIsOpen((open) => !open)}
          >
            {isOpen ? ui.hideSummary : ui.readSummary}
          </button>
        </div>
        <Expander id={panelId} isOpen={isOpen}>
          <p className={`muted ${styles.summary}`}>
            {entry.description.trim()}
          </p>
        </Expander>
      </div>
    </li>
  );
}

interface PublicationListProps {
  readonly title: string;
  readonly entries: readonly TimelineEntry[];
}

export function PublicationList({ title, entries }: PublicationListProps) {
  const [venue, setVenue] = useState(ui.allFilter);
  const options = useMemo(() => venueOptions(entries, ui.allFilter), [entries]);
  const visible = numberedForVenue(entries, venue, ui.allFilter);

  return (
    <section aria-label={title}>
      <div className={lists.toolbar}>
        <h2 className="section-title">{title}</h2>
        <SegmentedControl
          label={`Filter ${title}`}
          options={options.map((value) => ({ value, label: value }))}
          value={venue}
          onChange={setVenue}
        />
      </div>
      <ol className={`plain-list ${lists.list}`}>
        {visible.map(({ entry, number }, index) => (
          <Publication
            key={`${venue}-${number}`}
            entry={entry}
            delay={staggerDelay(index)}
          />
        ))}
      </ol>
    </section>
  );
}
