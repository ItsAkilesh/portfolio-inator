/**
 * File: blocks.ts
 * Purpose: Schemas for page blocks. A page is an ordered list of blocks; each built-in type maps to
 *          a section component in src/blocks/BlockView.tsx, and custom types come from
 *          src/blocks/custom. Blocks that show site-wide data (hero, skills, projects, contact)
 *          carry only their own options.
 * Author: Akilesh
 * Date: 2026-10-21 (updated 2026-10-22)
 */
import { z } from "zod";
import { CUSTOM_BLOCK_SCHEMAS } from "../../blocks/custom/schemas.generated";
import { degreeSchema, linkItemSchema, timelineEntrySchema } from "./entries";
import { flag, image, link, list, longText, markdown, text } from "./fields";

export const heroBlockSchema = z
  .object({
    type: z.literal("hero"),
    showResearchCards: flag({ title: "Research cards under the icon cloud" }),
  })
  .meta({
    title: "Hero",
    description: "Name, summary, buttons, socials and the skill-icon cloud",
  });

export const skillsBlockSchema = z
  .object({
    type: z.literal("skills"),
    title: text({ title: "Title" }),
  })
  .meta({
    title: "What I do",
    description: "Every skill group from Site > Skills",
  });

export const headerBlockSchema = z
  .object({
    type: z.literal("header"),
    title: text({ title: "Title" }),
    description: longText({ title: "Intro" }),
    showPortrait: flag({ title: "Show portrait" }),
    showResearchCards: flag({ title: "Show research cards" }),
  })
  .meta({
    title: "Page header",
    description: "Large title band at the top of a page",
  });

export const timelineBlockSchema = z
  .object({
    type: z.literal("timeline"),
    groups: list(
      z
        .object({
          title: text({ title: "Tab name" }),
          entries: list(timelineEntrySchema, { title: "Entries" }),
        })
        .meta({ title: "Group", summaryKey: "title" }),
      { title: "Groups", description: "More than one group shows tabs" },
    ),
  })
  .meta({
    title: "Timeline",
    description: "Jobs, roles or events with logos and dates",
  });

export const degreesBlockSchema = z
  .object({
    type: z.literal("degrees"),
    items: list(degreeSchema, { title: "Degrees" }),
  })
  .meta({ title: "Degrees" });

export const featuredBlockSchema = z
  .object({
    type: z.literal("featured"),
    title: text({ title: "Title" }),
    entries: list(timelineEntrySchema, { title: "Entries" }),
  })
  .meta({ title: "Featured cards", description: "Large cards, e.g. patents" });

export const publicationsBlockSchema = z
  .object({
    type: z.literal("publications"),
    title: text({ title: "Title" }),
    entries: list(timelineEntrySchema, { title: "Publications" }),
  })
  .meta({
    title: "Publications",
    description: "Filterable list; the location is the venue",
  });

export const projectsBlockSchema = z
  .object({
    type: z.literal("projects"),
    moreLink: link({ title: "More link" }),
    moreLabel: text({ title: "More label" }),
  })
  .meta({
    title: "Projects",
    description: "Repositories from projects.json (pnpm fetch-data)",
  });

export const contactBlockSchema = z
  .object({
    type: z.literal("contact"),
    email: text({ title: "Email" }),
    phone: text({ title: "Phone" }),
  })
  .meta({
    title: "Contact",
    description: "Email, phone and the social links grid",
  });

export const linkGridBlockSchema = z
  .object({
    type: z.literal("linkGrid"),
    items: list(linkItemSchema, { title: "Links" }),
  })
  .meta({ title: "Link grid" });

export const textBlockSchema = z
  .object({
    type: z.literal("text"),
    heading: text({ title: "Heading", description: "Empty for none" }),
    body: markdown({
      title: "Text",
      description:
        "Markdown: **bold**, *italic*, [links](https://...), lists, headings",
    }),
  })
  .meta({ title: "Text", description: "A heading and Markdown text" });

export const imageBlockSchema = z
  .object({
    type: z.literal("image"),
    src: image({ title: "Image" }),
    alt: text({
      title: "Description",
      description: "Read aloud by screen readers",
    }),
    caption: text({ title: "Caption", description: "Empty for none" }),
  })
  .meta({ title: "Image" });

/** The block types this project ships; src/blocks/custom adds more (see docs/admin/custom-blocks.md). */
export const BUILT_IN_BLOCK_SCHEMAS = [
  heroBlockSchema,
  skillsBlockSchema,
  headerBlockSchema,
  timelineBlockSchema,
  degreesBlockSchema,
  featuredBlockSchema,
  publicationsBlockSchema,
  projectsBlockSchema,
  contactBlockSchema,
  linkGridBlockSchema,
  textBlockSchema,
  imageBlockSchema,
] as const;

export const blockSchema = z
  .discriminatedUnion("type", [
    ...BUILT_IN_BLOCK_SCHEMAS,
    ...CUSTOM_BLOCK_SCHEMAS,
  ])
  .meta({ title: "Block", summaryKey: "type" });
