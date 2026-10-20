/**
 * File: projects.test.ts
 * Purpose: Tests for validation of fetched GitHub project data.
 * Author: Akilesh
 * Date: 2026-10-20
 */
import { describe, expect, it } from "vitest";
import { parseProjects } from "./projects";

const valid = {
  id: "1",
  name: "flashtex",
  createdAt: "2026-09-13T18:13:35Z",
  url: "https://github.com/ItsAkilesh/flashtex",
  description: "Fast LaTeX",
  isFork: true,
  languages: [{ name: "Rust", iconifyClass: "logos-rust" }],
};

describe("parseProjects", () => {
  it("keeps well-formed projects and drops unknown fields", () => {
    expect(parseProjects({ data: [valid] })).toEqual([
      { ...valid, languages: [{ name: "Rust" }] },
    ]);
  });

  it("sorts newest first", () => {
    const older = { ...valid, id: "2", createdAt: "2022-01-01T00:00:00Z" };
    expect(parseProjects({ data: [older, valid] }).map((p) => p.id)).toEqual([
      "1",
      "2",
    ]);
  });

  it("fills defaults for optional fields", () => {
    const [project] = parseProjects({
      data: [{ id: "3", name: "x", url: "https://x.dev" }],
    });
    expect(project).toEqual({
      id: "3",
      name: "x",
      url: "https://x.dev",
      createdAt: "",
      description: "",
      isFork: false,
      languages: [],
    });
  });

  it("drops entries with missing ids or unsafe URLs", () => {
    const bad = [
      { ...valid, id: 5 },
      { ...valid, url: "javascript:alert(1)" },
      { ...valid, url: "http://plain.dev" },
      null,
      "x",
    ];
    expect(parseProjects({ data: bad })).toEqual([]);
  });

  it("returns an empty list for malformed input", () => {
    expect(parseProjects(null)).toEqual([]);
    expect(parseProjects({ data: "nope" })).toEqual([]);
    expect(parseProjects([valid])).toEqual([]);
  });
});
