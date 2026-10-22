/**
 * File: paths.ts
 * Purpose: Project-relative locations of the content, its JSON Schema, images, the icon library,
 *          generated modules and the admin history folder, shared by the Vite plugins and the admin server.
 * Author: Akilesh
 * Date: 2026-10-21 (updated 2026-10-22)
 */
import { resolve } from "node:path";

export interface ProjectPaths {
  readonly root: string;
  readonly contentFile: string;
  readonly schemaFile: string;
  readonly imagesDir: string;
  readonly iconLibraryFile: string;
  readonly iconModuleFile: string;
  /** Previous versions of portfolio.json and removed images; git-ignored. */
  readonly historyDir: string;
  readonly projectsFile: string;
  readonly fetcherScript: string;
  readonly customBlocksDir: string;
}

/**
 * True when two paths name the same file. Vite reports changed files with forward slashes while
 * path.resolve() returns backslashes on Windows, and Windows drive letters differ in case.
 */
export function isSameFile(a: string, b: string): boolean {
  const normalize = (p: string) =>
    p.replace(/\\/g, "/").replace(/^[a-z]:/i, (d) => d.toLowerCase());
  return normalize(a) === normalize(b);
}

export const projectPaths = (root: string): ProjectPaths => ({
  root,
  contentFile: resolve(root, "src/content/portfolio.json"),
  schemaFile: resolve(root, "src/content/portfolio.schema.json"),
  imagesDir: resolve(root, "public/images"),
  iconLibraryFile: resolve(root, "src/icons/library.json"),
  iconModuleFile: resolve(root, "src/icons/simpleIcons.generated.ts"),
  historyDir: resolve(root, ".admin-history"),
  projectsFile: resolve(root, "src/shared/opensource/projects.json"),
  fetcherScript: resolve(root, "git_data_fetcher.mjs"),
  customBlocksDir: resolve(root, "src/blocks/custom"),
});
