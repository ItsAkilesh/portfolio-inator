/**
 * File: assets.ts
 * Purpose: Resolves image file names from the config to URLs under public/images.
 * Author: Akilesh
 * Date: 2026-10-20
 */
const IMAGE_DIR = "images/";
const ABSOLUTE_URL = /^(https?:)?\/\//i;

/** "cmu.webp" becomes "/images/cmu.webp" (respecting Vite's base path); absolute URLs pass through. */
export function imageUrl(
  fileName: string,
  base: string = import.meta.env.BASE_URL,
): string {
  if (ABSOLUTE_URL.test(fileName)) return fileName;
  const prefix = base.endsWith("/") ? base : `${base}/`;
  return `${prefix}${IMAGE_DIR}${fileName.replace(/^\/+/, "")}`;
}
