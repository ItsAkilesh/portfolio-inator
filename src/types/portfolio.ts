/**
 * File: portfolio.ts
 * Purpose: Types for every section of the portfolio config in src/portfolio/.
 * Author: Akilesh
 * Date: 2026-10-20
 */
import type { IconKey } from "../icons/registry";

export interface Settings {
  /** Shows the name intro once per browser session. */
  readonly isSplash: boolean;
  /** Animated dot field behind page headers. */
  readonly showDotField: boolean;
  /** Google Scholar and ResearchGate cards under the icon cloud in the home hero. */
  readonly showResearchCards: boolean;
}

export interface Seo {
  readonly title: string;
  readonly description: string;
}

export interface Greeting {
  readonly title: string;
  readonly logo_name: string;
  readonly nickname: string;
  readonly subTitle: string;
  readonly resumeLink: string;
  readonly githubProfile: string;
  /** Target of the secondary hero button, e.g. a LinkedIn profile. */
  readonly connectLink: string;
}

export interface LinkItem {
  readonly name: string;
  /** External URL, mailto:/tel: link, or an internal route such as "/home". */
  readonly link: string;
  readonly icon: IconKey;
}

export interface SoftwareSkill {
  readonly skillName: string;
  readonly icon: IconKey;
}

export interface SkillGroup {
  readonly title: string;
  readonly skills: readonly string[];
  readonly softwareSkills: readonly SoftwareSkill[];
}

export interface PageHeader {
  readonly title: string;
  readonly subtitle: string;
  readonly description: string;
}

export interface Degree {
  readonly title: string;
  readonly subtitle: string;
  readonly logo_path: string;
  readonly alt_name: string;
  readonly duration: string;
  readonly descriptions: readonly string[];
  readonly website_link: string;
}

/** Used for jobs, volunteering, patents and publications alike. */
export interface TimelineEntry {
  readonly title: string;
  readonly company: string;
  readonly company_url: string;
  readonly logo_path: string;
  readonly duration: string;
  readonly location: string;
  readonly description: string;
}

export interface ExperienceSection {
  readonly title: string;
  readonly experiences: readonly TimelineEntry[];
}

export interface ResearchSection {
  readonly title: string;
  /** "featured" renders large blocks (patents); "list" renders a filterable bibliography. */
  readonly layout: "featured" | "list";
  readonly research: readonly TimelineEntry[];
}

export interface ScholarStats {
  readonly citations: number;
  readonly hIndex: number;
  readonly i10Index: number;
  readonly profileUrl: string;
}

export interface ResearchGateStats {
  readonly interestScore: number;
  readonly citations: number;
  readonly hIndex: number;
  readonly profileUrl: string;
}

export interface ProjectLanguage {
  readonly name: string;
}

/** Shape written by git_data_fetcher.mjs to src/shared/opensource/projects.json. */
export interface Project {
  readonly id: string;
  readonly name: string;
  readonly createdAt: string;
  readonly url: string;
  readonly description: string;
  readonly isFork: boolean;
  readonly languages: readonly ProjectLanguage[];
}

export interface NavItem {
  readonly path: string;
  readonly label: string;
}

export interface UiCopy {
  readonly skillsTitle: string;
  readonly resumeLabel: string;
  readonly connectLabel: string;
  readonly moreProjectsLabel: string;
  readonly readSummary: string;
  readonly hideSummary: string;
  readonly allFilter: string;
  readonly footer: string;
  readonly notFoundTitle: string;
  readonly notFoundText: string;
  readonly researchCards: ResearchCardLabels;
}

/** Labels on the home hero research-profile cards. */
export interface ResearchCardLabels {
  readonly scholar: string;
  readonly researchGate: string;
  readonly citations: string;
  readonly hIndex: string;
  readonly i10Index: string;
  readonly interestScore: string;
}
