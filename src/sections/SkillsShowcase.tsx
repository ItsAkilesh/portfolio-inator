/**
 * File: SkillsShowcase.tsx
 * Purpose: "What I do": every skill group gets its own block, alternating text and tool grid left and right.
 * Author: Akilesh
 * Date: 2026-10-20 (updated 2026-10-21)
 */
import { useId } from "react";
import { BrandIcon, brandStyle } from "../icons/BrandIcon";
import { stripLeadingSymbols } from "../lib/text";
import { skills } from "../portfolio";
import type { SkillGroup } from "../types/portfolio";
import styles from "./SkillsShowcase.module.css";

const TOOL_ICON_SIZE = 30;

function ToolGrid({ group }: { readonly group: SkillGroup }) {
  return (
    <ul
      className={`plain-list ${styles.specimen}`}
      aria-label={`${group.title} tools`}
    >
      {group.softwareSkills.map((tool) => (
        <li
          key={tool.skillName}
          className={styles.tile}
          style={brandStyle(tool.icon)}
        >
          <BrandIcon name={tool.icon} size={TOOL_ICON_SIZE} />
          <span>{tool.skillName}</span>
        </li>
      ))}
    </ul>
  );
}

interface SkillBlockProps {
  readonly group: SkillGroup;
  readonly index: number;
}

function SkillBlock({ group, index }: SkillBlockProps) {
  const titleId = useId();
  const isReversed = index % 2 === 1;
  return (
    <article
      className={`${styles.block} ${isReversed ? styles.reversed : ""}`}
      aria-labelledby={titleId}
    >
      <div className={styles.text}>
        <h3 id={titleId} className={`display ${styles.groupTitle}`}>
          {group.title}
        </h3>
        <ul className="bullets">
          {group.skills.map((point) => (
            <li key={point}>{stripLeadingSymbols(point)}</li>
          ))}
        </ul>
      </div>
      <ToolGrid group={group} />
    </article>
  );
}

export function SkillsShowcase({ title }: { readonly title: string }) {
  const titleId = useId();
  return (
    <section className={`wrap ${styles.section}`} aria-labelledby={titleId}>
      <div className={styles.head}>
        <h2 id={titleId} className={`display ${styles.title}`}>
          {title}
        </h2>
      </div>
      {skills.map((group, index) => (
        <SkillBlock key={group.title} group={group} index={index} />
      ))}
    </section>
  );
}
