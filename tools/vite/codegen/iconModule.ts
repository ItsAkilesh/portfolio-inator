/**
 * File: iconModule.ts
 * Purpose: The icon library format (src/icons/library.json) and the generator for
 *          src/icons/simpleIcons.generated.ts, which imports exactly the simple-icons the library
 *          names so the site bundle only carries the icons in use. Pure string generation.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import { z } from "zod";

const ICON_KEY = /^[a-z0-9]+$/;
const SLUG = /^[a-z0-9]+$/;
const HEX = /^#[0-9a-fA-F]{6}$/;
const VIEW_BOX = /^-?\d+(\.\d+)? -?\d+(\.\d+)? \d+(\.\d+)? \d+(\.\d+)?$/;
/** SVG path data: commands, numbers, separators. Nothing that could hold markup or script. */
export const PATH_DATA = /^[MmLlHhVvCcSsQqTtAaZz0-9eE.,\s+-]+$/;
const MAX_PATH = 20_000;

export const customIconSchema = z.object({
  title: z.string().min(1).max(80),
  hex: z.string().regex(HEX),
  path: z.string().min(1).max(MAX_PATH).regex(PATH_DATA),
  viewBox: z.string().regex(VIEW_BOX),
});

export const iconLibrarySchema = z.object({
  simpleIcons: z.record(z.string().regex(ICON_KEY), z.string().regex(SLUG)),
  custom: z.record(z.string().regex(ICON_KEY), customIconSchema),
});

export type CustomIcon = z.infer<typeof customIconSchema>;
export type IconLibrary = z.infer<typeof iconLibrarySchema>;

export const isIconKeyText = (key: string): boolean => ICON_KEY.test(key);

/** simple-icons export name of a slug: "nodedotjs" to "siNodedotjs". */
export const exportNameOf = (slug: string): string =>
  `si${slug.charAt(0).toUpperCase()}${slug.slice(1)}`;

const sortedEntries = (record: Readonly<Record<string, string>>) =>
  Object.entries(record).sort(([a], [b]) => a.localeCompare(b));

export function renderSimpleIconsModule(library: IconLibrary): string {
  const entries = sortedEntries(library.simpleIcons);
  const names = [
    ...new Set(entries.map(([, slug]) => exportNameOf(slug))),
  ].sort();
  const imports = names.map((name) => `  ${name},`).join("\n");
  const map = entries
    .map(([key, slug]) => `  ${key}: ${exportNameOf(slug)},`)
    .join("\n");
  return `/**
 * File: simpleIcons.generated.ts
 * Purpose: GENERATED from src/icons/library.json by tools/vite/codegen; do not edit. Imports only the
 *          simple-icons the library uses, keyed by the icon keys the content refers to.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import {
${imports}
} from "simple-icons";

export const SIMPLE_ICONS = {
${map}
} as const;
`;
}

/** Stored form of the library: sorted keys, two-space JSON, trailing newline. */
export function serializeLibrary(library: IconLibrary): string {
  const sorted = <T>(record: Readonly<Record<string, T>>) =>
    Object.fromEntries(
      Object.entries(record).sort(([a], [b]) => a.localeCompare(b)),
    );
  return `${JSON.stringify({ simpleIcons: sorted(library.simpleIcons), custom: sorted(library.custom) }, null, 2)}\n`;
}
