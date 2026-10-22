/**
 * File: draftStash.ts
 * Purpose: Keeps unsaved admin edits in this browser's localStorage, so a crash, a closed tab or a
 *          reload (an icon import reloads the console) does not lose them. A stash records the file
 *          version it was based on, so restoring over a file that changed since can be flagged.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import { readStored, removeStored, writeStored } from "../lib/storage";

const STASH_KEY = "portfolio-admin.draft";
/**
 * How long a "restore without asking" mark lasts. A library change can reload the console more
 * than once (its own reload plus the dev server's), so autosave keeps the mark for this long.
 */
export const AUTO_RESTORE_WINDOW_MS = 15_000;

export interface DraftStash {
  readonly draft: unknown;
  readonly baseVersion: string;
  readonly savedAt: string;
  /** Set right before the console reloads itself; restored without asking. */
  readonly isAutoRestore: boolean;
  /** When the auto-restore mark was set. */
  readonly markedAt?: string;
}

const isStash = (value: unknown): value is DraftStash =>
  typeof value === "object" &&
  value !== null &&
  "draft" in value &&
  typeof (value as DraftStash).baseVersion === "string" &&
  typeof (value as DraftStash).savedAt === "string";

export function readStash(): DraftStash | null {
  const text = readStored("local", STASH_KEY);
  if (!text) return null;
  try {
    const value: unknown = JSON.parse(text);
    return isStash(value)
      ? { ...value, isAutoRestore: value.isAutoRestore === true }
      : null;
  } catch {
    return null;
  }
}

/** Whether an existing auto-restore mark is still within its window at `now`. */
function liveMark(now: Date): string | null {
  const existing = readStash();
  const markedAt = existing?.isAutoRestore ? existing.markedAt : undefined;
  if (!markedAt) return null;
  return now.getTime() - Date.parse(markedAt) < AUTO_RESTORE_WINDOW_MS
    ? markedAt
    : null;
}

/** "set" marks the stash to restore without asking, "clear" removes a mark, "keep" keeps a live one. */
export type StashMark = "set" | "keep" | "clear";

export function writeStash(
  draft: unknown,
  baseVersion: string,
  mark: StashMark = "keep",
  now = new Date(),
): boolean {
  const markedAt =
    mark === "set" ? now.toISOString() : mark === "keep" ? liveMark(now) : null;
  const stash: DraftStash = {
    draft,
    baseVersion,
    savedAt: now.toISOString(),
    isAutoRestore: markedAt !== null,
    ...(markedAt ? { markedAt } : {}),
  };
  return writeStored("local", STASH_KEY, JSON.stringify(stash));
}

/**
 * Forgets the stash. Autosave passes `keepAutoRestore`: a stash written right before the console
 * reloads itself must survive until the reload restores it (hot updates re-run effects meanwhile).
 */
export function clearStash(keepAutoRestore = false): void {
  if (keepAutoRestore && readStash()?.isAutoRestore) return;
  removeStored("local", STASH_KEY);
}

/** True when the stash holds edits that differ from what was loaded. */
export const isWorthRestoring = (stash: DraftStash, loaded: unknown): boolean =>
  JSON.stringify(stash.draft) !== JSON.stringify(loaded);
