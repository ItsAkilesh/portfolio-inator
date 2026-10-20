/**
 * File: SkillsShowcase.tsx
 * Purpose: "What I do": a tab list of skill groups beside the active group's points and a tool specimen grid.
 * Author: Akilesh
 * Date: 2026-10-20
 */
import { useId, useState } from "react";
import { BrandIcon, brandStyle } from "../icons/BrandIcon";
import { indexLabel, stripLeadingSymbols } from "../lib/text";
import { skills, ui } from "../portfolio";
import type { SkillGroup } from "../types/portfolio";
import styles from "./SkillsShowcase.module.css";

const TOOL_ICON_SIZE = 30;

function ToolGrid({ group }: { readonly group: SkillGroup }) {
  return (
    <ul className={`plain-list ${styles.specimen}`}>
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

interface SkillTabsProps {
  readonly baseId: string;
  readonly active: number;
  readonly onSelect: (index: number) => void;
}

function SkillTabs({ baseId, active, onSelect }: SkillTabsProps) {
  return (
    <div role="tablist" aria-label={ui.skillsTitle} className={styles.tabs}>
      {skills.data.map((item, index) => (
        <button
          key={item.title}
          id={`${baseId}-tab-${index}`}
          type="button"
          role="tab"
          aria-selected={index === active}
          aria-controls={`${baseId}-panel`}
          className={
            index === active ? `${styles.tab} ${styles.on}` : styles.tab
          }
          onClick={() => onSelect(index)}
        >
          <span className={`mono ${styles.num}`}>{indexLabel(index)}</span>
          <span className={`display ${styles.tabTitle}`}>{item.title}</span>
        </button>
      ))}
    </div>
  );
}

export function SkillsShowcase() {
  const [active, setActive] = useState(0);
  const baseId = useId();
  const group = skills.data[active];
  const toolCount = skills.data.reduce(
    (total, g) => total + g.softwareSkills.length,
    0,
  );

  return (
    <section
      className={`wrap ${styles.section}`}
      aria-labelledby={`${baseId}-title`}
    >
      <div className={styles.head}>
        <h2 id={`${baseId}-title`} className={`display ${styles.title}`}>
          {ui.skillsTitle}
        </h2>
        <span className="mono muted">
          {toolCount} {ui.toolsLabel}
        </span>
      </div>
      <div className={styles.body}>
        <SkillTabs baseId={baseId} active={active} onSelect={setActive} />
        {group && (
          <div
            key={active}
            id={`${baseId}-panel`}
            role="tabpanel"
            aria-labelledby={`${baseId}-tab-${active}`}
            className={`enter ${styles.panel}`}
          >
            <ul className="bullets">
              {group.skills.map((point) => (
                <li key={point}>{stripLeadingSymbols(point)}</li>
              ))}
            </ul>
            <ToolGrid group={group} />
          </div>
        )}
      </div>
    </section>
  );
}
