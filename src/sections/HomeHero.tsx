/**
 * File: HomeHero.tsx
 * Purpose: Home page hero on the accent color: stretching name, summary, résumé link and social icons.
 * Author: Akilesh
 * Date: 2026-10-20
 */
import band from "../components/layout/PageBand.module.css";
import { DotField } from "../components/ui/DotField";
import { SmartLink } from "../components/ui/SmartLink";
import { StretchWord } from "../components/ui/StretchWord";
import { BrandIcon } from "../icons/BrandIcon";
import { splitName } from "../lib/text";
import {
  greeting,
  research,
  settings,
  socialMediaLinks,
  ui,
} from "../portfolio";
import styles from "./HomeHero.module.css";

const SOCIAL_ICON_SIZE = 19;

function scholarLine(): string {
  const stats = research.scholarStats;
  return `${stats.citations} citations · h-index ${stats.hIndex} · i10-index ${stats.i10Index}`;
}

export function HomeHero() {
  const { first, rest } = splitName(greeting.title);
  return (
    <section className={band.band} aria-labelledby="hero-name">
      {settings.showDotField && <DotField />}
      <div className={`wrap ${styles.inner}`}>
        <div className={`mono enter ${styles.meta}`}>
          <span>( {greeting.nickname} )</span>
          <a
            href={research.scholarStats.profileUrl}
            className={styles.metaLink}
          >
            {scholarLine()}
          </a>
        </div>
        <h1 id="hero-name" className={`display ${styles.name}`}>
          <StretchWord word={first} className={styles.first} />
          <span className={`enter ${styles.rest}`}>{rest}</span>
        </h1>
        <div className={styles.footer}>
          <p className={`enter ${styles.summary}`}>{greeting.subTitle}</p>
          <div className={`enter ${styles.actions}`}>
            <SmartLink href={greeting.resumeLink} className={styles.pill}>
              {ui.resumeLabel}{" "}
              <span className="arrow" aria-hidden="true">
                ↗
              </span>
            </SmartLink>
            <div className={styles.socials}>
              {socialMediaLinks.map((item) => (
                <SmartLink
                  key={item.name}
                  href={item.link}
                  className={styles.social}
                  aria-label={item.name}
                  title={item.name}
                >
                  <BrandIcon name={item.icon} size={SOCIAL_ICON_SIZE} />
                </SmartLink>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
