/**
 * File: portfolio.ts
 * Purpose: Content types, inferred from the schema in src/content/schema so the types, the build-time
 *          validation and the admin forms can never drift apart. Type-only imports: zod is not bundled.
 * Author: Akilesh
 * Date: 2026-10-20 (updated 2026-10-22)
 */
import type { z } from "zod";
import type { Block, Page, PortfolioContent } from "../content/schema";
import type { BUILT_IN_BLOCK_SCHEMAS } from "../content/schema/blocks";
import type {
  degreeSchema,
  linkItemSchema,
  skillGroupSchema,
  timelineEntrySchema,
  toolSchema,
} from "../content/schema/entries";
import type {
  footerSchema,
  greetingSchema,
  researchProfilesSchema,
  seoSchema,
  settingsSchema,
  uiSchema,
} from "../content/schema/site";

/** Content is read-only at runtime; only the admin writes it, and only in dev. */
export type DeepReadonly<T> = T extends (infer U)[]
  ? readonly DeepReadonly<U>[]
  : T extends object
    ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
    : T;

type Content<S extends z.ZodType> = DeepReadonly<z.infer<S>>;

export type Portfolio = DeepReadonly<PortfolioContent>;
export type Settings = Content<typeof settingsSchema>;
export type Seo = Content<typeof seoSchema>;
export type Profile = Content<typeof greetingSchema>;
export type Footer = Content<typeof footerSchema>;
export type UiCopy = Content<typeof uiSchema>;
export type ResearchProfiles = Content<typeof researchProfilesSchema>;
export type LinkItem = Content<typeof linkItemSchema>;
export type SoftwareSkill = Content<typeof toolSchema>;
export type SkillGroup = Content<typeof skillGroupSchema>;
export type TimelineEntry = Content<typeof timelineEntrySchema>;
export type Degree = Content<typeof degreeSchema>;
export type PageConfig = DeepReadonly<Page>;
export type BlockConfig = DeepReadonly<Block>;
export type BlockOf<T extends BlockConfig["type"]> = Extract<
  BlockConfig,
  { readonly type: T }
>;
type BuiltInBlock = z.infer<(typeof BUILT_IN_BLOCK_SCHEMAS)[number]>;
/** Block types added in src/blocks/custom. */
export type CustomBlockType = Exclude<
  BlockConfig["type"],
  BuiltInBlock["type"]
>;

export interface NavItem {
  readonly path: string;
  readonly label: string;
}

export interface ProjectLanguage {
  readonly name: string;
}

/** Shape written by git_data_fetcher.mjs to src/shared/opensource/projects.json. */
export interface Project {
  readonly id: string;
  readonly name: string;
  readonly createdAt: string;
  readonly url: string;
  readonly description: string;
  readonly isFork: boolean;
  readonly stars: number;
  readonly isPinned: boolean;
  readonly languages: readonly ProjectLanguage[];
}
