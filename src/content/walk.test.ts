/**
 * File: walk.test.ts
 * Purpose: Tests for walking content with its schema: visiting order, trails, widget lookups,
 *          usage counts and replacing references.
 * Author: Akilesh
 * Date: 2026-10-22
 */
import { describe, expect, it } from "vitest";
import { z } from "zod";
import rawContent from "./portfolio.json";
import { portfolioSchema } from "./schema";
import {
  replaceWidgetValue,
  usageCounts,
  valuesWithWidget,
  walkContent,
} from "./walk";

const schema = z.object({
  title: z.string().meta({ title: "Title" }),
  items: z.array(
    z
      .object({ name: z.string(), pic: z.string().meta({ widget: "image" }) })
      .meta({ title: "Item", summaryKey: "name" }),
  ),
  map: z.record(z.string(), z.string().meta({ widget: "icon" })),
});
const value = {
  title: "T",
  items: [
    { name: "A", pic: "a.png" },
    { name: "B", pic: "a.png" },
  ],
  map: { x: "github" },
};

describe("walkContent", () => {
  it("visits parents before children with readable trails", () => {
    const seen: string[] = [];
    walkContent(schema, value, (node) => {
      seen.push(`${node.path.join(".")}=${node.trail.join(">")}`);
    });
    expect(seen).toContain("items.1.pic=items>B>pic");
    expect(seen.indexOf("items=items")).toBeLessThan(
      seen.indexOf("items.0=items>A"),
    );
  });
  it("skips children when the visitor returns false", () => {
    const seen: string[] = [];
    walkContent(
      schema,
      value,
      (node) => (seen.push(node.path.join(".")), node.path[0] !== "items"),
    );
    expect(seen.some((p) => p.startsWith("items."))).toBe(false);
  });
});

describe("widget helpers", () => {
  it("finds values, counts uses and replaces references immutably", () => {
    expect(valuesWithWidget(schema, value, "icon")).toEqual([
      { path: ["map", "x"], value: "github" },
    ]);
    expect(usageCounts(schema, value, "image").get("a.png")).toBe(2);
    const next = replaceWidgetValue(
      schema,
      value,
      "image",
      "a.png",
      "b.png",
    ) as typeof value;
    expect(next.items.map((i) => i.pic)).toEqual(["b.png", "b.png"]);
    expect(value.items[0]?.pic).toBe("a.png");
    expect(next.title).toBe("T");
  });
  it("counts every image and icon in the real content", () => {
    expect(
      usageCounts(portfolioSchema, rawContent, "image").size,
    ).toBeGreaterThan(5);
    expect(
      usageCounts(portfolioSchema, rawContent, "icon").get("github"),
    ).toBeGreaterThan(0);
  });
});
