/**
 * File: ProjectsBlock.tsx
 * Purpose: "projects" block: the GitHub project list and a link to the full profile.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import { SmartLink } from "../components/ui/SmartLink";
import { projects } from "../portfolio";
import { ProjectList } from "../sections/ProjectList";
import type { BlockOf } from "../types/portfolio";
import styles from "./blocks.module.css";

export default function ProjectsBlock({
  block,
}: {
  readonly block: BlockOf<"projects">;
}) {
  return (
    <>
      <ProjectList items={projects} />
      <SmartLink href={block.moreLink} className={styles.more}>
        {block.moreLabel}{" "}
        <span className="arrow" aria-hidden="true">
          ↗
        </span>
      </SmartLink>
    </>
  );
}
