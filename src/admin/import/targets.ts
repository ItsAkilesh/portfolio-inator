/**
 * File: targets.ts
 * Purpose: Where imported entries can go: every block of a given type across the pages, labelled by
 *          page and block, with the path of its entry list. Pure.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import { getIn, setIn, type Path } from "../paths";

export interface Target {
  readonly label: string;
  /** Path of the list the entries are appended to. */
  readonly listPath: Path;
}

interface PageLike {
  readonly label?: string;
  readonly blocks?: readonly {
    readonly type?: string;
    readonly title?: string;
    readonly groups?: readonly { readonly title?: string }[];
  }[];
}

/** Entry lists inside blocks of `type`; timelines offer each of their groups. */
export function blockTargets(content: unknown, type: string): Target[] {
  const pages = (getIn(content, ["pages"]) as PageLike[] | undefined) ?? [];
  return pages.flatMap((page, p) =>
    (page.blocks ?? []).flatMap((block, b) => {
      if (block.type !== type) return [];
      const base: Path = ["pages", p, "blocks", b];
      const where = `${page.label ?? `Page ${p + 1}`} › ${block.title ?? type}`;
      if (type === "timeline")
        return (block.groups ?? []).map((group, g) => ({
          label: `${page.label ?? ""} › ${group.title ?? `Group ${g + 1}`}`,
          listPath: [...base, "groups", g, "entries"],
        }));
      if (type === "degrees" || type === "linkGrid")
        return [{ label: where, listPath: [...base, "items"] }];
      return [{ label: where, listPath: [...base, "entries"] }];
    }),
  );
}

/** Content with `items` appended to the list at `listPath`. */
export function appendTo(
  content: unknown,
  listPath: Path,
  items: readonly unknown[],
): unknown {
  const list = (getIn(content, listPath) as unknown[] | undefined) ?? [];
  return setIn(content, listPath, [...list, ...items]);
}
