/**
 * File: describePath.ts
 * Purpose: Human-readable location of a field, e.g. "Pages › Experience › Blocks › Timeline", built
 *          from the schema's titles and each list item's summary. Used wherever a path is shown.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import type { z } from "zod";
import { kindOf, schemaAt, titleOf } from "../content/introspect";
import { portfolioSchema } from "../content/schema";
import { summaryOf } from "./form/listParts";
import { getIn, type Path } from "./paths";

const SEPARATOR = " › ";

function partLabel(
  parent: z.ZodType | undefined,
  child: z.ZodType | undefined,
  key: string | number,
  value: unknown,
): string {
  if (!child) return String(key);
  const parentKind = parent ? kindOf(parent) : "unknown";
  if (parentKind === "array" && typeof key === "number")
    return summaryOf(child, value, key);
  if (parentKind === "record") return String(key);
  return titleOf(child, key);
}

export function describePath(
  path: Path,
  root: unknown,
  schema: z.ZodType = portfolioSchema,
): string {
  const parts: string[] = [];
  for (let i = 1; i <= path.length; i += 1) {
    const prefix = path.slice(0, i);
    const parent = schemaAt(schema, path.slice(0, i - 1), root);
    const child = schemaAt(schema, prefix, root);
    parts.push(
      partLabel(parent, child, path[i - 1] ?? "", getIn(root, prefix)),
    );
  }
  return parts.join(SEPARATOR) || "Everything";
}
