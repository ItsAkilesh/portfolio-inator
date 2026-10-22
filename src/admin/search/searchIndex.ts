/**
 * File: searchIndex.ts
 * Purpose: Index for the admin search (Ctrl/Cmd+K): every section and tool by name, and every text
 *          or number in the content with where it lives. Matching needs every typed word to appear
 *          in the entry; sections rank first, then fields whose value starts with the query. Pure.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import type { z } from "zod";
import { walkContent, type ContentPath } from "../../content/walk";
import { ADMIN_SECTIONS } from "../sections";

export interface SearchEntry {
  readonly kind: "section" | "field";
  /** Section id for sections; unused for fields. */
  readonly sectionId?: string;
  readonly path?: ContentPath;
  readonly title: string;
  readonly detail: string;
  readonly haystack: string;
}

export const MAX_RESULTS = 30;
const MAX_DETAIL = 90;
const SKIPPED_KEYS: ReadonlySet<string | number> = new Set(["$schema"]);

const clip = (text: string): string =>
  text.length > MAX_DETAIL ? `${text.slice(0, MAX_DETAIL - 1)}…` : text;

function sectionEntries(): SearchEntry[] {
  return ADMIN_SECTIONS.map((section) => ({
    kind: "section",
    sectionId: section.id,
    title: section.label,
    detail: `${section.group} · ${section.kind === "tool" ? "Tool" : "Section"}`,
    haystack: `${section.label} ${section.group}`.toLowerCase(),
  }));
}

export function buildIndex(schema: z.ZodType, content: unknown): SearchEntry[] {
  const fields: SearchEntry[] = [];
  walkContent(schema, content, (node) => {
    if (SKIPPED_KEYS.has(node.path[0] ?? "")) return false;
    if (typeof node.value !== "string" && typeof node.value !== "number")
      return undefined;
    const text = String(node.value);
    if (!text.trim()) return undefined;
    const title = node.trail.join(" › ");
    fields.push({
      kind: "field",
      path: node.path,
      title,
      detail: clip(text),
      haystack: `${title} ${text}`.toLowerCase(),
    });
    return undefined;
  });
  return [...sectionEntries(), ...fields];
}

function score(entry: SearchEntry, query: string): number {
  const value = entry.detail.toLowerCase();
  if (entry.kind === "section")
    return entry.title.toLowerCase().startsWith(query) ? 0 : 1;
  if (value.startsWith(query)) return 2;
  return value.includes(query) ? 3 : 4;
}

export function searchIndex(
  index: readonly SearchEntry[],
  query: string,
  limit = MAX_RESULTS,
): SearchEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return index.filter((e) => e.kind === "section").slice(0, limit);
  const words = q.split(/\s+/);
  return index
    .filter((entry) => words.every((word) => entry.haystack.includes(word)))
    .map((entry) => ({ entry, rank: score(entry, q) }))
    .sort((a, b) => a.rank - b.rank)
    .slice(0, limit)
    .map((hit) => hit.entry);
}
