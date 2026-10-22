/**
 * File: api.ts
 * Purpose: Client for the dev-only admin API (tools/vite/admin). Sends the per-start token from the
 *          page's meta tag and returns typed results instead of throwing.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import { describeError } from "../lib/logger";

const API = "/__admin/api";
const TOKEN_META = "portfolio-admin-token";
const TOKEN_HEADER = "x-portfolio-admin-token";

export type ApiResult<T> =
  | { readonly ok: true; readonly data: T }
  | {
      readonly ok: false;
      readonly status: number;
      readonly issues: readonly string[];
    };

export interface Snapshot {
  readonly content: unknown;
  readonly version: string;
}

const token = (): string =>
  document.querySelector<HTMLMetaElement>(`meta[name="${TOKEN_META}"]`)
    ?.content ?? "";

const issuesFrom = (body: unknown): string[] =>
  typeof body === "object" &&
  body !== null &&
  Array.isArray((body as { issues?: unknown }).issues)
    ? (body as { issues: unknown[] }).issues.map(String)
    : ["Unexpected response"];

async function request<T>(
  path: string,
  init: RequestInit = {},
): Promise<ApiResult<T>> {
  try {
    const res = await fetch(`${API}${path}`, {
      ...init,
      headers: {
        "content-type": "application/json",
        [TOKEN_HEADER]: token(),
        ...init.headers,
      },
    });
    const body: unknown = await res.json();
    return res.ok
      ? { ok: true, data: body as T }
      : { ok: false, status: res.status, issues: issuesFrom(body) };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      issues: [`Could not reach the dev server: ${describeError(error)}`],
    };
  }
}

export const loadContent = () => request<Snapshot>("/content");

export const saveContent = (content: unknown, baseVersion: string) =>
  request<{ version: string }>("/content", {
    method: "PUT",
    body: JSON.stringify({ content, baseVersion }),
  });

export const listImages = () => request<{ images: string[] }>("/images");

function readAsBase64(file: File): Promise<string> {
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
  file: File,
): Promise<ApiResult<{ fileName: string }>> {
  try {
    const dataBase64 = await readAsBase64(file);
    return await request("/images", {
      method: "POST",
      body: JSON.stringify({ fileName: file.name, dataBase64 }),
    });
  } catch (error) {
    return { ok: false, status: 0, issues: [describeError(error)] };
  }
}
