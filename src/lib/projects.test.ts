/**
 * File: projects.test.ts
 * Purpose: Tests for validation of fetched GitHub project data and choosing which to show.
 * Author: Akilesh
 * Date: 2026-10-20 (updated 2026-10-22)
 */
import { describe, expect, it } from "vitest";
import { parseProjects, selectProjects } from "./projects";

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
      { ...valid, stars: 0, isPinned: true, languages: [{ name: "Rust" }] },
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
      stars: 0,
      isPinned: true,
      languages: [],
    });
  });

  it("reads stars and the pinned flag, rejecting bad values", () => {
    const [a, b] = parseProjects({
      data: [
        { ...valid, id: "a", stars: 12, isPinned: false },
        { ...valid, id: "b", createdAt: "2020", stars: -4, isPinned: "yes" },
      ],
    });
    expect([a?.stars, a?.isPinned, b?.stars, b?.isPinned]).toEqual([
      12,
      false,
      0,
      true,
    ]);
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

describe("selectProjects", () => {
  const all = parseProjects({
    data: [
      { ...valid, id: "1", name: "one" },
      { ...valid, id: "2", name: "two", isPinned: false },
      { ...valid, id: "3", name: "three", isPinned: false },
    ],
  });
  it("shows the pinned repositories when none are chosen", () => {
    expect(selectProjects(all, []).map((p) => p.name)).toEqual(["one"]);
  });
  it("shows the chosen ones in the chosen order and skips unknown names", () => {
    expect(
      selectProjects(all, ["three", "gone", "one"]).map((p) => p.name),
    ).toEqual(["three", "one"]);
  });
});
