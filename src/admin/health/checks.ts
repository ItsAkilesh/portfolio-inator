/**
 * File: checks.ts
 * Purpose: Content health checks beyond schema validity: images that are missing or heavy, images
 *          without a description, empty sections, palette contrast, SEO advice, and the external
 *          links to test. Each finding points at the field to fix. Pure.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import type { z } from "zod";
import {
  valuesWithWidget,
  walkContent,
  type ContentPath,
} from "../../content/walk";
import { getIn } from "../paths";
import { checkSeo, type SeoInput } from "../seo/seoChecks";
import { checkContrast, resolveSource } from "../theme/palettes";

export type Severity = "error" | "warning";

export interface Finding {
  readonly severity: Severity;
  readonly area: "Images" | "Content" | "Theme" | "SEO" | "Links";
  readonly message: string;
  readonly path: ContentPath;
}

export interface ImageFacts {
  readonly name: string;
  readonly isLarge: boolean;
}

interface BlockLike {
  readonly type?: string;
  readonly [key: string]: unknown;
}

const LIST_FIELDS: Readonly<Record<string, string>> = {
  degrees: "items",
  featured: "entries",
  publications: "entries",
  linkGrid: "items",
};

export function imageFindings(
  schema: z.ZodType,
  content: unknown,
  images: readonly ImageFacts[],
): Finding[] {
  const byName = new Map(images.map((i) => [i.name, i]));
  return valuesWithWidget(schema, content, "image").flatMap(
    ({ path, value }): Finding[] => {
      const image = byName.get(value);
      if (!image)
        return [
          {
            severity: "error",
            area: "Images",
            message: `Image "${value}" is not in public/images`,
            path,
          },
        ];
      return image.isLarge
        ? [
            {
              severity: "warning",
              area: "Images",
              message: `"${value}" is large; optimise it in Media`,
              path,
            },
          ]
        : [];
    },
  );
}

function blockFindings(block: BlockLike, path: ContentPath): Finding[] {
  const empty = (message: string, at: ContentPath = path): Finding => ({
    severity: "warning",
    area: "Content",
    message,
    path: at,
  });
  if (block.type === "image" && !String(block.alt ?? "").trim())
    return [
      empty("Image block has no description for screen readers", [
        ...path,
        "alt",
      ]),
    ];
  if (block.type === "text" && !String(block.body ?? "").trim())
    return [empty("Text block is empty", [...path, "body"])];
  if (block.type === "timeline") {
    const groups =
      (block.groups as { title?: string; entries?: unknown[] }[] | undefined) ??
      [];
    if (groups.length === 0) return [empty("Timeline has no groups")];
    return groups.flatMap((g, i) =>
      (g.entries ?? []).length === 0
        ? [
            empty(`Timeline group "${g.title ?? i + 1}" has no entries`, [
              ...path,
              "groups",
              i,
            ]),
          ]
        : [],
    );
  }
  const listKey = block.type ? LIST_FIELDS[block.type] : undefined;
  if (listKey && ((block[listKey] as unknown[] | undefined) ?? []).length === 0)
    return [empty(`${block.type} block has no entries`)];
  return [];
}

export function contentFindings(content: unknown): Finding[] {
  const pages =
    (getIn(content, ["pages"]) as { blocks?: BlockLike[] }[] | undefined) ?? [];
  return pages.flatMap((page, p) =>
    (page.blocks ?? []).flatMap((block, b) =>
      blockFindings(block, ["pages", p, "blocks", b]),
    ),
  );
}

export function themeFindings(content: unknown): Finding[] {
  const name = String(getIn(content, ["theme", "activePalette"]) ?? "");
  const palette = resolveSource(getIn(content, ["theme", "palettes", name]));
  if (!palette) return [];
  return checkContrast(palette)
    .filter((r) => !r.isPassing)
    .map((r) => ({
      severity: "warning",
      area: "Theme",
      message: `${r.label} in ${r.mode} mode: ${r.ratio === null ? "colour not readable" : `${r.ratio.toFixed(2)}:1, needs ${r.minimum}:1`}`,
      path: ["theme", "palettes", name],
    }));
}

export function seoFindings(content: unknown): Finding[] {
  const seo = getIn(content, ["site", "seo"]) as SeoInput | undefined;
  if (!seo) return [];
  return checkSeo(seo).map((f) => ({
    severity: f.severity,
    area: "SEO",
    message: f.message,
    path: ["site", "seo", ...f.field.split(".")],
  }));
}

/** External http(s) links in the content, with where each is used. */
export function externalLinks(
  schema: z.ZodType,
  content: unknown,
): Map<string, ContentPath> {
  const links = new Map<string, ContentPath>();
  walkContent(schema, content, (node) => {
    if (
      typeof node.value === "string" &&
      /^https?:\/\//.test(node.value) &&
      !links.has(node.value)
    )
      links.set(node.value, node.path);
  });
  return links;
}

export function runChecks(
  schema: z.ZodType,
  content: unknown,
  images: readonly ImageFacts[],
): Finding[] {
  return [
    ...imageFindings(schema, content, images),
    ...contentFindings(content),
    ...themeFindings(content),
    ...seoFindings(content),
  ];
}
