/**
 * File: ResearchCards.tsx
 * Purpose: Google Scholar and ResearchGate profile cards (logo, name, three headline numbers), each
 *          linking to the profile. Numbers come from portfolio.ts, refreshed at dev/build time.
 * Author: Akilesh
 * Date: 2026-10-20
 */
import { SmartLink } from "../components/ui/SmartLink";
import type { IconKey } from "../icons/registry";
import { BrandIcon } from "../icons/BrandIcon";
import { research, ui } from "../portfolio";
import styles from "./ResearchCards.module.css";

const LOGO_SIZE = 18;

interface CardStat {
  readonly label: string;
  readonly value: number;
}

interface ProfileCard {
  readonly name: string;
  readonly icon: IconKey;
  readonly href: string;
  readonly stats: readonly CardStat[];
}

/** Builds the two cards from config; exported for tests. */
export function profileCards(): readonly ProfileCard[] {
  const { scholarStats: scholar, researchGateStats: gate } = research;
  const labels = ui.researchCards;
  return [
    {
      name: labels.scholar,
      icon: "googlescholar",
      href: scholar.profileUrl,
      stats: [
        { label: labels.citations, value: scholar.citations },
        { label: labels.hIndex, value: scholar.hIndex },
        { label: labels.i10Index, value: scholar.i10Index },
      ],
    },
    {
      name: labels.researchGate,
      icon: "researchgate",
      href: gate.profileUrl,
      stats: [
        { label: labels.interestScore, value: gate.interestScore },
        { label: labels.citations, value: gate.citations },
        { label: labels.hIndex, value: gate.hIndex },
      ],
    },
  ];
}

function Card({ card }: { readonly card: ProfileCard }) {
  return (
    <SmartLink href={card.href} className={`frost ${styles.card}`}>
      <span className={styles.head}>
        <BrandIcon name={card.icon} size={LOGO_SIZE} />
        {card.name}
        <span className={`arrow ${styles.arrow}`} aria-hidden="true">
          ↗
        </span>
      </span>
      <dl className={styles.stats}>
        {card.stats.map((stat) => (
          <div key={stat.label} className={styles.stat}>
            <dt className={styles.label}>{stat.label}</dt>
            <dd className={styles.value}>{stat.value}</dd>
          </div>
        ))}
      </dl>
    </SmartLink>
  );
}

export function ResearchCards({
  className = "",
}: {
  readonly className?: string;
}) {
  return (
    <div className={`${styles.cards} ${className}`}>
      {profileCards().map((card) => (
        <Card key={card.name} card={card} />
      ))}
    </div>
  );
}
