/**
 * File: paths.ts
 * Purpose: Immutable read/update helpers for nested content addressed by a path of keys and indexes.
 *          Pure; the admin draft reducer is built on them.
 * Author: Akilesh
 * Date: 2026-10-21
 */
export type PathKey = string | number;
export type Path = readonly PathKey[];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export function getIn(root: unknown, path: Path): unknown {
  let node: unknown = root;
  for (const key of path) {
    if (Array.isArray(node) && typeof key === "number") node = node[key];
    else if (isRecord(node) && typeof key === "string") node = node[key];
    else return undefined;
  }
  return node;
}

function setAt(
  node: unknown,
  path: Path,
  depth: number,
  value: unknown,
): unknown {
  const key = path[depth];
  if (key === undefined) return value;
  if (
    Array.isArray(node) &&
    typeof key === "number" &&
    key >= 0 &&
    key < node.length
  ) {
    const copy = [...node];
    copy[key] = setAt(node[key], path, depth + 1, value);
    return copy;
  }
  if (isRecord(node) && typeof key === "string")
    return { ...node, [key]: setAt(node[key], path, depth + 1, value) };
  throw new Error(`No value at ${path.slice(0, depth + 1).join(".")}`);
}

/** Copy of `root` with the value at `path` replaced; missing parents are an error. */
export const setIn = (root: unknown, path: Path, value: unknown): unknown =>
  setAt(root, path, 0, value);

/** Array without the item at `index`. */
export const removeAt = <T>(items: readonly T[], index: number): T[] =>
  items.filter((_, i) => i !== index);

/** Array with the item at `from` moved to `to`; out-of-range moves return a copy unchanged. */
export function moveItem<T>(
  items: readonly T[],
  from: number,
  to: number,
): T[] {
  const copy = [...items];
  if (from < 0 || from >= copy.length || to < 0 || to >= copy.length)
    return copy;
  const [item] = copy.splice(from, 1);
  if (item !== undefined) copy.splice(to, 0, item);
  return copy;
}

/** Object with `from` renamed to `to`, keeping key order; refuses to overwrite an existing key. */
export function renameKey(
  record: Readonly<Record<string, unknown>>,
  from: string,
  to: string,
): Record<string, unknown> {
  if (from === to || !(from in record) || to in record) return { ...record };
  return Object.fromEntries(
    Object.entries(record).map(([k, v]) => [k === from ? to : k, v]),
  );
}

export const pathId = (path: Path): string => path.join(".");
