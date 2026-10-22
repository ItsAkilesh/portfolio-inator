/**
 * File: imageFacts.ts
 * Purpose: When an image counts as large (worth optimising), shared by the media library and the
 *          health check.
 * Author: Akilesh
 * Date: 2026-10-21
 */
export const LARGE_IMAGE_BYTES = 300 * 1024;
export const LARGE_IMAGE_WIDTH = 2000;

export const isLarge = (image: {
  readonly bytes: number;
  readonly width?: number;
}): boolean =>
  image.bytes > LARGE_IMAGE_BYTES || (image.width ?? 0) > LARGE_IMAGE_WIDTH;
