/**
 * File: useIconImport.ts
 * Purpose: Adds icons to the library from the console: a simple-icons pick or an imported SVG. The
 *          library change regenerates code, so the console reloads; the draft (with the field already
 *          pointing at the new icon) is kept in local storage first and restored after the reload.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import { useCallback, useContext, useState } from "react";
import { ICONS } from "../../icons/registry";
import { AdminContext } from "../AdminContext";
import { addIcon, importIcon } from "../api/assets";
import type { ApiResult } from "../api/client";
import { writeStash } from "../draftStash";
import { useNotify } from "../notices";
import { setIn, type Path } from "../paths";

/** "github" or, if taken, "github2", "github3", ... (keys are lowercase letters and digits). */
export function freeKey(base: string, taken: ReadonlySet<string>): string {
  const clean = base.toLowerCase().replace(/[^a-z0-9]/g, "") || "icon";
  if (!taken.has(clean)) return clean;
  let n = 2;
  while (taken.has(`${clean}${n}`)) n += 1;
  return `${clean}${n}`;
}

export const takenKeys = (): ReadonlySet<string> => new Set(Object.keys(ICONS));

export interface SvgInput {
  readonly key: string;
  readonly title: string;
  readonly hex: string;
  readonly svg: string;
}

type ImportCall = () => Promise<ApiResult<{ key: string }>>;

interface ImportDeps {
  readonly draft: unknown;
  readonly version: string;
  readonly notify: ReturnType<typeof useNotify>;
  readonly setIsBusy: (isBusy: boolean) => void;
}

/** Stashes the draft, runs the library change and reloads; on failure, undoes the stash and reports. */
async function importAndReload(
  { draft, version, notify, setIsBusy }: ImportDeps,
  key: string,
  fieldPath: Path | null,
  call: ImportCall,
): Promise<boolean> {
  setIsBusy(true);
  /* Restored after the reload below, with the field already pointing at the new icon. */
  writeStash(fieldPath ? setIn(draft, fieldPath, key) : draft, version, "set");
  const result = await call();
  if (!result.ok) {
    setIsBusy(false);
    writeStash(draft, version, "clear");
    notify(result.issues.join("; "), "error");
    return false;
  }
  notify(`Added the "${result.data.key}" icon`);
  /*
   * The library change regenerates code. Reloading at once gives one predictable restart (hot
   * updates alone can remount the console part-way); the stash brings the draft back.
   */
  window.location.reload();
  return true;
}

export function useIconImport() {
  const admin = useContext(AdminContext);
  const notify = useNotify();
  const [isBusy, setIsBusy] = useState(false);
  const run = useCallback(
    async (key: string, fieldPath: Path | null, call: ImportCall) => {
      if (!admin) return false;
      const { draft, version } = admin.content.state;
      return importAndReload(
        { draft, version, notify, setIsBusy },
        key,
        fieldPath,
        call,
      );
    },
    [admin, notify],
  );
  const addFromCatalog = useCallback(
    (slug: string, fieldPath: Path | null) => {
      const key = freeKey(slug, takenKeys());
      return run(key, fieldPath, () => addIcon(slug, key));
    },
    [run],
  );
  const importSvg = useCallback(
    (input: SvgInput, fieldPath: Path | null) =>
      run(input.key, fieldPath, () => importIcon(input)),
    [run],
  );
  return { isAvailable: admin !== null, isBusy, addFromCatalog, importSvg };
}
