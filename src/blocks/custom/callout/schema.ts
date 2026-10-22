/**
 * File: schema.ts
 * Purpose: Example custom block, "callout": a highlighted note with a title and Markdown text. Copy
 *          this folder to make your own block type; see docs/admin/custom-blocks.md.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import { z } from "zod";
import { markdown, text } from "../../../content/schema/fields";

export const schema = z
  .object({
    type: z.literal("callout"),
    title: text({ title: "Title" }),
    body: markdown({ title: "Text" }),
    tone: z.enum(["note", "highlight"]).meta({
      title: "Style",
      description: '"highlight" uses the accent colour',
    }),
  })
  .meta({
    title: "Callout",
    description: "A highlighted note (example custom block)",
  });
