/**
 * File: contentStore.ts
 * Purpose: Reads and writes src/content/portfolio.json for the admin API. Writes are validated,
 *          serialised through one queue (no interleaved saves), guarded by optimistic versioning
 *          (a save based on an older file is refused, so hand edits are never overwritten), atomic
 *          (temp file then rename) and preceded by a copy of the previous file in the history.
 * Author: Akilesh
 * Date: 2026-10-21 (updated 2026-10-22)
 */
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { SerialQueue, writeFileAtomic } from "../fsAtomic";
import type { LoadSchema } from "../schemaSource";
import { serializeContent, validateContent } from "../validate";
import type { HistoryStore } from "./historyStore";

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

export const STALE_MESSAGE =
  "portfolio.json changed since it was loaded; reload first";

export const versionOf = (text: string): string =>
  createHash("sha256").update(text).digest("hex").slice(0, 16);

export class ContentStore {
  private readonly queue = new SerialQueue();

  constructor(
    private readonly file: string,
    private readonly loadSchema: LoadSchema,
    private readonly history?: HistoryStore,
  ) {}

  async read(): Promise<Snapshot> {
    const text = await readFile(this.file, "utf8");
    return { content: JSON.parse(text), version: versionOf(text) };
  }

  /** Saves `content` if the file is still at `baseVersion`. */
  save(content: unknown, baseVersion: string): Promise<SaveResult> {
    return this.queue.run(() => this.write(content, baseVersion));
  }

  /** Reads, transforms and saves in one queued step (used for image renames). */
  update(
    baseVersion: string,
    change: (content: unknown) => unknown,
  ): Promise<SaveResult> {
    return this.queue.run(async () => {
      const { content } = await this.read();
      return this.write(change(content), baseVersion);
    });
  }

  private async write(
    content: unknown,
    baseVersion: string,
  ): Promise<SaveResult> {
    const before = await readFile(this.file, "utf8");
    const current = versionOf(before);
    if (current !== baseVersion)
      return { ok: false, status: 409, issues: [STALE_MESSAGE] };
    const result = validateContent(await this.loadSchema(), content);
    if (!result.ok) return { ok: false, status: 422, issues: result.issues };
    const text = serializeContent(result.content);
    if (text === before) return { ok: true, version: current };
    await this.history?.snapshot(before, current);
    await writeFileAtomic(this.file, text);
    return { ok: true, version: versionOf(text) };
  }
}
