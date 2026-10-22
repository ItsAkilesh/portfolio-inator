/**
 * File: api.ts
 * Purpose: Transport for the dev-only admin API (tools/vite/admin): sends the per-start token from
 *          the page's meta tag and returns typed results instead of throwing.
 * Author: Akilesh
 * Date: 2026-10-21 (updated 2026-10-22)
 */
import { describeError } from "../../lib/logger";

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

const token = (): string =>
  document.querySelector<HTMLMetaElement>(`meta[name="${TOKEN_META}"]`)
    ?.content ?? "";

const issuesFrom = (body: unknown): string[] =>
  typeof body === "object" &&
  body !== null &&
  Array.isArray((body as { issues?: unknown }).issues)
    ? (body as { issues: unknown[] }).issues.map(String)
    : ["Unexpected response"];

export async function request<T>(
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

/** JSON POST options. */
export const postJson = (body: unknown): RequestInit => ({
  method: "POST",
  body: JSON.stringify(body),
});

export const query = (params: Record<string, string | number>): string =>
  `?${new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)])).toString()}`;
