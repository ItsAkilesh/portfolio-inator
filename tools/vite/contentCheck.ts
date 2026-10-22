/**
 * File: contentCheck.ts
 * Purpose: Vite plugin that validates src/content/portfolio.json when a build or the dev server starts
 *          (an invalid file fails the build with every problem listed) and on every save in dev, where
 *          problems appear in the error overlay. In dev it also keeps portfolio.schema.json current and
 *          announces content changes with an event instead of a full page reload.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import { readFile, writeFile } from "node:fs/promises";
import type { Plugin, ViteDevServer } from "vite";
import { CONTENT_CHANGED_EVENT } from "../../src/content/events";
import { describeError, logger } from "../../src/lib/logger";
import { isSameFile, projectPaths, type ProjectPaths } from "./paths";
import { contentJsonSchema, validateContent } from "./validate";

async function checkFile(paths: ProjectPaths): Promise<readonly string[]> {
  try {
    const result = validateContent(
      JSON.parse(await readFile(paths.contentFile, "utf8")),
    );
    return result.ok ? [] : result.issues;
  } catch (error) {
    return [`portfolio.json could not be read: ${describeError(error)}`];
  }
}

async function refreshJsonSchema(paths: ProjectPaths): Promise<void> {
  const next = contentJsonSchema();
  const current = await readFile(paths.schemaFile, "utf8").catch(() => "");
  if (current === next) return;
  await writeFile(paths.schemaFile, next, "utf8");
  logger.info("content.schema", "portfolio.schema.json updated");
}

function reportInDev(server: ViteDevServer, issues: readonly string[]): void {
  if (issues.length === 0) return;
  logger.warn("content.check", `${issues.length} problem(s) in portfolio.json`);
  server.ws.send({
    type: "error",
    err: {
      message: `portfolio.json is invalid:\n${issues.join("\n")}`,
      stack: "",
    },
  });
}

function watchContent(server: ViteDevServer, paths: ProjectPaths): void {
  refreshJsonSchema(paths).catch((error: unknown) =>
    logger.warn("content.schema", describeError(error)),
  );
  server.watcher.on("change", (file) => {
    if (!isSameFile(file, paths.contentFile)) return;
    checkFile(paths)
      .then((issues) => reportInDev(server, issues))
      .catch((error: unknown) =>
        logger.error("content.check", describeError(error)),
      );
  });
}

export function contentCheck(): Plugin {
  let paths = projectPaths(process.cwd());
  let isBuild = true;
  return {
    name: "portfolio-content-check",
    configResolved(config) {
      paths = projectPaths(config.root);
      isBuild = config.command === "build";
    },
    async buildStart() {
      const issues = await checkFile(paths);
      if (issues.length === 0) return;
      const message = `portfolio.json is invalid:\n${issues.join("\n")}`;
      /* A build must fail; the dev server keeps running so the admin can fix the file. */
      if (isBuild) this.error(message);
      else logger.warn("content.check", message);
    },
    /*
     * Replace Vite's default full reload for portfolio.json with an event, so the admin console keeps
     * its place and refreshes its draft while site pages still reload.
     */
    handleHotUpdate(ctx) {
      if (!isSameFile(ctx.file, paths.contentFile)) return undefined;
      ctx.server.ws.send({ type: "custom", event: CONTENT_CHANGED_EVENT });
      return [];
    },
    configureServer(server) {
      watchContent(server, paths);
    },
  };
}
