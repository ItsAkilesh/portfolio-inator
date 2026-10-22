/**
 * File: api.tools.test.ts
 * Purpose: Admin API over real HTTP for the tools backed by processes and the network: GitHub
 *          projects, build, git and the link checker, each with its process or DNS faked.
 * Author: Akilesh
 * Date: 2026-10-21
 */
// @vitest-environment node
import { writeFile } from "node:fs/promises";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { post, ran, startHarness, type Harness } from "./testHarness";

let h: Harness;
beforeAll(async () => {
  h = await startHarness();
});
afterAll(async () => h.close());

const REPO = {
  id: "1",
  name: "alpha",
  url: "https://github.com/x/alpha",
  createdAt: "2024-01-01",
  description: "",
  isFork: false,
  languages: [],
};

describe("projects", () => {
  it("runs the fetcher and lists what it wrote", async () => {
    h.fakes.fetchProjects = async () => {
      await writeFile(
        h.paths.projectsFile,
        JSON.stringify({
          data: [REPO, { ...REPO, id: "2", name: "beta", isPinned: false }],
        }),
      );
      return ran(0, ["Fetched"]);
    };
    const res = await h.json<{
      ok: boolean;
      projects: { name: string; isPinned: boolean }[];
    }>("/projects/fetch", post({}));
    expect(res.ok).toBe(true);
    expect(res.projects.map((p) => [p.name, p.isPinned])).toEqual([
      ["alpha", true],
      ["beta", false],
    ]);
  });
  it("reports a failed fetch with its output", async () => {
    h.fakes.fetchProjects = async () => ran(1, ["Missing GITHUB_TOKEN"]);
    const res = await h.call("/projects/fetch", post({}));
    expect(res.status).toBe(502);
    expect(((await res.json()) as { lines: string[] }).lines).toContain(
      "Missing GITHUB_TOKEN",
    );
  });
});

describe("build", () => {
  it("starts one build at a time and reports the result", async () => {
    let finish: () => void = () => undefined;
    h.fakes.build = (onLine) =>
      new Promise((resolve) => {
        onLine("vite building");
        finish = () => resolve(ran(0, ["vite building", "done"]));
      });
    expect((await h.json<{ state: string }>("/build", post({}))).state).toBe(
      "running",
    );
    const running = await h.json<{ state: string; lines: string[] }>("/build");
    expect(running.lines).toEqual(["vite building"]);
    expect((await h.json<{ state: string }>("/build", post({}))).state).toBe(
      "running",
    );
    finish();
    await vi.waitFor(async () =>
      expect((await h.json<{ state: string }>("/build")).state).toBe("passed"),
    );
  });
});

describe("git", () => {
  it("shows content changes only, with ahead/behind and the repository URL", async () => {
    h.fakes.git = async (args) =>
      args[0] === "status"
        ? ran(0, [
            "## main...origin/main [ahead 2]",
            " M src/content/portfolio.json",
            "?? public/images/new.webp",
            " M src/App.tsx",
          ])
        : ran(0, ["git@github.com:me/site.git"]);
    const status = await h.json<{
      ahead: number;
      files: unknown[];
      otherChanges: number;
      repoUrl: string;
    }>("/git");
    expect(status.ahead).toBe(2);
    expect(status.files).toHaveLength(2);
    expect(status.otherChanges).toBe(1);
    expect(status.repoUrl).toBe("https://github.com/me/site");
  });
  it("commits only content paths with a conventional message", async () => {
    const calls: (readonly string[])[] = [];
    h.fakes.git = async (args) => (calls.push(args), ran(0));
    expect(
      (await h.call("/git/commit", post({ message: "update stuff" }))).status,
    ).toBe(422);
    expect(calls).toHaveLength(0);
    expect(
      (
        await h.call(
          "/git/commit",
          post({ message: "docs(content): update experience" }),
        )
      ).status,
    ).toBe(200);
    expect(calls[1]?.slice(0, 3)).toEqual([
      "commit",
      "-m",
      "docs(content): update experience",
    ]);
    expect(calls[1]).toContain("src/content/portfolio.json");
    expect(calls[1]).not.toContain("src/App.tsx");
  });
  it("reports push failures", async () => {
    h.fakes.git = async () => ran(128, ["fatal: could not read Username"]);
    expect((await h.call("/git/push", post({}))).status).toBe(502);
  });
});

describe("health links", () => {
  it("refuses unsafe URLs before any request and private hosts after resolving", async () => {
    h.fakes.isAllowedAddress = (address) => address !== "10.0.0.5";
    h.fakes.resolveHost = async () => [{ address: "10.0.0.5", family: 4 }];
    const { results } = await h.json<{
      results: { url: string; ok: boolean; reason?: string }[];
    }>(
      "/health/links",
      post({
        urls: [
          "ftp://x.example/",
          "https://user:pw@x.example/",
          "https://x.example:8443/",
          "https://internal.example/",
        ],
      }),
    );
    expect(results.every((r) => !r.ok)).toBe(true);
    expect(
      results.find((r) => r.url === "https://internal.example/")?.reason,
    ).toBe("Host is not on the public internet");
  });
  it("limits the number of links", async () => {
    const urls = Array.from(
      { length: 101 },
      (_, i) => `https://x${i}.example/`,
    );
    expect((await h.call("/health/links", post({ urls }))).status).toBe(400);
  });
});
