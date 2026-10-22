/**
 * File: plugin.ts
 * Purpose: Vite plugin that keeps generated modules in step with their sources, in dev and in
 *          builds: the simple-icons module from src/icons/library.json, and the custom block modules
 *          from the folders in src/blocks/custom. Changes are picked up while the dev server runs.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import { join } from "node:path";
import type { Plugin } from "vite";
import { describeError, logger } from "../../../src/lib/logger";
import { IconStore } from "../admin/iconStore";
import { writeIfChanged } from "../fsAtomic";
import { isSameFile, projectPaths, type ProjectPaths } from "../paths";
import {
  COMPONENTS_FILE,
  SCHEMAS_FILE,
  findCustomBlocks,
  renderComponentsModule,
  renderSchemasModule,
} from "./customBlocks";

async function generateBlocks(paths: ProjectPaths): Promise<void> {
  const names = await findCustomBlocks(paths.customBlocksDir);
  const wrote = await Promise.all([
    writeIfChanged(
      join(paths.customBlocksDir, SCHEMAS_FILE),
      renderSchemasModule(names),
    ),
    writeIfChanged(
      join(paths.customBlocksDir, COMPONENTS_FILE),
      renderComponentsModule(names),
    ),
  ]);
  if (wrote.some(Boolean))
    logger.info(
      "codegen.blocks",
      `custom blocks: ${names.join(", ") || "none"}`,
    );
}

export async function generateAll(paths: ProjectPaths): Promise<void> {
  const icons = new IconStore(paths.iconLibraryFile, paths.iconModuleFile);
  if (await icons.syncModule())
    logger.info("codegen.icons", "simpleIcons.generated.ts updated");
  await generateBlocks(paths);
}

const normalise = (path: string): string => path.replace(/\\/g, "/");
const isInside = (file: string, dir: string): boolean =>
  normalise(file).startsWith(`${normalise(dir)}/`);

export function codegen(): Plugin {
  let paths = projectPaths(process.cwd());
  return {
    name: "portfolio-codegen",
    configResolved(config) {
      paths = projectPaths(config.root);
    },
    async buildStart() {
      await generateAll(paths);
    },
    configureServer(server) {
      const regenerate = () =>
        generateAll(paths).catch((error: unknown) =>
          logger.error("codegen", describeError(error)),
        );
      server.watcher.on("change", (file) => {
        if (isSameFile(file, paths.iconLibraryFile)) void regenerate();
      });
      /* A block folder or file added or removed changes which custom blocks exist. */
      for (const event of ["add", "unlink", "addDir", "unlinkDir"] as const)
        server.watcher.on(event, (file: string) => {
          if (
            isInside(file, paths.customBlocksDir) &&
            !file.endsWith(".generated.ts")
          )
            void regenerate();
        });
    },
  };
}
