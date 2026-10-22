/**
 * File: services.ts
 * Purpose: Everything the admin API works with, created once per dev server: the content, images,
 *          icon library, history, GitHub projects, build, git and link checks.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import type { ProjectPaths } from "../paths";
import type { LoadSchema } from "../schemaSource";
import { BuildRunner } from "./buildRunner";
import { ContentStore } from "./contentStore";
import { GitService } from "./gitService";
import { HistoryStore } from "./historyStore";
import { IconStore } from "./iconStore";
import { ImageStore } from "./imageStore";
import { LinkChecker } from "./linkChecker";
import { ProjectsService } from "./projectsService";

export interface Services {
  readonly loadSchema: LoadSchema;
  readonly content: ContentStore;
  readonly images: ImageStore;
  readonly icons: IconStore;
  readonly history: HistoryStore;
  readonly projects: ProjectsService;
  readonly build: BuildRunner;
  readonly git: GitService;
  readonly links: LinkChecker;
}

export function createServices(
  paths: ProjectPaths,
  loadSchema: LoadSchema,
): Services {
  const history = new HistoryStore(paths.historyDir);
  return {
    loadSchema,
    history,
    content: new ContentStore(paths.contentFile, loadSchema, history),
    images: new ImageStore(paths.imagesDir, history),
    icons: new IconStore(paths.iconLibraryFile, paths.iconModuleFile),
    projects: ProjectsService.forProject(
      paths.root,
      paths.projectsFile,
      paths.fetcherScript,
    ),
    build: BuildRunner.forProject(paths.root),
    git: GitService.forProject(paths.root),
    links: new LinkChecker(),
  };
}
