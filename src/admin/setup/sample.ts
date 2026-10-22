/**
 * File: sample.ts
 * Purpose: Setup wizard helpers: clearing the sample content a fork starts with (per area, keeping
 *          the page structure so the site still works), quick palettes, and spotting a fresh fork
 *          (the git remote's owner differs from the GitHub profile in the content). Pure.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import { getIn, setIn, type Path } from "../paths";

export type SampleArea =
  | "experience"
  | "education"
  | "research"
  | "skills"
  | "socials";

export const SAMPLE_AREAS: readonly {
  readonly id: SampleArea;
  readonly label: string;
}[] = [
  { id: "experience", label: "Experience timelines" },
  { id: "education", label: "Education" },
  { id: "research", label: "Featured cards and publications" },
  { id: "skills", label: "Skill groups" },
  { id: "socials", label: "Social links" },
];

interface BlockLike {
  readonly type?: string;
  readonly groups?: readonly unknown[];
}

const CLEARED_BY_TYPE: Readonly<Record<string, SampleArea>> = {
  timeline: "experience",
  degrees: "education",
  featured: "research",
  publications: "research",
};

function clearBlock(block: BlockLike): unknown {
  if (block.type === "timeline")
    return {
      ...block,
      groups: (block.groups ?? [])
        .slice(0, 1)
        .map((g) => ({ ...(g as object), entries: [] })),
    };
  if (block.type === "degrees") return { ...block, items: [] };
  return { ...block, entries: [] };
}

export function clearSample(
  content: unknown,
  areas: ReadonlySet<SampleArea>,
): unknown {
  let next = content;
  const pages =
    (getIn(next, ["pages"]) as { blocks?: BlockLike[] }[] | undefined) ?? [];
  pages.forEach((page, p) =>
    (page.blocks ?? []).forEach((block, b) => {
      const area = block.type ? CLEARED_BY_TYPE[block.type] : undefined;
      if (area && areas.has(area))
        next = setIn(next, ["pages", p, "blocks", b], clearBlock(block));
    }),
  );
  const lists: [SampleArea, Path][] = [
    ["skills", ["skills"]],
    ["socials", ["site", "socialLinks"]],
  ];
  for (const [area, path] of lists)
    if (areas.has(area)) next = setIn(next, path, []);
  return next;
}

export const QUICK_PALETTES = [
  { name: "ocean", label: "Ocean", hue: 230, chroma: 0.16 },
  { name: "forest", label: "Forest", hue: 150, chroma: 0.12 },
  { name: "sunset", label: "Sunset", hue: 35, chroma: 0.17 },
  { name: "grape", label: "Grape", hue: 300, chroma: 0.15 },
  { name: "graphite", label: "Graphite", hue: 260, chroma: 0.02 },
] as const;

export const QUICK_LIGHTNESS = 0.42;

/** Adds (or updates) a quick palette and makes it active. */
export function applyQuickPalette(
  content: unknown,
  palette: (typeof QUICK_PALETTES)[number],
): unknown {
  const source = {
    kind: "generated",
    hue: palette.hue,
    chroma: palette.chroma,
    lightness: QUICK_LIGHTNESS,
  };
  return setIn(
    setIn(content, ["theme", "palettes"], {
      ...(getIn(content, ["theme", "palettes"]) as object),
      [palette.name]: source,
    }),
    ["theme", "activePalette"],
    palette.name,
  );
}

const ownerOf = (url: string): string | null =>
  /github\.com[/:]([^/]+)/i.exec(url)?.[1]?.toLowerCase() ?? null;

/** True when the repository belongs to someone else than the GitHub profile in the content. */
export function looksLikeFreshFork(
  repoUrl: string | null,
  githubProfile: string,
): boolean {
  const repoOwner = repoUrl ? ownerOf(repoUrl) : null;
  const profileOwner = ownerOf(githubProfile);
  return (
    repoOwner !== null && profileOwner !== null && repoOwner !== profileOwner
  );
}
