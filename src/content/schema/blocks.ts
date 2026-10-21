/**
 * File: blocks.ts
 * Purpose: Schemas for page blocks. A page is an ordered list of blocks; each block type maps to an
 *          existing section component in src/blocks/registry.tsx. Blocks that show site-wide data
 *          (hero, skills, projects, contact) carry only their own options.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import { z } from "zod";
import { degreeSchema, linkItemSchema, timelineEntrySchema } from "./entries";
import { flag, image, link, list, longText, text } from "./fields";

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
    paragraphs: list(longText({ title: "Paragraph" }), { title: "Paragraphs" }),
  })
  .meta({ title: "Text" });

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

export const blockSchema = z
  .discriminatedUnion("type", [
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
  ])
  .meta({ title: "Block", summaryKey: "type" });
