/**
 * File: storage.ts
 * Purpose: localStorage/sessionStorage access that never throws (private mode, blocked storage).
 * Author: Akilesh
 * Date: 2026-10-20 (updated 2026-10-22)
 */
import { describeError, logger } from "./logger";

type StorageKind = "local" | "session";

function storageFor(kind: StorageKind): Storage | null {
  try {
    return kind === "local" ? window.localStorage : window.sessionStorage;
  } catch (error) {
    logger.debug("storage.open", describeError(error));
    return null;
  }
}

export function readStored(kind: StorageKind, key: string): string | null {
  try {
    return storageFor(kind)?.getItem(key) ?? null;
  } catch (error) {
    logger.debug("storage.read", describeError(error));
    return null;
  }
}

export function writeStored(
  kind: StorageKind,
  key: string,
  value: string,
): boolean {
  try {
    const storage = storageFor(kind);
    if (!storage) return false;
    storage.setItem(key, value);
    return true;
  } catch (error) {
    logger.debug("storage.write", describeError(error));
    return false;
  }
}

export function removeStored(kind: StorageKind, key: string): void {
  try {
    storageFor(kind)?.removeItem(key);
  } catch (error) {
    logger.debug("storage.remove", describeError(error));
  }
}
