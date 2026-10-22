/**
 * File: assets.ts
 * Purpose: Admin API calls for images and the icon library.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import { describeError } from "../../lib/logger";
import { postJson, query, request, type ApiResult } from "./client";

export interface ImageDetails {
  readonly name: string;
  readonly bytes: number;
  readonly width?: number;
  readonly height?: number;
  readonly uses: number;
}

export interface CatalogIcon {
  readonly slug: string;
  readonly title: string;
  readonly hex: string;
  readonly path: string;
  /** Key in the library, or null when not added yet. */
  readonly key: string | null;
}

export interface IconUsage {
  readonly usage: Readonly<Record<string, number>>;
  readonly simpleIcons: Readonly<Record<string, string>>;
  readonly custom: readonly string[];
  readonly protected: readonly string[];
}

export const listImages = () => request<{ images: string[] }>("/images");
export const imageDetails = () =>
  request<{ images: ImageDetails[] }>("/images/details");

export const renameImage = (from: string, to: string, baseVersion: string) =>
  request<{ fileName: string; version: string }>(
    "/images/rename",
    postJson({ from, to, baseVersion }),
  );

export const removeImage = (name: string) =>
  request<{ fileName: string }>("/images/remove", postJson({ name }));

function readAsBase64(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      resolve(String(reader.result).replace(/^data:[^,]*,/, ""));
    reader.onerror = () =>
      reject(reader.error ?? new Error("Could not read the file"));
    reader.readAsDataURL(file);
  });
}

export async function uploadImage(
  file: Blob,
  fileName: string,
): Promise<ApiResult<{ fileName: string }>> {
  try {
    const dataBase64 = await readAsBase64(file);
    return await request("/images", postJson({ fileName, dataBase64 }));
  } catch (error) {
    return { ok: false, status: 0, issues: [describeError(error)] };
  }
}

export const searchIcons = (q: string, limit = 40) =>
  request<{ results: CatalogIcon[] }>(`/icons/search${query({ q, limit })}`);

export const iconUsage = () => request<IconUsage>("/icons/usage");

export const addIcon = (slug: string, key?: string) =>
  request<{ key: string }>("/icons/add", postJson({ slug, key }));

export const importIcon = (input: {
  key: string;
  title: string;
  hex: string;
  svg: string;
}) => request<{ key: string }>("/icons/import", postJson(input));

export const removeIcon = (key: string) =>
  request<{ key: string }>("/icons/remove", postJson({ key }));
