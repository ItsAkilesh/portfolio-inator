/**
 * File: DocsTool.tsx
 * Purpose: Guides tool: the Markdown guides in docs/admin, readable here (and on GitHub). Sections
 *          link to their guide with ?doc=<name>.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import { useSearchParams } from "react-router-dom";
import { Markdown } from "../../components/ui/Markdown";
import type { DocId } from "../sections";
import styles from "../admin.module.css";
import pages from "./toolPages.module.css";

const SOURCES = import.meta.glob<string>("/docs/admin/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
});

const GUIDES: readonly { readonly id: DocId; readonly title: string }[] = [
  { id: "getting-started", title: "Getting started" },
  { id: "pages-and-blocks", title: "Pages and blocks" },
  { id: "media-and-icons", title: "Media and icons" },
  { id: "importing", title: "Importing content" },
  { id: "publishing", title: "Building and publishing" },
  { id: "custom-blocks", title: "Custom blocks" },
  { id: "keyboard", title: "Keyboard shortcuts" },
];

export const sourceOf = (id: string): string | undefined =>
  SOURCES[`/docs/admin/${id}.md`];

export default function DocsTool() {
  const [params, setParams] = useSearchParams();
  const active = GUIDES.find((g) => g.id === params.get("doc")) ?? GUIDES[0];
  const source = active ? sourceOf(active.id) : undefined;
  return (
    <div className={pages.docs}>
      <nav aria-label="Guides" className={pages.docsNav}>
        {GUIDES.map((guide) => (
          <button
            key={guide.id}
            type="button"
            className={styles.navLink}
            aria-current={guide.id === active?.id ? "page" : undefined}
            onClick={() => setParams({ doc: guide.id })}
          >
            {guide.title}
          </button>
        ))}
      </nav>
      <article className={pages.docBody}>
        {source ? (
          <Markdown source={source} headingOffset={1} />
        ) : (
          <p>This guide is missing from docs/admin.</p>
        )}
      </article>
    </div>
  );
}
