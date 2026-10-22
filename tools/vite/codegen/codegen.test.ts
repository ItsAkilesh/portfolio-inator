/**
 * File: codegen.test.ts
 * Purpose: Tests that the committed generated modules match their sources, and the icon library
 *          format and module generator.
 * Author: Akilesh
 * Date: 2026-10-21
 */
// @vitest-environment node
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import * as simpleIcons from "simple-icons";
import { describe, expect, it } from "vitest";
import {
  exportNameOf,
  iconLibrarySchema,
  renderSimpleIconsModule,
  serializeLibrary,
} from "./iconModule";

const ROOT = resolve(__dirname, "../../..");
const read = (path: string) => readFileSync(resolve(ROOT, path), "utf8");
const library = iconLibrarySchema.parse(
  JSON.parse(read("src/icons/library.json")),
);

describe("icon library", () => {
  it("is stored in its canonical form", () => {
    expect(serializeLibrary(library)).toBe(read("src/icons/library.json"));
  });
  it("matches the committed generated module", () => {
    expect(renderSimpleIconsModule(library)).toBe(
      read("src/icons/simpleIcons.generated.ts"),
    );
  });
  it("names only icons simple-icons exports", () => {
    for (const slug of Object.values(library.simpleIcons))
      expect(exportNameOf(slug) in simpleIcons, slug).toBe(true);
  });
  it("rejects unsafe custom icons", () => {
    const bad = {
      simpleIcons: {},
      custom: {
        x: {
          title: "x",
          hex: "#000000",
          path: "M0 0<script>",
          viewBox: "0 0 24 24",
        },
      },
    };
    expect(iconLibrarySchema.safeParse(bad).success).toBe(false);
    expect(
      iconLibrarySchema.safeParse({
        simpleIcons: { "Bad Key": "github" },
        custom: {},
      }).success,
    ).toBe(false);
  });
  it("generates sorted, de-duplicated imports", () => {
    const text = renderSimpleIconsModule({
      simpleIcons: { b: "github", a: "github", c: "c" },
      custom: {},
    });
    expect(text).toContain(
      'import {\n  siC,\n  siGithub,\n} from "simple-icons";',
    );
    expect(text).toContain("  a: siGithub,\n  b: siGithub,\n  c: siC,");
  });
});
