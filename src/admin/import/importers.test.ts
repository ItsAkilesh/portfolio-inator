/**
 * File: importers.test.ts
 * Purpose: Tests for the BibTeX and JSON Resume importers and the import targets, including that
 *          their output is valid content.
 * Author: Akilesh
 * Date: 2026-10-22
 */
import { describe, expect, it } from "vitest";
import rawContent from "../../content/portfolio.json";
import { portfolioSchema } from "../../content/schema";
import { appendTo, blockTargets } from "./targets";
import {
  bibDate,
  cleanTex,
  formatAuthors,
  linkOf,
  parseBibtex,
  toPublication,
  venueOf,
} from "./bibtex";
import {
  iconForNetwork,
  parseResume,
  toDegrees,
  toPublications,
  toSocialLinks,
  toTimeline,
} from "./jsonResume";

const BIB = `@comment{ignored}
@string{x = "y"}
@article{doe2024,
  title = {A {Study} of {\\"O}ther Things \\& More},
  author = {Doe, Jane and John Smith},
  journal = "Journal of {Tests}",
  year = 2024, month = mar,
  doi = {https://doi.org/10.1000/XYZ}
}
@inproceedings{k2,
  title={Second},
  booktitle={Proc. Conf.},
  year={2023},
  url={https://example.com/p}
}`;

describe("BibTeX", () => {
  const entries = parseBibtex(BIB);
  it("reads entries and skips comments and strings", () => {
    expect(entries.map((e) => [e.type, e.key])).toEqual([
      ["article", "doe2024"],
      ["inproceedings", "k2"],
    ]);
    expect(entries[0]?.fields.year).toBe("2024");
  });
  it("cleans LaTeX, names, dates, venues and links", () => {
    expect(cleanTex(entries[0]?.fields.title ?? "")).toBe(
      "A Study of Öther Things & More",
    );
    expect(formatAuthors("Doe, Jane and John Smith")).toBe(
      "Jane Doe, John Smith",
    );
    expect([
      bibDate("2024", "mar"),
      bibDate("2024", "11"),
      bibDate("2024", "Smarch"),
      bibDate("n.d.", ""),
    ]).toEqual(["2024-03", "2024-11", "2024", ""]);
    expect(venueOf(entries[1]?.fields ?? {})).toBe("Proc. Conf.");
    expect(linkOf(entries[0]?.fields ?? {})).toBe(
      "https://doi.org/10.1000/XYZ",
    );
    expect(linkOf({ url: "javascript:x" })).toBe("");
  });
  it("produces valid publication entries", () => {
    const pub = toPublication(
      entries[0] as (typeof entries)[number],
      "ieee.webp",
    );
    const target = blockTargets(rawContent, "publications")[0];
    expect(target).toBeTruthy();
    const next = appendTo(rawContent, target?.listPath ?? [], [pub]);
    expect(portfolioSchema.safeParse(next).success).toBe(true);
  });
});

describe("JSON Resume", () => {
  const json = JSON.stringify({
    basics: {
      name: "Ada",
      summary: "Hi",
      profiles: [
        { network: "LinkedIn", url: "https://linkedin.com/in/ada" },
        { network: "Myspace", url: "https://myspace.com/ada" },
        { network: "X", url: "http://insecure" },
      ],
    },
    work: [
      {
        name: "Co",
        position: "Eng",
        startDate: "2020-01",
        endDate: "",
        highlights: ["Did a thing"],
      },
    ],
    education: [
      {
        institution: "Uni",
        area: "CS",
        studyType: "BSc",
        startDate: "2016",
        endDate: "2020",
      },
    ],
    publications: [
      {
        name: "Paper",
        publisher: "Pub",
        releaseDate: "2021-05-02",
        url: "https://p.dev",
      },
    ],
  });
  const result = parseResume(json);
  it("validates the file", () => {
    expect(result.ok).toBe(true);
    expect(parseResume("{").ok).toBe(false);
    expect(parseResume('{"work": "nope"}').ok).toBe(false);
  });
  it("maps every section to valid content", () => {
    if (!result.ok) throw new Error("not parsed");
    const r = result.resume;
    expect(toSocialLinks(r)).toEqual([
      {
        name: "LinkedIn",
        link: "https://linkedin.com/in/ada",
        icon: "linkedin",
      },
      { name: "Myspace", link: "https://myspace.com/ada", icon: "web" },
    ]);
    expect(toTimeline(r, "aa.webp")[0]?.dates).toEqual({
      label: "",
      start: "2020-01",
      end: "present",
      isEndExpected: false,
    });
    expect(toDegrees(r, "aa.webp", "https://x.dev/")[0]).toMatchObject({
      subtitle: "BSc, CS",
      website_link: "https://x.dev/",
    });
    let next: unknown = rawContent;
    next = appendTo(next, ["site", "socialLinks"], toSocialLinks(r));
    next = appendTo(
      next,
      blockTargets(next, "timeline")[0]?.listPath ?? [],
      toTimeline(r, "aa.webp"),
    );
    next = appendTo(
      next,
      blockTargets(next, "degrees")[0]?.listPath ?? [],
      toDegrees(r, "aa.webp", "https://x.dev/"),
    );
    next = appendTo(
      next,
      blockTargets(next, "publications")[0]?.listPath ?? [],
      toPublications(r, "aa.webp"),
    );
    expect(portfolioSchema.safeParse(next).success).toBe(true);
  });
  it("guesses icons from network names", () => {
    expect([
      iconForNetwork("GitHub"),
      iconForNetwork("Google Scholar"),
      iconForNetwork(undefined),
    ]).toEqual(["github", "googlescholar", "web"]);
  });
});

describe("blockTargets", () => {
  it("offers every timeline group and every degrees and publications block", () => {
    const timeline = blockTargets(rawContent, "timeline");
    expect(timeline.length).toBeGreaterThan(1);
    expect(timeline[0]?.listPath.at(-1)).toBe("entries");
    expect(blockTargets(rawContent, "degrees")[0]?.listPath.at(-1)).toBe(
      "items",
    );
    expect(blockTargets({}, "timeline")).toEqual([]);
  });
});
