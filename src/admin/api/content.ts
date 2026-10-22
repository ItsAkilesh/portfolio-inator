/**
 * File: content.ts
 * Purpose: Admin API calls for the content and its saved versions.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import { query, request } from "./client";

export interface Snapshot {
  readonly content: unknown;
  readonly version: string;
}

export interface HistoryEntry {
  readonly id: string;
  readonly savedAt: string;
  readonly version: string;
  readonly bytes: number;
}

export const loadContent = () => request<Snapshot>("/content");

export const saveContent = (content: unknown, baseVersion: string) =>
  request<{ version: string }>("/content", {
    method: "PUT",
    body: JSON.stringify({ content, baseVersion }),
  });

export const listHistory = () =>
  request<{ versions: HistoryEntry[] }>("/history");

export const readHistory = (id: string) =>
  request<{ content: unknown }>(`/history/item${query({ id })}`);
