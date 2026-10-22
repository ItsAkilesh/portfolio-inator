/**
 * File: walk.ts
 * Purpose: Walks content together with its schema, so tools can find values by what they are rather
 *          than where they are: every image reference, every icon, every text field. Used by the
 *          admin search, the media library, health checks and the icon library. Pure; takes the
 *          schema as an argument and imports nothing but the schema reader.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import type { z } from "zod";
import {
  arrayElement,
  kindOf,
  metaOf,
  objectShape,
  optionFor,
  recordValue,
  type FieldKind,
} from "./introspect";

export type ContentPath = readonly (string | number)[];

export interface VisitedNode {
  readonly path: ContentPath;
  readonly schema: z.ZodType;
  readonly kind: FieldKind;
  readonly value: unknown;
  /** Titles of the fields from the root down, e.g. ["Pages", "Home", "Blocks", "Hero"]. */
  readonly trail: readonly string[];
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

function childrenOf(
  node: VisitedNode,
): { key: string | number; schema: z.ZodType; value: unknown }[] {
  const { schema, value } = node;
  switch (node.kind) {
    case "object":
      if (!isRecord(value)) return [];
      return Object.entries(objectShape(schema)).map(([key, child]) => ({
        key,
        schema: child,
        value: value[key],
      }));
    case "array":
      return Array.isArray(value)
        ? value.map((item, index) => ({
            key: index,
            schema: arrayElement(schema),
            value: item,
          }))
        : [];
    case "record":
      return isRecord(value)
        ? Object.entries(value).map(([key, item]) => ({
            key,
            schema: recordValue(schema),
            value: item,
          }))
        : [];
    case "union": {
      const option = optionFor(schema, value);
      return option
        ? childrenOf({ ...node, schema: option, kind: "object" })
        : [];
    }
    default:
      return [];
  }
}

function labelFor(
  schema: z.ZodType,
  key: string | number,
  value: unknown,
): string {
  const meta = metaOf(schema);
  const summary =
    meta.summaryKey && isRecord(value) ? value[meta.summaryKey] : undefined;
  if (typeof summary === "string" && summary.trim()) return summary;
  return meta.title ?? String(key);
}

/** Calls `visit` for every node, parents before children. Returning false skips a node's children. */
export function walkContent(
  schema: z.ZodType,
  value: unknown,
  visit: (node: VisitedNode) => boolean | void,
): void {
  const stack: VisitedNode[] = [
    { path: [], schema, kind: kindOf(schema), value, trail: [] },
  ];
  while (stack.length > 0) {
    const node = stack.pop() as VisitedNode; // non-empty: checked by the loop condition
    if (visit(node) === false) continue;
    const children = childrenOf(node).map((child) => ({
      path: [...node.path, child.key],
      schema: child.schema,
      kind: kindOf(child.schema),
      value: child.value,
      trail: [...node.trail, labelFor(child.schema, child.key, child.value)],
    }));
    stack.push(...children.reverse());
  }
}

/** Every value of fields with the given admin widget ("image", "icon", ...), with its path. */
export function valuesWithWidget(
  schema: z.ZodType,
  content: unknown,
  widget: string,
): { path: ContentPath; value: string }[] {
  const found: { path: ContentPath; value: string }[] = [];
  walkContent(schema, content, (node) => {
    if (metaOf(node.schema).widget === widget && typeof node.value === "string")
      found.push({ path: node.path, value: node.value });
  });
  return found;
}

/** How many times each value of a widget is used, e.g. image file name to count. */
export function usageCounts(
  schema: z.ZodType,
  content: unknown,
  widget: string,
): Map<string, number> {
  const counts = new Map<string, number>();
  for (const { value } of valuesWithWidget(schema, content, widget))
    if (value) counts.set(value, (counts.get(value) ?? 0) + 1);
  return counts;
}

/** Copy of `content` with every `widget` field equal to `from` set to `to` (immutable). */
export function replaceWidgetValue(
  schema: z.ZodType,
  content: unknown,
  widget: string,
  from: string,
  to: string,
): unknown {
  let next = content;
  for (const hit of valuesWithWidget(schema, content, widget))
    if (hit.value === from) next = setPath(next, hit.path, to);
  return next;
}

function setPath(root: unknown, path: ContentPath, value: unknown): unknown {
  const [key, ...rest] = path;
  if (key === undefined) return value;
  if (Array.isArray(root) && typeof key === "number") {
    const copy = [...root];
    copy[key] = setPath(root[key], rest, value);
    return copy;
  }
  if (isRecord(root))
    return { ...root, [key]: setPath(root[key], rest, value) };
  return root;
}
