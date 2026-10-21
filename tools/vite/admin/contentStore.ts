/**
 * File: contentStore.ts
 * Purpose: Reads and writes src/content/portfolio.json for the admin API. Writes are validated,
 *          serialised through one queue (no interleaved saves), guarded by optimistic versioning
 *          (a save based on an older file is refused, so hand edits are never overwritten) and
 *          atomic (temp file then rename, so a crash cannot leave half a file).
 * Author: Akilesh
 * Date: 2026-10-21
 */
import { createHash } from "node:crypto";
import { readFile, rename, writeFile } from "node:fs/promises";
import { serializeContent, validateContent } from "../validate";

export interface Snapshot {
  readonly content: unknown;
  readonly version: string;
}

export type SaveResult =
  | { readonly ok: true; readonly version: string }
  | {
      readonly ok: false;
      readonly status: 409 | 422;
      readonly issues: readonly string[];
    };

export const versionOf = (text: string): string =>
  createHash("sha256").update(text).digest("hex").slice(0, 16);

export class ContentStore {
  private queue: Promise<unknown> = Promise.resolve();

  constructor(private readonly file: string) {}

  async read(): Promise<Snapshot> {
    const text = await readFile(this.file, "utf8");
    return { content: JSON.parse(text), version: versionOf(text) };
  }

  /** Saves `content` if the file is still at `baseVersion`. */
  save(content: unknown, baseVersion: string): Promise<SaveResult> {
    const run = this.queue.then(() => this.write(content, baseVersion));
    this.queue = run.catch(() => undefined);
    return run;
  }

  private async write(
    content: unknown,
    baseVersion: string,
  ): Promise<SaveResult> {
    const current = versionOf(await readFile(this.file, "utf8"));
    if (current !== baseVersion)
      return {
        ok: false,
        status: 409,
        issues: ["portfolio.json changed since it was loaded; reload first"],
      };
    const result = validateContent(content);
    if (!result.ok) return { ok: false, status: 422, issues: result.issues };
    const text = serializeContent(result.content);
    const temp = `${this.file}.${process.pid}.tmp`;
    await writeFile(temp, text, "utf8");
    await rename(temp, this.file);
    return { ok: true, version: versionOf(text) };
  }
}
