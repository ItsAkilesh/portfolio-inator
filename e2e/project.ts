/**
 * File: project.ts
 * Purpose: End-to-end test helpers for the files tests change: a backup of the content, icon
 *          library, generated icon module and image list taken before the run, restored after each
 *          test that changes them and at the end.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import {
  cp,
  mkdir,
  readdir,
  readFile,
  rename,
  rm,
  writeFile,
} from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const BACKUP = join(ROOT, ".admin-history", "e2e-backup");
const FILES = [
  "src/content/portfolio.json",
  "src/icons/library.json",
  "src/icons/simpleIcons.generated.ts",
];
const IMAGES = join(ROOT, "public", "images");
const IMAGE_LIST = join(BACKUP, "images.json");
const IMAGE_BACKUP = join(BACKUP, "images");

export const contentFile = join(ROOT, "src/content/portfolio.json");

export async function backupProject(): Promise<void> {
  await mkdir(BACKUP, { recursive: true });
  for (const file of FILES)
    await cp(join(ROOT, file), join(BACKUP, file.replace(/\//g, "__")));
  await writeFile(IMAGE_LIST, JSON.stringify(await readdir(IMAGES)));
  await cp(IMAGES, IMAGE_BACKUP, { recursive: true });
}

/** Puts every backed-up file back (only if it changed) and removes images a test added; true if anything changed. */
export async function restoreProject(): Promise<boolean> {
  let isChanged = false;
  for (const file of FILES) {
    const saved = await readFile(
      join(BACKUP, file.replace(/\//g, "__")),
      "utf8",
    );
    const current = await readFile(join(ROOT, file), "utf8").catch(() => "");
    if (saved === current) continue;
    /* Atomic, so the dev server never reads a half-written file. */
    await writeFile(`${join(ROOT, file)}.e2e.tmp`, saved);
    await rename(`${join(ROOT, file)}.e2e.tmp`, join(ROOT, file));
    isChanged = true;
  }
  const original = JSON.parse(await readFile(IMAGE_LIST, "utf8")) as string[];
  const present = new Set(await readdir(IMAGES));
  for (const name of present)
    if (!original.includes(name)) {
      await rm(join(IMAGES, name));
      isChanged = true;
    }
  for (const name of original)
    if (!present.has(name)) {
      await cp(join(IMAGE_BACKUP, name), join(IMAGES, name));
      isChanged = true;
    }
  return isChanged;
}

export async function readContent(): Promise<Record<string, unknown>> {
  return JSON.parse(await readFile(contentFile, "utf8")) as Record<
    string,
    unknown
  >;
}
