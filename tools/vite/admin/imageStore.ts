/**
 * File: imageStore.ts
 * Purpose: Lists, stores, renames and removes images in public/images for the admin API. Uploads are
 *          limited to raster formats (no SVG, which can carry scripts), checked by both extension and
 *          file signature, size-capped, given a safe unique name and written only inside the images
 *          folder. Removed images go to the history trash rather than being deleted.
 * Author: Akilesh
 * Date: 2026-10-21 (updated 2026-10-22)
 */
import { open, readdir, rename, stat, writeFile } from "node:fs/promises";
import { basename, extname, join } from "node:path";
import type { HistoryStore } from "./historyStore";
import { imageSize, type ImageSize } from "./imageSize";

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_NAME_LENGTH = 80;

/** File signatures (magic bytes) by extension. */
const SIGNATURES: Readonly<Record<string, (bytes: Buffer) => boolean>> = {
  ".png": (b) =>
    b
      .subarray(0, 8)
      .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
  ".jpg": (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  ".jpeg": (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  ".gif": (b) => b.subarray(0, 4).toString("ascii") === "GIF8",
  ".webp": (b) =>
    b.subarray(0, 4).toString("ascii") === "RIFF" &&
    b.subarray(8, 12).toString("ascii") === "WEBP",
  ".avif": (b) => b.subarray(4, 12).toString("ascii").startsWith("ftypavi"),
};

export type UploadResult =
  | { readonly ok: true; readonly fileName: string }
  | { readonly ok: false; readonly reason: string };

/** "My Logo (1).PNG" to "my-logo-1.png"; null when nothing usable remains. */
export function safeFileName(name: string): string | null {
  const ext = extname(name).toLowerCase();
  const stem = basename(name, extname(name))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, MAX_NAME_LENGTH);
  return stem && ext in SIGNATURES ? `${stem}${ext}` : null;
}

/** First free name: logo.png, logo-2.png, logo-3.png, ... */
export function uniqueName(name: string, taken: ReadonlySet<string>): string {
  if (!taken.has(name)) return name;
  const ext = extname(name);
  const stem = basename(name, ext);
  let n = 2;
  while (taken.has(`${stem}-${n}${ext}`)) n += 1;
  return `${stem}-${n}${ext}`;
}

export function checkImage(name: string, bytes: Buffer): string | null {
  if (bytes.length === 0) return "The file is empty";
  if (bytes.length > MAX_IMAGE_BYTES) return "Images must be 5 MB or smaller";
  const matches = SIGNATURES[extname(name).toLowerCase()];
  return matches?.(bytes)
    ? null
    : "The file contents do not match its image type";
}

export interface ImageDetails extends Partial<ImageSize> {
  readonly name: string;
  readonly bytes: number;
}

export type ImageChange =
  | { readonly ok: true; readonly fileName: string }
  | { readonly ok: false; readonly reason: string };

/** Enough of the file to read any supported header's dimensions. */
const HEADER_BYTES = 64 * 1024;

async function readHeader(file: string): Promise<Buffer> {
  const handle = await open(file, "r");
  try {
    const buffer = Buffer.alloc(HEADER_BYTES);
    const { bytesRead } = await handle.read(buffer, 0, HEADER_BYTES, 0);
    return buffer.subarray(0, bytesRead);
  } finally {
    await handle.close();
  }
}

export class ImageStore {
  constructor(
    private readonly dir: string,
    private readonly history?: HistoryStore,
  ) {}

  async details(): Promise<ImageDetails[]> {
    return Promise.all(
      (await this.list()).map(async (name) => {
        const file = join(this.dir, name);
        const [{ size }, header] = await Promise.all([
          stat(file),
          readHeader(file),
        ]);
        return { name, bytes: size, ...(imageSize(header) ?? {}) };
      }),
    );
  }

  /** Renames within the folder; the extension cannot change and existing names are not overwritten. */
  async rename(from: string, requested: string): Promise<ImageChange> {
    const names = new Set(await this.list());
    if (!names.has(from)) return { ok: false, reason: "No such image" };
    const to = safeFileName(requested);
    if (!to || extname(to) !== extname(from))
      return { ok: false, reason: `Keep the ${extname(from)} extension` };
    if (to === from) return { ok: true, fileName: to };
    if (names.has(to)) return { ok: false, reason: `${to} already exists` };
    await rename(join(this.dir, from), join(this.dir, to));
    return { ok: true, fileName: to };
  }

  /** Moves an image to the history trash. The caller checks that no content uses it. */
  async remove(name: string): Promise<ImageChange> {
    if (!(await this.list()).includes(name))
      return { ok: false, reason: "No such image" };
    if (!this.history)
      return { ok: false, reason: "Removing images needs the history folder" };
    await this.history.trash(join(this.dir, name), name);
    return { ok: true, fileName: name };
  }

  async list(): Promise<string[]> {
    const names = await readdir(this.dir);
    return names
      .filter((name) => safeFileName(name) === name.toLowerCase())
      .sort();
  }

  async save(requestedName: string, dataBase64: string): Promise<UploadResult> {
    const clean = safeFileName(requestedName);
    if (!clean)
      return {
        ok: false,
        reason: "Use a .png, .jpg, .webp, .gif or .avif file",
      };
    const bytes = Buffer.from(dataBase64, "base64");
    const problem = checkImage(clean, bytes);
    if (problem) return { ok: false, reason: problem };
    const fileName = uniqueName(clean, new Set(await readdir(this.dir)));
    /* fileName has no separators (safeFileName), so the join cannot leave the images folder. */
    await writeFile(join(this.dir, fileName), bytes, { flag: "wx" });
    return { ok: true, fileName };
  }
}
