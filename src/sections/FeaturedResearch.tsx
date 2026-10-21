/**
 * File: FeaturedResearch.tsx
 * Purpose: Large blocks for "featured" research sections such as patents.
 * Author: Akilesh
 * Date: 2026-10-20
 */
import { SmartLink } from "../components/ui/SmartLink";
import { imageUrl } from "../lib/assets";
import { staggerDelay } from "../lib/text";
import type { ResearchSection, TimelineEntry } from "../types/portfolio";
import styles from "./FeaturedResearch.module.css";

function FeaturedCard({
  item,
  index,
}: {
  readonly item: TimelineEntry;
  readonly index: number;
}) {
  return (
    <SmartLink
      href={item.company_url}
      className={`enter ${styles.card}`}
      style={{ animationDelay: staggerDelay(index) }}
    >
      <div className={styles.top}>
        <img
          className="logo"
          src={imageUrl(item.logo_path)}
          alt={`${item.company} logo`}
          loading="lazy"
        />
        <span className={`muted ${styles.ref}`}>
          {item.location}
          <br />
          {item.duration}
        </span>
      </div>
      <h3 className={`display ${styles.title}`}>
        {item.title}{" "}
        <span className={`arrow ${styles.arrow}`} aria-hidden="true">
          ↗
        </span>
      </h3>
      <p className="muted">{item.description}</p>
      <span className={styles.issuer}>{item.company}</span>
    </SmartLink>
  );
}

export function FeaturedResearch({
  section,
}: {
  readonly section: ResearchSection;
}) {
  return (
    <section className={styles.section} aria-label={section.title}>
      <h2 className="section-title">{section.title}</h2>
      <div className={styles.grid}>
        {section.research.map((item, index) => (
          <FeaturedCard key={item.title} item={item} index={index} />
        ))}
      </div>
    </section>
  );
}
