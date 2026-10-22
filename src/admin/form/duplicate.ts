/**
 * File: duplicate.ts
 * Purpose: Copies a list item for "Duplicate": a deep copy placed right after the original, with
 *          the fields its schema marks unique (a page's id and path) given a free "-copy" suffix. Pure.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import type { z } from "zod";
import { metaOf } from "../../content/introspect";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/** "about" to "about-copy", then "about-copy-2", ... whichever is not taken. */
export function freeCopyName(
  value: string,
  taken: ReadonlySet<string>,
): string {
  let candidate = `${value}-copy`;
  for (let n = 2; taken.has(candidate); n += 1)
    candidate = `${value}-copy-${n}`;
  return candidate;
}

export function duplicateAt(
  items: readonly unknown[],
  index: number,
  element: z.ZodType,
): unknown[] {
  const original = items[index];
  if (original === undefined) return [...items];
  const copy: unknown = structuredClone(original);
  if (isRecord(copy))
    for (const key of metaOf(element).uniqueKeys ?? []) {
      const value = copy[key];
      if (typeof value !== "string") continue;
      const taken = new Set(
        items.flatMap((item) =>
          isRecord(item) && typeof item[key] === "string"
            ? [item[key] as string]
            : [],
        ),
      );
      copy[key] = freeCopyName(value, taken);
    }
  return [...items.slice(0, index + 1), copy, ...items.slice(index + 1)];
}
