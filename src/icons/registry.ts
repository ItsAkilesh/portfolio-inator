/**
 * File: registry.ts
 * Purpose: Every icon the content can refer to, by key. The list lives in src/icons/library.json:
 *          simple-icons by slug (https://simpleicons.org) and custom path icons. The admin console's
 *          icon picker searches all of simple-icons and adds picks to the library, or imports an SVG
 *          as a custom icon; simpleIcons.generated.ts is regenerated from the library.
 * Author: Akilesh
 * Date: 2026-10-20 (updated 2026-10-22)
 */
import library from "./library.json";
import { SIMPLE_ICONS } from "./simpleIcons.generated";
import { SITE_ICONS } from "./siteIcons";
import type { IconDefinition } from "./types";

interface SimpleIconLike {
  readonly title: string;
  readonly hex: string;
  readonly path: string;
}

const SIMPLE_VIEW_BOX = "0 0 24 24";

const fromSimple = (icon: SimpleIconLike): IconDefinition => ({
  title: icon.title,
  hex: `#${icon.hex}`,
  path: icon.path,
  viewBox: SIMPLE_VIEW_BOX,
});

export type IconKey = keyof typeof SIMPLE_ICONS | keyof typeof library.custom;

/*
 * Object.fromEntries drops key types; both sources are spread in full, so every IconKey is present.
 */
export const ICONS = {
  ...library.custom,
  ...Object.fromEntries(
    Object.entries(SIMPLE_ICONS).map(([key, icon]) => [key, fromSimple(icon)]),
  ),
} as Readonly<Record<IconKey, IconDefinition>>;

export const FALLBACK_ICON: IconKey = SITE_ICONS.fallback;

export const isIconKey = (value: unknown): value is IconKey =>
  typeof value === "string" &&
  Object.prototype.hasOwnProperty.call(ICONS, value);

export const getIcon = (key: IconKey): IconDefinition => ICONS[key];
