/**
 * File: PageBand.tsx
 * Purpose: Full-bleed accent header shared by every inner page: kicker, giant title, intro,
 *          optional extra content below the intro (children) and optional portrait.
 * Author: Akilesh
 * Date: 2026-10-20
 */
import type { ReactNode } from "react";
import { imageUrl } from "../../lib/assets";
import { settings } from "../../portfolio";
import { DotField } from "../ui/DotField";
import styles from "./PageBand.module.css";

interface PageBandProps {
  readonly title: string;
  readonly kicker?: string;
  readonly description?: ReactNode;
  readonly image?: { readonly src: string; readonly alt: string };
  /** Block content below the intro, such as cards (a paragraph cannot hold it). */
  readonly children?: ReactNode;
}

export function PageBand({
  title,
  kicker,
  description,
  image,
  children,
}: PageBandProps) {
  return (
    <section className={styles.band} aria-labelledby="page-title">
      {settings.showDotField && <DotField />}
      <div className={`wrap ${styles.inner}`}>
        <div className={styles.text}>
          {kicker && (
            <span className={`mono enter ${styles.kicker}`}>{kicker}</span>
          )}
          <h1 id="page-title" className={`display ${styles.title}`}>
            {title}
          </h1>
          {description && (
            <p className={`enter ${styles.description}`}>{description}</p>
          )}
          {children && <div className={styles.extra}>{children}</div>}
        </div>
        {image && (
          <img
            className={`enter ${styles.portrait}`}
            src={imageUrl(image.src)}
            alt={image.alt}
          />
        )}
      </div>
    </section>
  );
}
