/**
 * File: ProjectList.tsx
 * Purpose: GitHub projects as large linked rows with year, fork status and language icons.
 * Author: Akilesh
 * Date: 2026-10-20
 */
import { SmartLink } from "../components/ui/SmartLink";
import { BrandIcon } from "../icons/BrandIcon";
import { FALLBACK_ICON, type IconKey } from "../icons/registry";
import { staggerDelay, yearOf } from "../lib/text";
import { languageIcons } from "../portfolio";
import type { Project } from "../types/portfolio";
import styles from "./Lists.module.css";

const LANGUAGE_ICON_SIZE = 15;
const FORK_LABEL = "Fork";
const ORIGINAL_LABEL = "Original";

export const iconForLanguage = (name: string): IconKey =>
  languageIcons[name] ?? FALLBACK_ICON;

function LanguageList({ project }: { readonly project: Project }) {
  return (
    <ul className={`plain-list ${styles.languages}`} aria-label="Languages">
      {project.languages.map((language) => (
        <li key={language.name}>
          <BrandIcon
            name={iconForLanguage(language.name)}
            size={LANGUAGE_ICON_SIZE}
          />
          {language.name}
        </li>
      ))}
    </ul>
  );
}

function ProjectRow({ project }: { readonly project: Project }) {
  return (
    <SmartLink
      href={project.url}
      className={`hover-row ${styles.item} ${styles.rowLink}`}
    >
      <div className={styles.aside}>
        <span className={styles.meta}>{yearOf(project.createdAt)}</span>
        <span className={`muted ${styles.meta}`}>
          {project.isFork ? FORK_LABEL : ORIGINAL_LABEL}
        </span>
      </div>
      <div className={styles.main}>
        <h2 className={`display ${styles.bigTitle}`}>
          {project.name}{" "}
          <span className="arrow" aria-hidden="true">
            ↗
          </span>
        </h2>
        <p className={`muted ${styles.description}`}>{project.description}</p>
        <LanguageList project={project} />
      </div>
    </SmartLink>
  );
}

export function ProjectList({ items }: { readonly items: readonly Project[] }) {
  return (
    <ol className={`plain-list ${styles.list}`}>
      {items.map((project, index) => (
        <li
          key={project.id}
          className="enter"
          style={{ animationDelay: staggerDelay(index) }}
        >
          <ProjectRow project={project} />
        </li>
      ))}
    </ol>
  );
}
