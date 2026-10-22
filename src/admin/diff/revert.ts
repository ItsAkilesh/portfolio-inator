/**
 * File: revert.ts
 * Purpose: Undoes one reviewed change in the draft: restores a changed value, removes an added item
 *          or puts a removed one back. Returns the edit to apply (a path and its new value). Pure.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import { getIn, removeAt, type Path } from "../paths";
import type { Change } from "./diff";

export interface Edit {
  readonly path: Path;
  readonly value: unknown;
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export function revertEdit(draft: unknown, change: Change): Edit | null {
  if (change.kind === "changed")
    return { path: change.path, value: change.before };
  const parentPath = change.path.slice(0, -1);
  const key = change.path[change.path.length - 1];
  const parent = getIn(draft, parentPath);
  if (key === undefined) return null;
  if (Array.isArray(parent) && typeof key === "number") {
    if (change.kind === "added")
      return { path: parentPath, value: removeAt(parent, key) };
    const copy = [...parent];
    copy.splice(Math.min(key, copy.length), 0, change.before);
    return { path: parentPath, value: copy };
  }
  if (isObject(parent) && typeof key === "string") {
    if (change.kind === "added")
      return {
        path: parentPath,
        value: Object.fromEntries(
          Object.entries(parent).filter(([k]) => k !== key),
        ),
      };
    return { path: parentPath, value: { ...parent, [key]: change.before } };
  }
  return null;
}
