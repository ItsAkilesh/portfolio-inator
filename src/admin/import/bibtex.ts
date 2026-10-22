/**
 * File: bibtex.ts
 * Purpose: Reads BibTeX (what Google Scholar, ORCID and reference managers export) and turns entries
 *          into publication entries for the content: title, authors, venue, date and a DOI or URL
 *          link. Handles braced and quoted values, nested braces, and common LaTeX escapes. Pure.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import { parseDate } from "../../lib/dates";

export interface BibEntry {
  readonly type: string;
  readonly key: string;
  readonly fields: Readonly<Record<string, string>>;
}

const SKIPPED_TYPES: ReadonlySet<string> = new Set([
  "comment",
  "string",
  "preamble",
]);
const MONTHS = [
  "jan",
  "feb",
  "mar",
  "apr",
  "may",
  "jun",
  "jul",
  "aug",
  "sep",
  "oct",
  "nov",
  "dec",
];
const ACCENTS: Readonly<Record<string, string>> = {
  '"a': "ä",
  '"o': "ö",
  '"u': "ü",
  "'e": "é",
  "`e": "è",
  "'a": "á",
  "'o": "ó",
  "'i": "í",
  "~n": "ñ",
  "c c": "ç",
};

/** Reads one value starting at `start` (a { or " delimited value, or a bare word/number). */
function readValue(
  text: string,
  start: number,
): { value: string; end: number } {
  const open = text[start];
  if (open === "{" || open === '"') {
    let depth = 0;
    for (let i = start; i < text.length; i += 1) {
      const c = text[i];
      if (c === "{") depth += 1;
      else if (c === "}") depth -= 1;
      if (
        (open === "{" && depth === 0) ||
        (open === '"' && i > start && c === '"' && depth === 0)
      )
        return { value: text.slice(start + 1, i), end: i + 1 };
    }
    return { value: text.slice(start + 1), end: text.length };
  }
  const match = /^[^,}\s]+/.exec(text.slice(start));
  return { value: match?.[0] ?? "", end: start + (match?.[0].length ?? 0) };
}

function readFields(body: string): Record<string, string> {
  const fields: Record<string, string> = {};
  const name = /\s*,?\s*([A-Za-z][\w-]*)\s*=\s*/y;
  let index = 0;
  for (;;) {
    name.lastIndex = index;
    const m = name.exec(body);
    if (!m?.[1]) break;
    const { value, end } = readValue(body, name.lastIndex);
    fields[m[1].toLowerCase()] = value;
    index = end;
  }
  return fields;
}

/** Top-level entries: "@type{key, field = value, ...}". */
export function parseBibtex(text: string): BibEntry[] {
  const entries: BibEntry[] = [];
  const start = /@(\w+)\s*\{\s*([^,\s]*)\s*,/g;
  for (let m = start.exec(text); m; m = start.exec(text)) {
    const type = (m[1] ?? "").toLowerCase();
    const open = text.indexOf("{", m.index);
    const { value: inner, end } = readValue(text, open);
    start.lastIndex = end;
    if (SKIPPED_TYPES.has(type)) continue;
    entries.push({
      type,
      key: m[2] ?? "",
      fields: readFields(inner.slice(inner.indexOf(",") + 1)),
    });
  }
  return entries;
}

/** LaTeX to plain text: accents, escapes, braces and spacing. */
export function cleanTex(value: string): string {
  return value
    .replace(
      /\{?\\([`'"~^]|c )\{?([a-zA-Z])\}?\}?/g,
      (_match: string, mark: string, letter: string) => {
        const accented = ACCENTS[`${mark}${letter.toLowerCase()}`];
        if (!accented) return letter;
        return letter === letter.toUpperCase()
          ? accented.toUpperCase()
          : accented;
      },
    )
    .replace(/\\&/g, "&")
    .replace(/\\[%$_#]/g, (s) => s.slice(1))
    .replace(/\\[a-zA-Z]+\s*/g, "")
    .replace(/[{}]/g, "")
    .replace(/~/g, " ")
    .replace(/-{2,3}/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

/** "Last, First and First Last" to "First Last, First Last". */
export function formatAuthors(value: string): string {
  return cleanTex(value)
    .split(/\s+and\s+/i)
    .map((name) => {
      const [last, first] = name.split(",").map((p) => p.trim());
      return first ? `${first} ${last}` : (last ?? "");
    })
    .filter(Boolean)
    .join(", ");
}

/** "2023" plus an optional month ("mar", "3", "March") to "2023" or "2023-03". */
export function bibDate(
  year: string | undefined,
  month: string | undefined,
): string {
  const y = (year ?? "").match(/\d{4}/)?.[0];
  if (!y) return "";
  const m = (month ?? "").trim().toLowerCase();
  const index = /^\d{1,2}$/.test(m)
    ? Number(m)
    : MONTHS.indexOf(m.slice(0, 3)) + 1;
  const value =
    index >= 1 && index <= 12 ? `${y}-${String(index).padStart(2, "0")}` : y;
  return parseDate(value) ? value : "";
}

export function venueOf(fields: Readonly<Record<string, string>>): string {
  return cleanTex(
    fields.journal ??
      fields.booktitle ??
      fields.publisher ??
      fields.howpublished ??
      fields.school ??
      fields.institution ??
      "",
  );
}

export function linkOf(fields: Readonly<Record<string, string>>): string {
  const doi = cleanTex(fields.doi ?? "").replace(
    /^https?:\/\/(dx\.)?doi\.org\//i,
    "",
  );
  if (doi) return `https://doi.org/${doi}`;
  const url = cleanTex(fields.url ?? "");
  return /^https?:\/\//.test(url) ? url : "";
}

/** A publication entry for the content; `logo` is an image from public/images. */
export function toPublication(entry: BibEntry, logo: string) {
  const f = entry.fields;
  return {
    title: cleanTex(f.title ?? entry.key),
    company: formatAuthors(f.author ?? ""),
    company_url: linkOf(f),
    logo_path: logo,
    dates: {
      label: "",
      start: bibDate(f.year, f.month),
      end: "",
      isEndExpected: false,
    },
    location: venueOf(f),
    description: cleanTex(f.abstract ?? ""),
  };
}
