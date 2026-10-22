/**
 * File: iconStore.ts
 * Purpose: Reads and changes the icon library (src/icons/library.json) for the admin API and keeps
 *          src/icons/simpleIcons.generated.ts in step with it. Adds simple-icons by slug, imports SVGs
 *          as custom icons, and removes icons no content uses. Writes are queued and atomic.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import { readFile } from "node:fs/promises";
import {
  iconLibrarySchema,
  isIconKeyText,
  renderSimpleIconsModule,
  serializeLibrary,
  type IconLibrary,
} from "../codegen/iconModule";
import { SerialQueue, writeFileAtomic, writeIfChanged } from "../fsAtomic";
import { findBySlug, iconCatalog } from "./iconCatalog";
import { svgToIcon } from "./svgIcon";

export type IconChange =
  | { readonly ok: true; readonly key: string }
  | { readonly ok: false; readonly reason: string };

export interface CustomIconInput {
  readonly key: string;
  readonly title: string;
  readonly hex: string;
  readonly svg: string;
}

const HEX = /^#[0-9a-fA-F]{6}$/;
const MAX_TITLE = 80;

const keyProblem = (library: IconLibrary, key: string): string | null => {
  if (!isIconKeyText(key))
    return "Icon keys use lowercase letters and digits only";
  if (key in library.simpleIcons || key in library.custom)
    return `An icon named "${key}" already exists`;
  return null;
};

export class IconStore {
  private readonly queue = new SerialQueue();

  constructor(
    private readonly libraryFile: string,
    private readonly moduleFile: string,
  ) {}

  async read(): Promise<IconLibrary> {
    return iconLibrarySchema.parse(
      JSON.parse(await readFile(this.libraryFile, "utf8")),
    );
  }

  /** Regenerates the simple-icons module if it no longer matches the library. */
  async syncModule(): Promise<boolean> {
    return writeIfChanged(
      this.moduleFile,
      renderSimpleIconsModule(await this.read()),
    );
  }

  addSimple(slug: string, requestedKey?: string): Promise<IconChange> {
    return this.queue.run(async () => {
      const library = await this.read();
      const existing = Object.entries(library.simpleIcons).find(
        ([, s]) => s === slug,
      );
      if (existing) return { ok: true, key: existing[0] };
      if (!findBySlug(await iconCatalog(), slug))
        return { ok: false, reason: "simple-icons has no such icon" };
      const key = requestedKey ?? slug;
      const problem = keyProblem(library, key);
      if (problem) return { ok: false, reason: problem };
      await this.write({
        ...library,
        simpleIcons: { ...library.simpleIcons, [key]: slug },
      });
      return { ok: true, key };
    });
  }

  addCustom(input: CustomIconInput): Promise<IconChange> {
    return this.queue.run(async () => {
      const library = await this.read();
      const problem = keyProblem(library, input.key);
      if (problem) return { ok: false, reason: problem };
      if (!HEX.test(input.hex))
        return { ok: false, reason: "Use a colour like #1A2B3C" };
      const title = input.title.trim().slice(0, MAX_TITLE);
      if (!title) return { ok: false, reason: "Give the icon a name" };
      const icon = svgToIcon(input.svg);
      if (!icon.ok) return icon;
      const custom = {
        title,
        hex: input.hex.toUpperCase(),
        path: icon.path,
        viewBox: icon.viewBox,
      };
      await this.write({
        ...library,
        custom: { ...library.custom, [input.key]: custom },
      });
      return { ok: true, key: input.key };
    });
  }

  /** Removes an icon; the caller checks it is unused. The last icons the site itself needs stay. */
  remove(key: string, protectedKeys: ReadonlySet<string>): Promise<IconChange> {
    return this.queue.run(async () => {
      if (protectedKeys.has(key))
        return { ok: false, reason: `"${key}" is used by the site itself` };
      const library = await this.read();
      const simpleIcons = Object.fromEntries(
        Object.entries(library.simpleIcons).filter(([k]) => k !== key),
      );
      const custom = Object.fromEntries(
        Object.entries(library.custom).filter(([k]) => k !== key),
      );
      if (
        Object.keys(simpleIcons).length + Object.keys(custom).length ===
        Object.keys(library.simpleIcons).length +
          Object.keys(library.custom).length
      )
        return { ok: false, reason: `No icon named "${key}"` };
      await this.write({ simpleIcons, custom });
      return { ok: true, key };
    });
  }

  /* Module first: if the library write then fails, the module only has an unused extra import. */
  private async write(library: IconLibrary): Promise<void> {
    await writeIfChanged(this.moduleFile, renderSimpleIconsModule(library));
    await writeFileAtomic(this.libraryFile, serializeLibrary(library));
  }
}
