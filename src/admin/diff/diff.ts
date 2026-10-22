/**
 * File: diff.ts
 * Purpose: Differences between the saved content and the draft, as a flat list of changed leaves
 *          (or whole items added or removed), for the "Review changes" dialog. Lists are compared by
 *          position, which matches how the editor changes them. Pure.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import type { Path } from "../paths";

export type ChangeKind = "added" | "removed" | "changed";

export interface Change {
  readonly path: Path;
  readonly kind: ChangeKind;
  readonly before: unknown;
  readonly after: unknown;
}

export const MAX_CHANGES = 500;

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

function keysOf(a: unknown, b: unknown): (string | number)[] {
  if (Array.isArray(a) && Array.isArray(b))
    return Array.from({ length: Math.max(a.length, b.length) }, (_, i) => i);
  if (isObject(a) && isObject(b))
    return [...new Set([...Object.keys(a), ...Object.keys(b)])];
  return [];
}

const childOf = (value: unknown, key: string | number): unknown =>
  Array.isArray(value)
    ? value[key as number]
    : isObject(value)
      ? value[key as string]
      : undefined;

const hasKey = (value: unknown, key: string | number): boolean =>
  Array.isArray(value)
    ? (key as number) < value.length
    : isObject(value) && key in value;

export function diffContent(
  before: unknown,
  after: unknown,
  limit = MAX_CHANGES,
): Change[] {
  const changes: Change[] = [];
  const visit = (a: unknown, b: unknown, path: Path) => {
    if (changes.length >= limit || a === b) return;
    const keys = keysOf(a, b);
    if (
      keys.length === 0 &&
      !(Array.isArray(a) && Array.isArray(b)) &&
      !(isObject(a) && isObject(b))
    ) {
      if (JSON.stringify(a) !== JSON.stringify(b))
        changes.push({ path, kind: "changed", before: a, after: b });
      return;
    }
    for (const key of keys) {
      const [x, y] = [childOf(a, key), childOf(b, key)];
      if (!hasKey(a, key))
        changes.push({
          path: [...path, key],
          kind: "added",
          before: undefined,
          after: y,
        });
      else if (!hasKey(b, key))
        changes.push({
          path: [...path, key],
          kind: "removed",
          before: x,
          after: undefined,
        });
      else visit(x, y, [...path, key]);
    }
  };
  visit(before, after, []);
  return changes.slice(0, limit);
}

/** Short text for a value in the review list. */
export function previewValue(value: unknown, max = 80): string {
  if (value === undefined) return "";
  const text = typeof value === "string" ? value : JSON.stringify(value);
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}
