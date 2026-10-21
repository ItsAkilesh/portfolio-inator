/**
 * File: HomeHero.tsx
 * Purpose: Home page hero on the accent color: name, summary, call-to-action buttons and social icons
 *          on the left; a rotating cloud of skill icons with research-profile cards below it on the
 *          right. Flags its visibility so the header can hide its logo.
 * Author: Akilesh
 * Date: 2026-10-20 (updated 2026-10-21)
 */
import { useRef } from "react";
import band from "../components/layout/PageBand.module.css";
import { DotField } from "../components/ui/DotField";
import { FitWord } from "../components/ui/FitWord";
import { IconCloud } from "../components/ui/IconCloud";
import { SmartLink } from "../components/ui/SmartLink";
import { useInViewFlag } from "../hooks/useInViewFlag";
import { ResearchCards } from "./ResearchCards";
import { BrandIcon } from "../icons/BrandIcon";
import { splitName } from "../lib/text";
import { profile, settings, skills, socialLinks } from "../portfolio";
import styles from "./HomeHero.module.css";

const SOCIAL_ICON_SIZE = 19;
const FIRST_NAME_MAX_PX = 112;
const REST_NAME_MAX_PX = 72;
/** Read by Header.module.css to hide the header logo while the hero shows the name. */
export const HERO_IN_VIEW_ATTRIBUTE = "data-hero-in-view";

const SKILL_ICONS = skills.flatMap((group) =>
  group.softwareSkills.map((tool) => tool.icon),
);

function HeroActions() {
  return (
    <div className={`enter ${styles.actions}`}>
      <div className={styles.buttons}>
        <SmartLink href={profile.resumeLink} className={styles.pill}>
          {profile.resumeLabel}{" "}
          <span className="arrow" aria-hidden="true">
            ↗
          </span>
        </SmartLink>
        <SmartLink
          href={profile.connectLink}
          className={`frost ${styles.ghost}`}
        >
          {profile.connectLabel}{" "}
          <span className="arrow" aria-hidden="true">
            ↗
          </span>
        </SmartLink>
      </div>
      <div className={styles.socials}>
        {socialLinks.map((item) => (
          <SmartLink
            key={item.name}
            href={item.link}
            className={`frost ${styles.social}`}
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

interface HomeHeroProps {
  /** Google Scholar and ResearchGate cards under the icon cloud. */
  readonly showResearchCards: boolean;
}

export function HomeHero({ showResearchCards }: HomeHeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const { first, rest } = splitName(profile.title);
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
          <p className={`enter ${styles.summary}`}>{profile.subTitle}</p>
          <HeroActions />
        </div>
        <div className={styles.aside}>
          <IconCloud icons={SKILL_ICONS} className={styles.cloud} />
          {showResearchCards && (
            <ResearchCards className={`enter ${styles.cards}`} />
          )}
        </div>
      </div>
    </section>
  );
}
