/**
 * File: projects.ts
 * Purpose: Validates the GitHub data written by git_data_fetcher.mjs before it reaches the UI, and
 *          picks the repositories to show: the ones chosen in the content, in that order, or the
 *          pinned ones when none are chosen.
 * Author: Akilesh
 * Date: 2026-10-20 (updated 2026-10-22)
 */
import type { Project, ProjectLanguage } from "../types/portfolio";
import { logger } from "./logger";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isString = (value: unknown): value is string => typeof value === "string";

const SAFE_URL = /^https:\/\//i;

function parseLanguages(value: unknown): ProjectLanguage[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter(isRecord)
    .flatMap((lang) => (isString(lang.name) ? [{ name: lang.name }] : []));
}

function parseProject(value: unknown): Project | null {
  if (!isRecord(value)) return null;
  const { id, name, createdAt, url, description, isFork, languages } = value;
  const { stars, isPinned } = value;
  if (!isString(id) || !isString(name) || !isString(url) || !SAFE_URL.test(url))
    return null;
  return {
    id,
    name,
    url,
    createdAt: isString(createdAt) ? createdAt : "",
    description: isString(description) ? description : "",
    isFork: isFork === true,
    stars: typeof stars === "number" && stars >= 0 ? stars : 0,
    /* Files written before the fetcher recorded this held pinned repositories only. */
    isPinned: isPinned !== false,
    languages: parseLanguages(languages),
  };
}

/** Accepts the fetcher's `{ data: [...] }` file and returns only well-formed projects, newest first. */
export function parseProjects(input: unknown): Project[] {
  const list = isRecord(input) && Array.isArray(input.data) ? input.data : [];
  const parsed = list.map(parseProject);
  const valid = parsed.filter(
    (project): project is Project => project !== null,
  );
  if (valid.length !== list.length) {
    logger.warn(
      "projects.parse",
      `dropped ${list.length - valid.length} malformed project(s)`,
    );
  }
  return valid.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** Chosen repositories by name, in the chosen order; the pinned ones when nothing is chosen. */
export function selectProjects(
  projects: readonly Project[],
  featured: readonly string[],
): Project[] {
  if (featured.length === 0)
    return projects.filter((project) => project.isPinned);
  const byName = new Map(projects.map((project) => [project.name, project]));
  return featured.flatMap((name) => {
    const project = byName.get(name);
    return project ? [project] : [];
  });
}
