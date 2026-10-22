/**
 * File: fields.ts
 * Purpose: Reusable field schemas for the portfolio content. Each carries admin metadata (title,
 *          description, widget) so the admin console can generate its editor from the schema.
 *          Dev and build only: production code imports the inferred types, never these values.
 * Author: Akilesh
 * Date: 2026-10-21 (updated 2026-10-22)
 */
import { z } from "zod";
import { ICONS, type IconKey } from "../../icons/registry";
import { PRESENT, isOrdered, parseDate } from "../../lib/dates";

/** Editor hints read by the admin form generator. */
export interface FieldMeta {
  /* zod's metadata registry accepts any extra keys. */
  readonly [key: string]: unknown;
  readonly title?: string;
  readonly description?: string;
  /** Overrides the default editor for the field's type. */
  readonly widget?:
    | "multiline"
    | "markdown"
    | "icon"
    | "image"
    | "color"
    | "date";
  /** Date fields: also offer "present" (an ongoing range). */
  readonly allowPresent?: boolean;
  /** Field whose value labels an array item in collapsed lists. */
  readonly summaryKey?: string;
  /** Text fields that must stay unique across a list; duplicating an item makes them unique. */
  readonly uniqueKeys?: readonly string[];
  /** Offers ready-made items when adding to this list's parent, e.g. page templates. */
  readonly templates?: "pages";
}

const SAFE_LINK = /^(https?:\/\/|mailto:|tel:|\/)/;
const IMAGE_FILE = /^[\w.-]+\.(png|jpe?g|webp|gif|avif)$/i;
const PATH_SEGMENTS = /^\/[a-z0-9-]*(\/[a-z0-9-]+)*$/;

export const text = (meta: FieldMeta) => z.string().meta(meta);

export const longText = (meta: FieldMeta) =>
  z.string().meta({ widget: "multiline", ...meta });

/** Longer text written in Markdown (headings, lists, links, emphasis, code). */
export const markdown = (meta: FieldMeta) =>
  z.string().meta({ widget: "markdown", ...meta });

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

/** A partial date: "", YYYY, YYYY-MM or YYYY-MM-DD (month and day are optional). */
export const date = (meta: FieldMeta) =>
  z
    .string()
    .refine(
      (value) =>
        value === "" ||
        (meta.allowPresent === true && value === PRESENT) ||
        parseDate(value) !== null,
      "Pick a year, optionally a month and a day",
    )
    .meta({ widget: "date", ...meta });

/** Dates of an entry: a single date, a range, or an ongoing range, with an optional prefix. */
export const dateRange = (meta: FieldMeta) =>
  z
    .object({
      label: text({
        title: "Prefix",
        description: 'Shown before the dates, e.g. "Filed"; empty for none',
      }),
      start: date({ title: "Start", description: "Empty for no date" }),
      end: date({
        title: "End",
        description: "Empty for a single date",
        allowPresent: true,
      }),
      isEndExpected: flag({ title: "End date is expected" }),
    })
    .superRefine((range, ctx) => {
      if (range.end && !range.start)
        ctx.addIssue({
          code: "custom",
          message: "Add a start date",
          path: ["start"],
        });
      if (!isOrdered(range.start, range.end))
        ctx.addIssue({
          code: "custom",
          message: "End is before the start",
          path: ["end"],
        });
    })
    .meta({ title: "Dates", ...meta });

export const list = <T extends z.ZodType>(item: T, meta: FieldMeta) =>
  z.array(item).meta(meta);
