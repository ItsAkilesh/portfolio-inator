/**
 * File: DegreeList.tsx
 * Purpose: Degrees with logo, dates, program and highlights. Used by the Education page.
 * Author: Akilesh
 * Date: 2026-10-20
 */
import { SmartLink } from "../components/ui/SmartLink";
import { imageUrl } from "../lib/assets";
import { displayUrl, staggerDelay, stripLeadingSymbols } from "../lib/text";
import type { Degree } from "../types/portfolio";
import styles from "./Lists.module.css";

const LOGO_SIZE = { width: 72, height: 72, borderRadius: 18 } as const;

export function DegreeList({ items }: { readonly items: readonly Degree[] }) {
  return (
    <ol className={`plain-list ${styles.list}`}>
      {items.map((degree, index) => (
        <li
          key={degree.title}
          className={`enter ${styles.item}`}
          style={{ animationDelay: staggerDelay(index) }}
        >
          <div className={styles.aside}>
            <img
              className="logo"
              style={LOGO_SIZE}
              src={imageUrl(degree.logo_path)}
              alt={`${degree.alt_name} logo`}
            />
            <span className="mono">{degree.duration}</span>
          </div>
          <div className={styles.main}>
            <h2 className={`display ${styles.bigTitle}`}>{degree.title}</h2>
            <p>
              <strong>{degree.subtitle}</strong>
            </p>
            <ul className="bullets muted">
              {degree.descriptions.map((line) => (
                <li key={line}>{stripLeadingSymbols(line)}</li>
              ))}
            </ul>
            <SmartLink href={degree.website_link}>
              {displayUrl(degree.website_link)}{" "}
              <span className="arrow" aria-hidden="true">
                ↗
              </span>
            </SmartLink>
          </div>
        </li>
      ))}
    </ol>
  );
}
