/**
 * File: HomeHero.tsx
 * Purpose: Home page hero on the accent color: name sized to fit, summary, résumé link and social icons.
 * Author: Akilesh
 * Date: 2026-10-20
 */
import band from "../components/layout/PageBand.module.css";
import { DotField } from "../components/ui/DotField";
import { SmartLink } from "../components/ui/SmartLink";
import { FitWord } from "../components/ui/FitWord";
import { BrandIcon } from "../icons/BrandIcon";
import { splitName } from "../lib/text";
import { greeting, settings, socialMediaLinks, ui } from "../portfolio";
import styles from "./HomeHero.module.css";

const SOCIAL_ICON_SIZE = 19;
const FIRST_NAME_MAX_PX = 144;
const REST_NAME_MAX_PX = 96;

export function HomeHero() {
  const { first, rest } = splitName(greeting.title);
  return (
    <section className={band.band} aria-labelledby="hero-name">
      {settings.showDotField && <DotField />}
      <div className={`wrap ${styles.inner}`}>
        <h1 id="hero-name" className={`display ${styles.name}`}>
          <FitWord
            word={first}
            maxSize={FIRST_NAME_MAX_PX}
            className={styles.first}
          />
          {rest && (
            <FitWord
              word={rest}
              maxSize={REST_NAME_MAX_PX}
              className={styles.rest}
            />
          )}
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
