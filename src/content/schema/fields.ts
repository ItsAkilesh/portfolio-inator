/**
 * File: fields.ts
 * Purpose: Reusable field schemas for the portfolio content. Each carries admin metadata (title,
 *          description, widget) so the admin console can generate its editor from the schema.
 *          Dev and build only: production code imports the inferred types, never these values.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import { z } from "zod";
import { ICONS, type IconKey } from "../../icons/registry";

/** Editor hints read by the admin form generator. */
export interface FieldMeta {
  /* zod's metadata registry accepts any extra keys. */
  readonly [key: string]: unknown;
  readonly title?: string;
  readonly description?: string;
  /** Overrides the default editor for the field's type. */
  readonly widget?: "multiline" | "icon" | "image" | "color";
  /** Field whose value labels an array item in collapsed lists. */
  readonly summaryKey?: string;
}

const SAFE_LINK = /^(https?:\/\/|mailto:|tel:|\/)/;
const IMAGE_FILE = /^[\w.-]+\.(png|jpe?g|webp|gif|avif)$/i;
const PATH_SEGMENTS = /^\/[a-z0-9-]*(\/[a-z0-9-]+)*$/;

export const text = (meta: FieldMeta) => z.string().meta(meta);

export const longText = (meta: FieldMeta) =>
  z.string().meta({ widget: "multiline", ...meta });

export const flag = (meta: FieldMeta) => z.boolean().meta(meta);

export const count = (meta: FieldMeta) => z.number().min(0).meta(meta);

/** http(s), mailto:, tel: or an internal route such as "/home" (the schemes SmartLink allows). */
export const link = (meta: FieldMeta) =>
  z
    .string()
    .regex(
      SAFE_LINK,
      "Use https://, mailto:, tel: or an internal path like /home",
    )
    .meta(meta);

/** Like link, but empty means "no link". */
export const optionalLink = (meta: FieldMeta) =>
  z
    .union([
      z.literal(""),
      z.string().regex(SAFE_LINK, "Use https://, mailto:, tel: or a page path"),
    ])
    .meta({ description: "Empty for no link", ...meta });

/** A file name inside public/images, chosen or uploaded in the admin. */
export const image = (meta: FieldMeta) =>
  z
    .string()
    .regex(
      IMAGE_FILE,
      "Use an image file name from public/images, e.g. logo.webp",
    )
    .meta({ widget: "image", ...meta });

/** A page route: "/" followed by lowercase words joined with dashes. */
export const routePath = (meta: FieldMeta) =>
  z
    .string()
    .regex(
      PATH_SEGMENTS,
      "Use lowercase letters, numbers and dashes, e.g. /talks",
    )
    .meta(meta);

/* simple-icons keys are the registry's own keys, so the tuple is never empty. */
const ICON_KEYS = Object.keys(ICONS) as [IconKey, ...IconKey[]];

export const icon = (meta: FieldMeta) =>
  z.enum(ICON_KEYS).meta({ widget: "icon", ...meta });

export const list = <T extends z.ZodType>(item: T, meta: FieldMeta) =>
  z.array(item).meta(meta);
