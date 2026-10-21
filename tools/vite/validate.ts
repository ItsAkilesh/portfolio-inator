/**
 * File: validate.ts
 * Purpose: Validates portfolio content against the schema and turns zod issues into readable lines,
 *          and produces the JSON Schema that gives editors autocompletion in portfolio.json.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import { z } from "zod";
import {
  portfolioSchema,
  type PortfolioContent,
} from "../../src/content/schema";

export type ValidationResult =
  | { readonly ok: true; readonly content: PortfolioContent }
  | { readonly ok: false; readonly issues: readonly string[] };

const MAX_ISSUES = 50;

export function validateContent(value: unknown): ValidationResult {
  const result = portfolioSchema.safeParse(value);
  if (result.success) return { ok: true, content: result.data };
  const issues = result.error.issues
    .slice(0, MAX_ISSUES)
    .map((issue) => `${issue.path.join(".") || "(root)"}: ${issue.message}`);
  return { ok: false, issues };
}

/** Pretty JSON Schema for portfolio.json, with titles and descriptions for editor hovers. */
export function contentJsonSchema(): string {
  const schema = z.toJSONSchema(portfolioSchema, { unrepresentable: "any" });
  return `${JSON.stringify(schema, null, 2)}\n`;
}

/** Content serialised the way it is stored: two-space JSON, "$schema" first, trailing newline. */
export function serializeContent(content: PortfolioContent): string {
  const { $schema, ...rest } = content;
  return `${JSON.stringify({ $schema: $schema ?? "./portfolio.schema.json", ...rest }, null, 2)}\n`;
}
