/**
 * File: PageBand.tsx
 * Purpose: Full-bleed accent header shared by every inner page: kicker, giant title, intro and optional portrait.
 * Author: Akilesh
 * Date: 2026-10-20
 */
import { useRef, type ReactNode } from "react";
import { useAccentUnderHeader } from "../../hooks/useInViewFlag";
import { imageUrl } from "../../lib/assets";
import { settings } from "../../portfolio";
import { DotField } from "../ui/DotField";
import styles from "./PageBand.module.css";

interface PageBandProps {
  readonly title: string;
  readonly kicker?: string;
  readonly description?: ReactNode;
  readonly image?: { readonly src: string; readonly alt: string };
}

export function PageBand({ title, kicker, description, image }: PageBandProps) {
  const bandRef = useRef<HTMLElement>(null);
  useAccentUnderHeader(bandRef);
  return (
    <section ref={bandRef} className={styles.band} aria-labelledby="page-title">
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
