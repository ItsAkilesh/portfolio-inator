/**
 * File: historyStore.ts
 * Purpose: Local version history for the admin console, in the git-ignored .admin-history folder:
 *          a copy of portfolio.json before every save (the newest MAX_VERSIONS are kept) and removed
 *          images (moved to a trash folder instead of deleted, so a removal can be undone by hand).
 * Author: Akilesh
 * Date: 2026-10-21
 */
import { mkdir, readdir, readFile, rename, rm, stat } from "node:fs/promises";
import { join } from "node:path";
import { writeFileAtomic } from "../fsAtomic";

export const MAX_VERSIONS = 30;
const VERSION_FILE = /^(\d{8}T\d{6}\d{3}Z)-([0-9a-f]{16})\.json$/;

export interface HistoryEntry {
  readonly id: string;
  readonly savedAt: string;
  readonly version: string;
  readonly bytes: number;
}

/** "2026-10-21T20:56:24.123Z" to "20261021T205624123Z" (sortable, file-name safe). */
export const stampOf = (date: Date): string =>
  date.toISOString().replace(/[-:.]/g, "");

const isoOf = (stamp: string): string =>
  stamp.replace(
    /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(\d{3})Z$/,
    "$1-$2-$3T$4:$5:$6.$7Z",
  );

export class HistoryStore {
  private readonly contentDir: string;
  private readonly trashDir: string;

  constructor(root: string) {
    this.contentDir = join(root, "content");
    this.trashDir = join(root, "trash");
  }

  /** Keeps `text` (the file about to be replaced) and prunes old copies. */
  async snapshot(
    text: string,
    version: string,
    now = new Date(),
  ): Promise<void> {
    await mkdir(this.contentDir, { recursive: true });
    await writeFileAtomic(
      join(this.contentDir, `${stampOf(now)}-${version}.json`),
      text,
    );
    const names = (await this.fileNames()).slice(MAX_VERSIONS);
    await Promise.all(
      names.map((name) => rm(join(this.contentDir, name), { force: true })),
    );
  }

  async list(): Promise<HistoryEntry[]> {
    const names = await this.fileNames();
    return Promise.all(
      names.map(async (name) => {
        const match = VERSION_FILE.exec(name);
        const { size } = await stat(join(this.contentDir, name));
        return {
          id: name,
          savedAt: isoOf(match?.[1] ?? ""),
          version: match?.[2] ?? "",
          bytes: size,
        };
      }),
    );
  }

  /** Content of one saved version; null for an unknown id (ids are checked against the pattern). */
  async read(id: string): Promise<unknown> {
    if (!VERSION_FILE.test(id)) return null;
    const text = await readFile(join(this.contentDir, id), "utf8").catch(
      () => null,
    );
    return text === null ? null : (JSON.parse(text) as unknown);
  }

  /** Moves a file into the trash folder under a time-stamped name. */
  async trash(file: string, name: string, now = new Date()): Promise<string> {
    await mkdir(this.trashDir, { recursive: true });
    const target = join(this.trashDir, `${stampOf(now)}-${name}`);
    await rename(file, target);
    return target;
  }

  /** Newest first. */
  private async fileNames(): Promise<string[]> {
    const names = await readdir(this.contentDir).catch(() => [] as string[]);
    return names
      .filter((name) => VERSION_FILE.test(name))
      .sort()
      .reverse();
  }
}
