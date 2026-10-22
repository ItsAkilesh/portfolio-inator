/**
 * File: validate.ts
 * Purpose: Validates portfolio content against the schema and turns zod issues into readable lines,
 *          and produces the JSON Schema that gives editors autocompletion in portfolio.json. The
 *          schema is passed in (see schemaSource.ts) so the config never imports it.
 * Author: Akilesh
 * Date: 2026-10-21 (updated 2026-10-22)
 */
import { z } from "zod";
import type { PortfolioContent } from "../../src/content/schema";
import type { ContentSchema } from "./schemaSource";

export type ValidationResult =
  | { readonly ok: true; readonly content: PortfolioContent }
  | { readonly ok: false; readonly issues: readonly string[] };

const MAX_ISSUES = 50;

export function validateContent(
  schema: ContentSchema,
  value: unknown,
): ValidationResult {
  const result = schema.safeParse(value);
  if (result.success) return { ok: true, content: result.data };
  const issues = result.error.issues
    .slice(0, MAX_ISSUES)
    .map((issue) => `${issue.path.join(".") || "(root)"}: ${issue.message}`);
  return { ok: false, issues };
}

/** Pretty JSON Schema for portfolio.json, with titles and descriptions for editor hovers. */
export function contentJsonSchema(schema: ContentSchema): string {
  const json = z.toJSONSchema(schema, { unrepresentable: "any" });
  return `${JSON.stringify(json, null, 2)}\n`;
}

/** Content serialised the way it is stored: two-space JSON, "$schema" first, trailing newline. */
export function serializeContent(content: PortfolioContent): string {
  const { $schema, ...rest } = content;
  return `${JSON.stringify({ $schema: $schema ?? "./portfolio.schema.json", ...rest }, null, 2)}\n`;
}
