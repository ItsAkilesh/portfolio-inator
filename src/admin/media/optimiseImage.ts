/**
 * File: optimiseImage.ts
 * Purpose: Optimises images in the browser before upload: scales them down to a maximum width and
 *          re-encodes them as WebP with the platform's own encoder (no dependency). GIFs (possibly
 *          animated) are left alone, and the original is kept whenever the result would be larger
 *          or the browser cannot encode WebP.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import { readStored, writeStored } from "../../lib/storage";

export interface OptimiseSettings {
  readonly isEnabled: boolean;
  readonly maxWidth: number;
  /** WebP quality, 0 to 1. */
  readonly quality: number;
}

export interface Prepared {
  readonly blob: Blob;
  readonly fileName: string;
  readonly note: string | null;
}

export const DEFAULT_SETTINGS: OptimiseSettings = {
  isEnabled: true,
  maxWidth: 1600,
  quality: 0.85,
};
const SETTINGS_KEY = "portfolio-admin.optimise";
const WEBP = "image/webp";
const SKIPPED_TYPES: ReadonlySet<string> = new Set([
  "image/gif",
  "image/svg+xml",
]);

export function readSettings(): OptimiseSettings {
  try {
    const value: unknown = JSON.parse(
      readStored("local", SETTINGS_KEY) ?? "null",
    );
    if (typeof value !== "object" || value === null) return DEFAULT_SETTINGS;
    const v = value as Partial<OptimiseSettings>;
    return {
      isEnabled:
        typeof v.isEnabled === "boolean"
          ? v.isEnabled
          : DEFAULT_SETTINGS.isEnabled,
      maxWidth:
        typeof v.maxWidth === "number" && v.maxWidth >= 64
          ? v.maxWidth
          : DEFAULT_SETTINGS.maxWidth,
      quality:
        typeof v.quality === "number" && v.quality > 0 && v.quality <= 1
          ? v.quality
          : DEFAULT_SETTINGS.quality,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export const saveSettings = (settings: OptimiseSettings): boolean =>
  writeStored("local", SETTINGS_KEY, JSON.stringify(settings));

/** Size that fits `maxWidth`, keeping the aspect ratio; never scales up. */
export function fittedSize(
  width: number,
  height: number,
  maxWidth: number,
): { width: number; height: number } {
  if (width <= maxWidth) return { width, height };
  return {
    width: maxWidth,
    height: Math.max(1, Math.round((height * maxWidth) / width)),
  };
}

export const webpName = (fileName: string): string =>
  `${fileName.replace(/\.[^.]+$/, "") || "image"}.webp`;

export const shouldOptimise = (
  type: string,
  settings: OptimiseSettings,
): boolean =>
  settings.isEnabled && type.startsWith("image/") && !SKIPPED_TYPES.has(type);

function encode(
  bitmap: ImageBitmap,
  size: { width: number; height: number },
  quality: number,
): Promise<Blob | null> {
  const canvas = document.createElement("canvas");
  canvas.width = size.width;
  canvas.height = size.height;
  const context = canvas.getContext("2d");
  if (!context) return Promise.resolve(null);
  context.drawImage(bitmap, 0, 0, size.width, size.height);
  return new Promise((resolve) => canvas.toBlob(resolve, WEBP, quality));
}

/** The file to upload: the optimised WebP when it helps, otherwise the original. */
export async function prepareUpload(
  file: File,
  settings = readSettings(),
): Promise<Prepared> {
  const original = { blob: file, fileName: file.name, note: null };
  if (
    !shouldOptimise(file.type, settings) ||
    typeof createImageBitmap !== "function"
  )
    return original;
  try {
    const bitmap = await createImageBitmap(file);
    const size = fittedSize(bitmap.width, bitmap.height, settings.maxWidth);
    const blob = await encode(bitmap, size, settings.quality);
    bitmap.close();
    const isResized = size.width !== bitmap.width;
    if (!blob || blob.type !== WEBP || (!isResized && blob.size >= file.size))
      return original;
    const saved = Math.max(0, Math.round((1 - blob.size / file.size) * 100));
    return {
      blob,
      fileName: webpName(file.name),
      note: `Optimised to WebP ${size.width}×${size.height} (${saved}% smaller)`,
    };
  } catch {
    return original;
  }
}
