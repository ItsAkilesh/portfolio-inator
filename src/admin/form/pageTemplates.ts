/**
 * File: pageTemplates.ts
 * Purpose: Ready-made pages for "New page from template": a set of blocks that suits a common page,
 *          with placeholder text to replace. Images use the portrait already set, so every template
 *          is valid as soon as it is added (a test checks each one against the schema).
 * Author: Akilesh
 * Date: 2026-10-21
 */
import { emptyValue, unionOptions } from "../../content/introspect";
import { blockSchema } from "../../content/schema/blocks";

export interface PageTemplate {
  readonly id: string;
  readonly label: string;
  readonly description: string;
  /** Block types in order; each starts from its empty value plus `fill`. */
  readonly blocks: readonly {
    readonly type: string;
    readonly fill?: Readonly<Record<string, unknown>>;
  }[];
}

const header = (title: string, description: string) => ({
  type: "header",
  fill: { title, description, showPortrait: false, showResearchCards: false },
});

export const PAGE_TEMPLATES: readonly PageTemplate[] = [
  {
    id: "blank",
    label: "Blank",
    description: "A page header only",
    blocks: [header("New page", "A sentence about this page.")],
  },
  {
    id: "experience",
    label: "Experience",
    description: "Header and a timeline of roles",
    blocks: [
      header("Experience", "Where I have worked."),
      { type: "timeline" },
    ],
  },
  {
    id: "research",
    label: "Research",
    description: "Header, featured cards and publications",
    blocks: [
      header("Research", "Papers and patents."),
      { type: "featured", fill: { title: "Featured" } },
      { type: "publications", fill: { title: "Publications" } },
    ],
  },
  {
    id: "talks",
    label: "Talks",
    description: "Header and a timeline of talks",
    blocks: [header("Talks", "Conferences and meetups."), { type: "timeline" }],
  },
  {
    id: "writing",
    label: "Writing",
    description: "Header and a text section",
    blocks: [
      header("Writing", "Notes and essays."),
      {
        type: "text",
        fill: { heading: "Latest", body: "Write here. **Markdown** works." },
      },
    ],
  },
  {
    id: "links",
    label: "Links",
    description: "Header and a grid of links",
    blocks: [header("Links", "Find me elsewhere."), { type: "linkGrid" }],
  },
  {
    id: "contact",
    label: "Contact",
    description: "Header and contact details",
    blocks: [
      header("Get in touch", "The best ways to reach me."),
      { type: "contact" },
    ],
  },
];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/** A new page from a template, with an id and path not used by `existing` pages. */
export function pageFromTemplate(
  template: PageTemplate,
  existing: readonly unknown[],
  portrait: string,
): unknown {
  const taken = new Set(
    existing.flatMap((page) =>
      isRecord(page) && typeof page.id === "string" ? [page.id] : [],
    ),
  );
  let id = template.id === "blank" ? "page" : template.id;
  for (let n = 2; taken.has(id); n += 1)
    id = `${template.id === "blank" ? "page" : template.id}-${n}`;
  const options = unionOptions(blockSchema);
  const blocks = template.blocks.map((block) => {
    const option = options.find((o) => o.value === block.type);
    const base = option ? emptyValue(option.schema) : { type: block.type };
    return {
      ...(isRecord(base) ? base : {}),
      ...block.fill,
      ...(block.type === "image" ? { src: portrait } : {}),
    };
  });
  return { id, path: `/${id}`, label: template.label, showInNav: true, blocks };
}
