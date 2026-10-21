/**
 * File: paths.ts
 * Purpose: Project-relative locations of the content, its JSON Schema and the image folder, shared by
 *          the Vite plugins and the admin server.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import { resolve } from "node:path";

export interface ProjectPaths {
  readonly contentFile: string;
  readonly schemaFile: string;
  readonly imagesDir: string;
}

export const projectPaths = (root: string): ProjectPaths => ({
  contentFile: resolve(root, "src/content/portfolio.json"),
  schemaFile: resolve(root, "src/content/portfolio.schema.json"),
  imagesDir: resolve(root, "public/images"),
});
