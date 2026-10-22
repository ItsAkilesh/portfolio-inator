/**
 * File: iconCatalog.ts
 * Purpose: Search over every icon simple-icons ships (about 3,400), for the admin icon picker. The
 *          package is loaded on first use, only in the dev server.
 * Author: Akilesh
 * Date: 2026-10-21
 */
export interface CatalogIcon {
  readonly slug: string;
  readonly title: string;
  readonly hex: string;
  readonly path: string;
}

const DEFAULT_LIMIT = 40;
const MAX_LIMIT = 100;

let catalog: Promise<readonly CatalogIcon[]> | null = null;

const isCatalogIcon = (value: unknown): value is CatalogIcon =>
  typeof value === "object" &&
  value !== null &&
  typeof (value as CatalogIcon).slug === "string" &&
  typeof (value as CatalogIcon).path === "string";

async function loadCatalog(): Promise<readonly CatalogIcon[]> {
  const icons: Record<string, unknown> = await import("simple-icons");
  return Object.values(icons)
    .filter(isCatalogIcon)
    .map(({ slug, title, hex, path }) => ({ slug, title, hex, path }));
}

export function iconCatalog(): Promise<readonly CatalogIcon[]> {
  catalog ??= loadCatalog();
  return catalog;
}

const normalise = (text: string): string =>
  text.toLowerCase().replace(/[^a-z0-9]/g, "");

/** Ranks exact, then prefix, then substring matches of the title or slug. */
function rank(icon: CatalogIcon, query: string): number {
  const title = normalise(icon.title);
  if (icon.slug === query || title === query) return 0;
  if (icon.slug.startsWith(query) || title.startsWith(query)) return 1;
  if (icon.slug.includes(query) || title.includes(query)) return 2;
  return -1;
}

export function searchCatalog(
  icons: readonly CatalogIcon[],
  query: string,
  limit = DEFAULT_LIMIT,
): CatalogIcon[] {
  const q = normalise(query);
  if (!q) return [];
  return icons
    .map((icon) => ({ icon, score: rank(icon, q) }))
    .filter((hit) => hit.score >= 0)
    .sort(
      (a, b) => a.score - b.score || a.icon.title.localeCompare(b.icon.title),
    )
    .slice(0, Math.min(Math.max(limit, 1), MAX_LIMIT))
    .map((hit) => hit.icon);
}

export const findBySlug = (
  icons: readonly CatalogIcon[],
  slug: string,
): CatalogIcon | undefined => icons.find((icon) => icon.slug === slug);
