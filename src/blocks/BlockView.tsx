/**
 * File: BlockView.tsx
 * Purpose: Renders one page block with its section component. The switch is exhaustive over the block
 *          types in src/content/schema/blocks.ts, so adding a block type without a renderer fails
 *          type-checking. Sections below the fold are code-split.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import { lazy, type ReactNode } from "react";
import { HomeHero } from "../sections/HomeHero";
import { SkillsShowcase } from "../sections/SkillsShowcase";
import type { BlockConfig } from "../types/portfolio";
import HeaderBlock from "./HeaderBlock";
import styles from "./blocks.module.css";

const TimelineBlock = lazy(() => import("./TimelineBlock"));
const ProjectsBlock = lazy(() => import("./ProjectsBlock"));
const TextBlock = lazy(() => import("./TextBlock"));
const ImageBlock = lazy(() => import("./ImageBlock"));
const DegreeList = lazy(() =>
  import("../sections/DegreeList").then((m) => ({ default: m.DegreeList })),
);
const FeaturedResearch = lazy(() =>
  import("../sections/FeaturedResearch").then((m) => ({
    default: m.FeaturedResearch,
  })),
);
const PublicationList = lazy(() =>
  import("../sections/PublicationList").then((m) => ({
    default: m.PublicationList,
  })),
);
const ContactPanel = lazy(() =>
  import("../sections/ContactPanel").then((m) => ({ default: m.ContactPanel })),
);
const LinkGrid = lazy(() =>
  import("../components/ui/LinkGrid").then((m) => ({ default: m.LinkGrid })),
);

/** Wraps blocks that sit inside the page gutter and share the vertical rhythm. */
const Contained = ({ children }: { readonly children: ReactNode }) => (
  <div className={`wrap ${styles.contained}`}>{children}</div>
);

function unknownBlock(block: never): null {
  void block;
  return null;
}

export function BlockView({
  block,
}: {
  readonly block: BlockConfig;
}): ReactNode {
  switch (block.type) {
    case "hero":
      return <HomeHero showResearchCards={block.showResearchCards} />;
    case "skills":
      return <SkillsShowcase title={block.title} />;
    case "header":
      return <HeaderBlock block={block} />;
    case "contact":
      return <ContactPanel email={block.email} phone={block.phone} />;
    case "timeline":
      return (
        <Contained>
          <TimelineBlock block={block} />
        </Contained>
      );
    case "degrees":
      return (
        <Contained>
          <DegreeList items={block.items} />
        </Contained>
      );
    case "featured":
      return (
        <Contained>
          <FeaturedResearch title={block.title} entries={block.entries} />
        </Contained>
      );
    case "publications":
      return (
        <Contained>
          <PublicationList title={block.title} entries={block.entries} />
        </Contained>
      );
    case "projects":
      return (
        <Contained>
          <ProjectsBlock block={block} />
        </Contained>
      );
    case "linkGrid":
      return (
        <Contained>
          <LinkGrid items={block.items} label="Links" />
        </Contained>
      );
    case "text":
      return (
        <Contained>
          <TextBlock block={block} />
        </Contained>
      );
    case "image":
      return (
        <Contained>
          <ImageBlock block={block} />
        </Contained>
      );
    default:
      return unknownBlock(block);
  }
}
