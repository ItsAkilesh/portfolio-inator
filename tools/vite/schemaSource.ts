/**
 * File: schemaSource.ts
 * Purpose: Loads the content schema for the Vite plugins without importing it into vite.config.ts.
 *          A static import would make the schema (and the icon library and custom blocks it pulls in)
 *          a config dependency, and Vite restarts the dev server whenever one changes, which would
 *          also invalidate the admin console's token. The dev server loads it through its own module
 *          graph instead, so edits are picked up live; builds load it once with a module runner.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import { resolve } from "node:path";
import { runnerImport, type ViteDevServer } from "vite";

/* Type-only: erased at compile time, so it adds no runtime dependency. */
export type SchemaModule = typeof import("../../src/content/schema");
export type ContentSchema = SchemaModule["portfolioSchema"];
export type LoadSchema = () => Promise<ContentSchema>;

const SCHEMA_ENTRY = "src/content/schema/index.ts";

/** Fresh on every call: Vite invalidates the module when the schema or anything it imports changes. */
export const devSchema =
  (server: ViteDevServer): LoadSchema =>
  async () =>
    ((await server.ssrLoadModule(`/${SCHEMA_ENTRY}`)) as SchemaModule)
      .portfolioSchema;

/** Loads once per build. */
export function buildSchema(root: string): LoadSchema {
  let cached: Promise<ContentSchema> | null = null;
  return () => {
    cached ??= runnerImport<SchemaModule>(resolve(root, SCHEMA_ENTRY)).then(
      (result) => result.module.portfolioSchema,
    );
    return cached;
  };
}

/** For tests and scripts that already have the schema in hand. */
export const fixedSchema =
  (schema: ContentSchema): LoadSchema =>
  () =>
    Promise.resolve(schema);
