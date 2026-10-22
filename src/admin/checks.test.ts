/**
 * File: checks.test.ts
 * Purpose: Tests for health checks, palettes, setup helpers and page templates.
 * Author: Akilesh
 * Date: 2026-10-22
 */
import { describe, expect, it } from "vitest";
import rawContent from "../content/portfolio.json";
import { portfolioSchema } from "../content/schema";
import { PAGE_TEMPLATES, pageFromTemplate } from "./form/pageTemplates";
import {
  contentFindings,
  externalLinks,
  imageFindings,
  runChecks,
  seoFindings,
  themeFindings,
} from "./health/checks";
import { setIn } from "./paths";
import {
  QUICK_PALETTES,
  applyQuickPalette,
  clearSample,
  looksLikeFreshFork,
} from "./setup/sample";
import { checkContrast, resolveSource } from "./theme/palettes";

type Content = typeof rawContent;
const content: Content = rawContent;
const valid = (value: unknown) => portfolioSchema.safeParse(value).success;

describe("health checks", () => {
  it("flags missing and large images", () => {
    const findings = imageFindings(portfolioSchema, content, [
      { name: "cmu.webp", isLarge: true },
    ]);
    expect(
      findings.some((f) => f.message.includes('"cmu.webp" is large')),
    ).toBe(true);
    expect(
      findings.some(
        (f) =>
          f.severity === "error" &&
          f.message.includes("is not in public/images"),
      ),
    ).toBe(true);
  });
  it("flags empty blocks and images without a description", () => {
    const page = {
      id: "x",
      path: "/x",
      label: "X",
      showInNav: false,
      blocks: [
        { type: "image", src: "a.png", alt: "", caption: "" },
        { type: "timeline", groups: [{ title: "G", entries: [] }] },
        { type: "degrees", items: [] },
        { type: "text", heading: "", body: " " },
      ],
    };
    const messages = contentFindings({ pages: [page] }).map((f) => f.message);
    expect(messages).toHaveLength(4);
  });
  it("checks the active palette's contrast and the SEO settings", () => {
    expect(themeFindings(content)).toEqual([]);
    const bad = setIn(
      content,
      ["theme", "palettes", content.theme.activePalette],
      {
        kind: "custom",
        light: { ...makeTokens("#777"), bg: "#888" },
        dark: makeTokens("#fff"),
      },
    );
    expect(themeFindings(bad).length).toBeGreaterThan(0);
    expect(
      seoFindings(setIn(content, ["site", "seo", "title"], "")).some(
        (f) => f.path.join(".") === "site.seo.title",
      ),
    ).toBe(true);
  });
  it("collects each external link once with where it is used", () => {
    const links = externalLinks(portfolioSchema, content);
    expect([...links.keys()].every((url) => /^https?:\/\//.test(url))).toBe(
      true,
    );
    expect(links.size).toBeGreaterThan(5);
    expect(runChecks(portfolioSchema, content, [])).toBeInstanceOf(Array);
  });
});

function makeTokens(color: string) {
  const keys = [
    "bg",
    "surface",
    "ink",
    "inkMuted",
    "line",
    "accent",
    "onAccent",
    "onAccentMuted",
    "onAccentLine",
    "link",
    "tint",
  ] as const;
  return Object.fromEntries(keys.map((k) => [k, color])) as Record<
    (typeof keys)[number],
    string
  >;
}

describe("palettes", () => {
  it("resolves generated and custom palettes and rejects malformed ones", () => {
    expect(
      resolveSource({
        kind: "generated",
        hue: 220,
        chroma: 0.16,
        lightness: 0.4,
      })?.light.bg,
    ).toBeTruthy();
    expect(
      resolveSource({
        kind: "custom",
        light: makeTokens("#000"),
        dark: makeTokens("#fff"),
      })?.dark.ink,
    ).toBe("#fff");
    expect(resolveSource({ kind: "generated" })).toBeNull();
    expect(resolveSource(null)).toBeNull();
  });
  it("passes generated palettes and fails unreadable pairs", () => {
    const palette = resolveSource({
      kind: "generated",
      hue: 220,
      chroma: 0.16,
      lightness: 0.4,
    });
    if (!palette) throw new Error("no palette");
    expect(checkContrast(palette).filter((r) => !r.isPassing)).toEqual([]);
    expect(
      checkContrast({
        light: makeTokens("#777"),
        dark: makeTokens("#777"),
      }).every((r) => !r.isPassing),
    ).toBe(true);
  });
});

describe("setup helpers", () => {
  it("clears chosen sample content and keeps the content valid", () => {
    const cleared = clearSample(
      content,
      new Set(["experience", "education", "research", "skills", "socials"]),
    ) as Content;
    expect(cleared.skills).toEqual([]);
    expect(cleared.site.socialLinks).toEqual([]);
    expect(JSON.stringify(cleared.pages)).not.toContain("Carnegie Mellon");
    expect(cleared.pages.length).toBe(content.pages.length);
    expect(valid(cleared)).toBe(true);
    expect(clearSample(content, new Set())).toBe(content);
  });
  it("adds a quick palette and makes it active", () => {
    const next = applyQuickPalette(content, QUICK_PALETTES[0]) as Content;
    expect(next.theme.activePalette).toBe(QUICK_PALETTES[0].name);
    expect(valid(next)).toBe(true);
  });
  it("spots a fresh fork from the git remote", () => {
    expect(
      looksLikeFreshFork(
        "https://github.com/someone/master-portfolio",
        "https://github.com/itsakilesh",
      ),
    ).toBe(true);
    expect(
      looksLikeFreshFork(
        "https://github.com/ItsAkilesh/master-portfolio",
        "https://github.com/itsakilesh",
      ),
    ).toBe(false);
    expect(looksLikeFreshFork(null, "https://github.com/x")).toBe(false);
  });
});

describe("page templates", () => {
  it.each(PAGE_TEMPLATES.map((t) => [t.id, t] as const))(
    "%s gives a valid page with a free id and path",
    (_id, template) => {
      const page = pageFromTemplate(
        template,
        content.pages,
        content.site.portrait,
      );
      const next = { ...content, pages: [...content.pages, page] };
      expect(valid(next)).toBe(true);
      const again = pageFromTemplate(
        template,
        next.pages,
        content.site.portrait,
      ) as { id: string };
      expect(again.id).not.toBe((page as { id: string }).id);
    },
  );
});
