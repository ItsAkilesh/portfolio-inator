/**
 * File: protocol.ts
 * Purpose: Messages between the admin console and the site inside its preview frame (same origin,
 *          dev only): reveal a block, switch light/dark, show a draft palette live, and turn on
 *          click-to-edit; the site reports clicks back. Every message is checked on arrival.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import type { Palette } from "../types/theme";

const PREFIX = "portfolio-admin:";

export type ToSite =
  | {
      readonly type: "portfolio-admin:reveal";
      readonly pageId: string;
      readonly blockIndex: number;
    }
  | { readonly type: "portfolio-admin:mode"; readonly mode: "light" | "dark" }
  | {
      readonly type: "portfolio-admin:palette";
      readonly palette: Palette | null;
    }
  | { readonly type: "portfolio-admin:edit-mode"; readonly isOn: boolean };

export type ToAdmin =
  | {
      readonly type: "portfolio-admin:edit";
      readonly pageId: string;
      readonly blockIndex: number;
    }
  | { readonly type: "portfolio-admin:ready"; readonly pageId: string | null };

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const hasType = (
  value: unknown,
): value is { type: string } & Record<string, unknown> =>
  isRecord(value) &&
  typeof value.type === "string" &&
  value.type.startsWith(PREFIX);

export function asToSite(value: unknown): ToSite | null {
  if (!hasType(value)) return null;
  switch (value.type) {
    case "portfolio-admin:reveal":
      return typeof value.pageId === "string" &&
        Number.isInteger(value.blockIndex)
        ? (value as unknown as ToSite)
        : null;
    case "portfolio-admin:mode":
      return value.mode === "light" || value.mode === "dark"
        ? (value as unknown as ToSite)
        : null;
    case "portfolio-admin:palette":
      return value.palette === null || isRecord(value.palette)
        ? (value as unknown as ToSite)
        : null;
    case "portfolio-admin:edit-mode":
      return typeof value.isOn === "boolean"
        ? (value as unknown as ToSite)
        : null;
    default:
      return null;
  }
}

export function asToAdmin(value: unknown): ToAdmin | null {
  if (!hasType(value)) return null;
  if (value.type === "portfolio-admin:edit")
    return typeof value.pageId === "string" &&
      Number.isInteger(value.blockIndex)
      ? (value as unknown as ToAdmin)
      : null;
  if (value.type === "portfolio-admin:ready")
    return value.pageId === null || typeof value.pageId === "string"
      ? (value as unknown as ToAdmin)
      : null;
  return null;
}
