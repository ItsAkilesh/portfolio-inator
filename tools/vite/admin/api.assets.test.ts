/**
 * File: api.assets.test.ts
 * Purpose: Admin API over real HTTP for images (details, upload, rename with reference updates,
 *          safe removal) and the icon library (search, add, SVG import, removal).
 * Author: Akilesh
 * Date: 2026-10-21
 */
// @vitest-environment node
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { post, startHarness, type Harness } from "./testHarness";

let h: Harness;
beforeAll(async () => {
  h = await startHarness();
});
afterAll(async () => h.close());

const PNG_1X1 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
const SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><script>alert(1)</script><rect width="10" height="10"/></svg>';

interface Details {
  images: { name: string; bytes: number; width?: number; uses: number }[];
}
const version = async () =>
  (await h.json<{ version: string }>("/content")).version;

describe("images", () => {
  it("lists images with sizes, dimensions and usage", async () => {
    const { images } = await h.json<Details>("/images/details");
    const used = images.find((i) => i.name === "cmu.webp");
    expect(used?.uses).toBeGreaterThan(0);
    expect(used?.width).toBeGreaterThan(0);
    expect(images.every((i) => i.bytes > 0)).toBe(true);
  });

  it("uploads, then refuses to remove a used image and removes an unused one to the trash", async () => {
    const res = await h.call(
      "/images",
      post({ fileName: "Dot Test.png", dataBase64: PNG_1X1 }),
    );
    expect(res.status).toBe(201);
    expect(((await res.json()) as { fileName: string }).fileName).toBe(
      "dot-test.png",
    );
    expect(
      (await h.call("/images/remove", post({ name: "cmu.webp" }))).status,
    ).toBe(409);
    expect(
      (await h.call("/images/remove", post({ name: "dot-test.png" }))).status,
    ).toBe(200);
    expect(await readdir(h.paths.imagesDir)).not.toContain("dot-test.png");
    expect(
      (await readdir(join(h.paths.historyDir, "trash"))).some((n) =>
        n.endsWith("dot-test.png"),
      ),
    ).toBe(true);
  });

  it("renames an image and every reference to it", async () => {
    const res = await h.call(
      "/images/rename",
      post({
        from: "cmu.webp",
        to: "Carnegie Mellon",
        baseVersion: await version(),
      }),
    );
    expect(res.status).toBe(422);
    const ok = await h.call(
      "/images/rename",
      post({
        from: "cmu.webp",
        to: "carnegie-mellon.webp",
        baseVersion: await version(),
      }),
    );
    expect(ok.status).toBe(200);
    const text = await readFile(h.paths.contentFile, "utf8");
    expect(text).not.toContain('"cmu.webp"');
    expect(text).toContain('"carnegie-mellon.webp"');
    expect(await readdir(h.paths.imagesDir)).toContain("carnegie-mellon.webp");
  });

  it("refuses a rename based on a stale version and leaves the file alone", async () => {
    const res = await h.call(
      "/images/rename",
      post({
        from: "ieee.webp",
        to: "x.webp",
        baseVersion: "0000000000000000",
      }),
    );
    expect(res.status).toBe(409);
    expect(await readdir(h.paths.imagesDir)).toContain("ieee.webp");
  });
});

describe("icons", () => {
  it("searches all of simple-icons and marks icons already in the library", async () => {
    const { results } = await h.json<{
      results: { slug: string; key: string | null }[];
    }>("/icons/search?q=git&limit=50");
    expect(results.find((r) => r.slug === "github")?.key).toBe("github");
    expect(results.find((r) => r.slug === "gitlab")?.key).toBeNull();
    expect(
      (await h.json<{ results: unknown[] }>("/icons/search?q=")).results,
    ).toEqual([]);
  });

  it("adds a simple icon and regenerates the module", async () => {
    const res = await h.call("/icons/add", post({ slug: "gitlab" }));
    expect(await res.json()).toEqual({ key: "gitlab" });
    expect(await readFile(h.paths.iconModuleFile, "utf8")).toContain(
      "gitlab: siGitlab,",
    );
    expect(
      JSON.parse(await readFile(h.paths.iconLibraryFile, "utf8")).simpleIcons
        .gitlab,
    ).toBe("gitlab");
    expect(
      (await h.call("/icons/add", post({ slug: "not-an-icon-at-all" }))).status,
    ).toBe(422);
  });

  it("imports an SVG keeping only its geometry", async () => {
    const res = await h.call(
      "/icons/import",
      post({ key: "mybadge", title: "My badge", hex: "#123abc", svg: SVG }),
    );
    expect(res.status).toBe(200);
    const custom = JSON.parse(await readFile(h.paths.iconLibraryFile, "utf8"))
      .custom.mybadge;
    expect(custom).toEqual({
      title: "My badge",
      hex: "#123ABC",
      path: "M0 0h10v10h-10Z",
      viewBox: "0 0 10 10",
    });
    const again = await h.call(
      "/icons/import",
      post({ key: "mybadge", title: "x", hex: "#000000", svg: SVG }),
    );
    expect(again.status).toBe(422);
  });

  it("reports usage and removes only unused, non-site icons", async () => {
    const usage = await h.json<{ usage: Record<string, number> }>(
      "/icons/usage",
    );
    expect(usage.usage.github).toBeGreaterThan(0);
    expect(
      (await h.call("/icons/remove", post({ key: "github" }))).status,
    ).toBe(409);
    expect((await h.call("/icons/remove", post({ key: "code" }))).status).toBe(
      422,
    );
    expect(
      (await h.call("/icons/remove", post({ key: "gitlab" }))).status,
    ).toBe(200);
    expect(await readFile(h.paths.iconModuleFile, "utf8")).not.toContain(
      "siGitlab",
    );
  });
});
