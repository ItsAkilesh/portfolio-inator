/**
 * File: introspect.test.ts
 * Purpose: Tests that the form generator reads the real content schema correctly: every block type
 *          gets an empty value of the right shape, and field schemas resolve by path.
 * Author: Akilesh
 * Date: 2026-10-21 (updated 2026-10-22)
 */
import { describe, expect, it } from "vitest";
import { z } from "zod";
import rawContent from "./portfolio.json";
import { portfolioSchema } from "./schema";
import { blockSchema } from "./schema/blocks";
import {
  emptyValue,
  enumOptions,
  kindOf,
  metaOf,
  schemaAt,
  titleOf,
  unionOptions,
} from "./introspect";

describe("kindOf", () => {
  it("classifies schema nodes", () => {
    expect(kindOf(z.string())).toBe("string");
    expect(kindOf(z.number().optional())).toBe("number");
    expect(kindOf(z.array(z.string()))).toBe("array");
    expect(kindOf(z.record(z.string(), z.number()))).toBe("record");
    expect(kindOf(blockSchema)).toBe("union");
    expect(kindOf(z.union([z.literal(""), z.string()]))).toBe("choice");
  });
});

describe("metadata", () => {
  it("reads titles or derives them from keys", () => {
    expect(titleOf(z.string().meta({ title: "Name" }), "x")).toBe("Name");
    expect(titleOf(z.string(), "logo_path")).toBe("Logo path");
    expect(titleOf(z.string(), "showInNav")).toBe("Show In Nav");
    expect(metaOf(z.string())).toEqual({});
  });
});

describe("emptyValue", () => {
  it.each(unionOptions(blockSchema).map((o) => [o.value, o.schema] as const))(
    "builds a %s block with every field present",
    (type, schema) => {
      const value = emptyValue(schema) as Record<string, unknown>;
      expect(value.type).toBe(type);
      expect(Object.keys(value).sort()).toEqual(
        Object.keys(schema.shape).sort(),
      );
    },
  );
  it("uses minimums and first options", () => {
    expect(emptyValue(z.number().min(3))).toBe(3);
    expect(emptyValue(z.enum(["b", "a"]))).toBe("b");
    expect(enumOptions(z.enum(["x", "y"]))).toEqual(["x", "y"]);
  });
});

describe("schemaAt", () => {
  it("follows objects, arrays and unions using the value", () => {
    const schema = schemaAt(
      portfolioSchema,
      ["pages", 0, "blocks", 0, "showResearchCards"],
      rawContent,
    );
    expect(schema && kindOf(schema)).toBe("boolean");
    const palette = schemaAt(
      portfolioSchema,
      ["theme", "palettes", "ink", "hue"],
      rawContent,
    );
    expect(palette && kindOf(palette)).toBe("number");
  });
  it("returns undefined for unknown paths", () => {
    expect(
      schemaAt(portfolioSchema, ["site", "nope", "deeper"], rawContent),
    ).toBeUndefined();
  });
});
