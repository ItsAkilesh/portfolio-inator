/**
 * File: HomeHero.tsx
 * Purpose: Home page hero on the accent color: name, summary, call-to-action buttons and social icons
 *          on the left; a rotating cloud of skill icons on the right. Flags its visibility so the
 *          header can hide its logo.
 * Author: Akilesh
 * Date: 2026-10-20
 */
import { useRef } from "react";
import band from "../components/layout/PageBand.module.css";
import { DotField } from "../components/ui/DotField";
import { FitWord } from "../components/ui/FitWord";
import { IconCloud } from "../components/ui/IconCloud";
import { SmartLink } from "../components/ui/SmartLink";
import { useInViewFlag } from "../hooks/useInViewFlag";
import { BrandIcon } from "../icons/BrandIcon";
import { splitName } from "../lib/text";
import { greeting, settings, skills, socialMediaLinks, ui } from "../portfolio";
import styles from "./HomeHero.module.css";

const SOCIAL_ICON_SIZE = 19;
const FIRST_NAME_MAX_PX = 112;
const REST_NAME_MAX_PX = 72;
/** Read by Header.module.css to hide the header logo while the hero shows the name. */
export const HERO_IN_VIEW_ATTRIBUTE = "data-hero-in-view";

const SKILL_ICONS = skills.data.flatMap((group) =>
  group.softwareSkills.map((tool) => tool.icon),
);

function HeroActions() {
  return (
    <div className={`enter ${styles.actions}`}>
      <div className={styles.buttons}>
        <SmartLink href={greeting.resumeLink} className={styles.pill}>
          {ui.resumeLabel}{" "}
          <span className="arrow" aria-hidden="true">
            ↗
          </span>
        </SmartLink>
        <SmartLink href={greeting.connectLink} className={styles.ghost}>
          {ui.connectLabel}{" "}
          <span className="arrow" aria-hidden="true">
            ↗
          </span>
        </SmartLink>
      </div>
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
  );
}

export function HomeHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const { first, rest } = splitName(greeting.title);
  useInViewFlag(sectionRef, HERO_IN_VIEW_ATTRIBUTE);
  return (
    <section ref={sectionRef} className={band.band} aria-labelledby="hero-name">
      {settings.showDotField && <DotField />}
      <div className={`wrap ${styles.inner}`}>
        <div className={styles.copy}>
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
          <p className={`enter ${styles.summary}`}>{greeting.subTitle}</p>
          <HeroActions />
        </div>
        <IconCloud icons={SKILL_ICONS} className={styles.cloud} />
      </div>
    </section>
  );
}
