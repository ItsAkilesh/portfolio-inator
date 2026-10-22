/**
 * File: customBlocks.test.ts
 * Purpose: Tests for custom block discovery and generation, and that the committed generated
 *          modules match the folders in src/blocks/custom.
 * Author: Akilesh
 * Date: 2026-10-22
 */
// @vitest-environment node
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import {
  COMPONENTS_FILE,
  SCHEMAS_FILE,
  findCustomBlocks,
  renderComponentsModule,
  renderSchemasModule,
} from "./customBlocks";

const CUSTOM = resolve(__dirname, "../../../src/blocks/custom");
const temp: string[] = [];
afterAll(async () =>
  Promise.all(temp.map((dir) => rm(dir, { recursive: true, force: true }))),
);

describe("custom blocks", () => {
  it("finds only complete, well-named block folders", async () => {
    const dir = await mkdtemp(join(tmpdir(), "blocks-"));
    temp.push(dir);
    for (const [name, files] of [
      ["quote", ["schema.ts", "Block.tsx"]],
      ["halfDone", ["schema.ts"]],
      ["Bad-Name", ["schema.ts", "Block.tsx"]],
    ] as const) {
      await mkdir(join(dir, name));
      for (const file of files) await writeFile(join(dir, name, file), "");
    }
    expect(await findCustomBlocks(dir)).toEqual(["quote"]);
    expect(await findCustomBlocks(join(dir, "missing"))).toEqual([]);
  });
  it("generates imports for each block, and valid empty modules for none", () => {
    expect(renderSchemasModule(["a", "b"])).toContain(
      "export const CUSTOM_BLOCK_SCHEMAS = [a, b] as const;",
    );
    expect(renderComponentsModule(["a"])).toContain(
      'a: lazy(() => import("./a/Block")),',
    );
    expect(renderSchemasModule([])).toContain("= [] as const;");
  });
  it("matches the committed generated modules", async () => {
    const names = await findCustomBlocks(CUSTOM);
    expect(names).toContain("callout");
    expect(await readFile(join(CUSTOM, SCHEMAS_FILE), "utf8")).toBe(
      renderSchemasModule(names),
    );
    expect(await readFile(join(CUSTOM, COMPONENTS_FILE), "utf8")).toBe(
      renderComponentsModule(names),
    );
  });
});
