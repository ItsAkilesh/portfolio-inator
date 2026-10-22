/**
 * File: imageSize.ts
 * Purpose: Reads pixel dimensions from the header of PNG, GIF, WebP and JPEG files, so the media
 *          library and health checks can flag oversized images without an image library.
 * Author: Akilesh
 * Date: 2026-10-21
 */
export interface ImageSize {
  readonly width: number;
  readonly height: number;
}

const PNG_SIGNATURE = "89504e470d0a1a0a";
const JPEG_SOF = new Set([
  0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf,
]);
const WEBP_HEADER = 12;

function pngSize(b: Buffer): ImageSize | null {
  if (b.length < 24 || b.subarray(0, 8).toString("hex") !== PNG_SIGNATURE)
    return null;
  return { width: b.readUInt32BE(16), height: b.readUInt32BE(20) };
}

function gifSize(b: Buffer): ImageSize | null {
  if (b.length < 10 || b.subarray(0, 4).toString("ascii") !== "GIF8")
    return null;
  return { width: b.readUInt16LE(6), height: b.readUInt16LE(8) };
}

function webpSize(b: Buffer): ImageSize | null {
  if (b.length < 30 || b.subarray(8, 12).toString("ascii") !== "WEBP")
    return null;
  const chunk = b.subarray(WEBP_HEADER, WEBP_HEADER + 4).toString("ascii");
  if (chunk === "VP8X")
    return { width: 1 + b.readUIntLE(24, 3), height: 1 + b.readUIntLE(27, 3) };
  if (chunk === "VP8L") {
    const bits = b.readUInt32LE(21);
    return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
  }
  if (chunk === "VP8 ")
    return {
      width: b.readUInt16LE(26) & 0x3fff,
      height: b.readUInt16LE(28) & 0x3fff,
    };
  return null;
}

function jpegSize(b: Buffer): ImageSize | null {
  if (b.length < 4 || b[0] !== 0xff || b[1] !== 0xd8) return null;
  let offset = 2;
  while (offset + 9 < b.length) {
    if (b[offset] !== 0xff) return null;
    const marker = b[offset + 1] ?? 0;
    const length = b.readUInt16BE(offset + 2);
    if (JPEG_SOF.has(marker))
      return {
        height: b.readUInt16BE(offset + 5),
        width: b.readUInt16BE(offset + 7),
      };
    offset += 2 + length;
  }
  return null;
}

/** Dimensions, or null for AVIF and anything unreadable. */
export const imageSize = (bytes: Buffer): ImageSize | null =>
  pngSize(bytes) ?? gifSize(bytes) ?? webpSize(bytes) ?? jpegSize(bytes);
