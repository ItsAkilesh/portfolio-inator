/**
 * File: validation.ts
 * Purpose: Validates the draft in the browser with the same schema the server uses, grouping the
 *          messages by field path so each generated field can show its own problems.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import { portfolioSchema } from "../content/schema";
import { pathId } from "./paths";

export interface DraftIssues {
  readonly byPath: ReadonlyMap<string, readonly string[]>;
  readonly all: readonly string[];
}

const NONE: DraftIssues = { byPath: new Map(), all: [] };

export function validateDraft(draft: unknown): DraftIssues {
  /* Nothing loaded yet. */
  if (draft === null || draft === undefined) return NONE;
  const result = portfolioSchema.safeParse(draft);
  if (result.success) return NONE;
  const byPath = new Map<string, string[]>();
  const all: string[] = [];
  for (const issue of result.error.issues) {
    const key = pathId(
      issue.path.map((p) => (typeof p === "symbol" ? String(p) : p)),
    );
    byPath.set(key, [...(byPath.get(key) ?? []), issue.message]);
    all.push(`${key || "(root)"}: ${issue.message}`);
  }
  return { byPath, all };
}
