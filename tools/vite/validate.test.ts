/**
 * File: validate.test.ts
 * Purpose: Tests for content validation, serialisation and the committed JSON Schema.
 * Author: Akilesh
 * Date: 2026-10-21 (updated 2026-10-22)
 */
// @vitest-environment node
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import rawContent from "../../src/content/portfolio.json";
import { portfolioSchema } from "../../src/content/schema";
import {
  contentJsonSchema,
  serializeContent,
  validateContent as validateWith,
} from "./validate";

const validateContent = (value: unknown) =>
  validateWith(portfolioSchema, value);

const SCHEMA_FILE = resolve(
  __dirname,
  "../../src/content/portfolio.schema.json",
);
const CONTENT_FILE = resolve(__dirname, "../../src/content/portfolio.json");

describe("validateContent", () => {
  it("accepts the committed content", () => {
    expect(validateContent(rawContent).ok).toBe(true);
  });
  it("lists problems with their paths", () => {
    const result = validateContent({
      ...rawContent,
      theme: { ...rawContent.theme, defaultMode: "blue" },
    });
    expect(result.ok).toBe(false);
    if (!result.ok)
      expect(
        result.issues.some((issue) => issue.startsWith("theme.defaultMode:")),
      ).toBe(true);
  });
});

describe("serializeContent", () => {
  it("round-trips the committed file byte for byte", () => {
    const result = validateContent(rawContent);
    if (!result.ok) throw new Error(result.issues.join("\n"));
    expect(serializeContent(result.content)).toBe(
      readFileSync(CONTENT_FILE, "utf8"),
    );
  });
});

describe("portfolio.schema.json", () => {
  it("is up to date (pnpm dev regenerates it)", () => {
    expect(readFileSync(SCHEMA_FILE, "utf8")).toBe(
      contentJsonSchema(portfolioSchema),
    );
  });
});
