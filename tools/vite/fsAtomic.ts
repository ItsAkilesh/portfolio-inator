/**
 * File: fsAtomic.ts
 * Purpose: Atomic file writes (temp file then rename) so a crash never leaves half a file, and a
 *          write-if-changed helper for generated files so unchanged output does not trigger reloads.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import { randomUUID } from "node:crypto";
import { readFile, rename, rm, writeFile } from "node:fs/promises";

export async function writeFileAtomic(
  file: string,
  text: string,
): Promise<void> {
  const temp = `${file}.${process.pid}.${randomUUID().slice(0, 8)}.tmp`;
  try {
    await writeFile(temp, text, "utf8");
    await rename(temp, file);
  } catch (error) {
    await rm(temp, { force: true });
    throw error;
  }
}

/** Writes only when the text differs; returns whether it wrote. */
export async function writeIfChanged(
  file: string,
  text: string,
): Promise<boolean> {
  const current = await readFile(file, "utf8").catch(() => null);
  if (current === text) return false;
  await writeFileAtomic(file, text);
  return true;
}

/** Runs tasks one after another; a failed task does not block the next. */
export class SerialQueue {
  private tail: Promise<unknown> = Promise.resolve();

  run<T>(task: () => Promise<T>): Promise<T> {
    const next = this.tail.then(task);
    this.tail = next.catch(() => undefined);
    return next;
  }
}
