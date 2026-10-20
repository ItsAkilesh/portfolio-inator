/**
 * File: projects.ts
 * Purpose: Validates the GitHub data written by git_data_fetcher.mjs before it reaches the UI.
 * Author: Akilesh
 * Date: 2026-10-20
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
  if (!isString(id) || !isString(name) || !isString(url) || !SAFE_URL.test(url))
    return null;
  return {
    id,
    name,
    url,
    createdAt: isString(createdAt) ? createdAt : "",
    description: isString(description) ? description : "",
    isFork: isFork === true,
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
