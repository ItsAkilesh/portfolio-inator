/**
 * File: text.ts
 * Purpose: Pure text helpers used to present portfolio content.
 * Author: Akilesh
 * Date: 2026-10-20
 */
const LEADING_SYMBOLS = /^[^\p{L}\p{N}(]+/u;
const PROTOCOL = /^https?:\/\//i;
const TRAILING_SLASH = /\/$/;
const INDEX_WIDTH = 2;
const STAGGER_BASE_S = 0.04;
const STAGGER_STEP_S = 0.06;

/** Removes decorative leading bullets or emoji ("⚡ Built x" becomes "Built x"). */
export function stripLeadingSymbols(text: string): string {
  return text.replace(LEADING_SYMBOLS, "").trim();
}

/** Two-digit, one-based index label: 0 becomes "01". */
export function indexLabel(zeroBasedIndex: number): string {
  return String(zeroBasedIndex + 1).padStart(INDEX_WIDTH, "0");
}

/** CSS animation delay for the nth item of a staggered list. */
export function staggerDelay(index: number): string {
  return `${(STAGGER_BASE_S + Math.max(0, index) * STAGGER_STEP_S).toFixed(2)}s`;
}

/** Display form of a URL without protocol or trailing slash. */
export function displayUrl(url: string): string {
  return url.replace(PROTOCOL, "").replace(TRAILING_SLASH, "");
}

export interface AuthorParts {
  readonly before: string;
  readonly highlight: string;
  readonly after: string;
}

/** Splits an author list around the given name so it can be emphasized. */
export function splitAuthors(authors: string, name: string): AuthorParts {
  const at = name ? authors.indexOf(name) : -1;
  if (at < 0) return { before: authors, highlight: "", after: "" };
  return {
    before: authors.slice(0, at),
    highlight: name,
    after: authors.slice(at + name.length),
  };
}

/** First word and the remainder of a full name. */
export function splitName(fullName: string): { first: string; rest: string } {
  const [first = "", ...rest] = fullName.trim().split(/\s+/);
  return { first, rest: rest.join(" ") };
}

/** Year portion of an ISO date string, or an empty string when unparsable. */
export function yearOf(isoDate: string): string {
  const year = new Date(isoDate).getUTCFullYear();
  return Number.isNaN(year) ? "" : String(year);
}
