/**
 * File: headTags.test.ts
 * Purpose: Tests for build-time SEO head tag generation.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import { describe, expect, it } from "vitest";
import type { Seo } from "../types/portfolio";
import {
  absoluteUrl,
  escapeHtml,
  personJsonLd,
  renderHeadTags,
} from "./headTags";

const SEO: Seo = {
  title: "Jane Doe",
  description: 'Builds "fast" things & <tools>',
  author: "Jane Doe",
  keywords: ["ai", "xr"],
  siteUrl: "https://jane.example/",
  language: "en-US",
  favicon: "icons/me.png",
  themeColor: "#112233",
  social: {
    image: "icons/me.png",
    imageAlt: "Jane",
    twitterCard: "summary",
    twitterHandle: "",
  },
  verification: { google: "abc123", bing: "" },
  structuredData: { isEnabled: true, jobTitle: "Engineer", worksFor: "Acme" },
};

describe("escapeHtml", () => {
  it("escapes markup and quotes", () => {
    expect(escapeHtml(`<a href="x">'&'</a>`)).toBe(
      "&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;",
    );
  });
});

describe("absoluteUrl", () => {
  it("resolves public paths against the site", () => {
    expect(absoluteUrl("icons/me.png", SEO.siteUrl)).toBe(
      "https://jane.example/icons/me.png",
    );
  });
  it("rejects non-https and malformed addresses", () => {
    expect(absoluteUrl("http://evil.example/x.png", SEO.siteUrl)).toBeNull();
    expect(absoluteUrl("javascript:alert(1)", SEO.siteUrl)).toBeNull();
    expect(absoluteUrl("x", "not a url")).toBeNull();
  });
});

describe("renderHeadTags", () => {
  const html = renderHeadTags(SEO, ["https://github.com/jane"], "/");
  it("writes title, description, canonical and social tags", () => {
    expect(html).toContain("<title>Jane Doe</title>");
    expect(html).toContain(
      'content="Builds &quot;fast&quot; things &amp; &lt;tools&gt;"',
    );
    expect(html).toContain(
      '<link rel="canonical" href="https://jane.example/" />',
    );
    expect(html).toContain(
      'property="og:image" content="https://jane.example/icons/me.png"',
    );
    expect(html).toContain('property="og:locale" content="en_US"');
  });
  it("falls back to the main title and description for previews", () => {
    expect(html).toContain('property="og:title" content="Jane Doe"');
  });
  it("omits empty optional tags", () => {
    expect(html).toContain('name="google-site-verification" content="abc123"');
    expect(html).not.toContain("msvalidate.01");
    expect(html).not.toContain("twitter:site");
  });
  it("respects the deploy base for the favicon", () => {
    expect(renderHeadTags(SEO, [], "/portfolio/")).toContain(
      'href="/portfolio/icons/me.png"',
    );
  });
});

describe("personJsonLd", () => {
  it("includes the person and only https profile links", () => {
    const tag = personJsonLd(SEO, [
      "https://github.com/jane",
      "mailto:jane@example.com",
      "https://wa.me/+15550000000",
    ]);
    expect(tag).toContain('"@type":"Person"');
    expect(tag).toContain('"sameAs":["https://github.com/jane"]');
    expect(tag).toContain('"worksFor":{"@type":"Organization","name":"Acme"}');
  });
  it("cannot break out of the script tag", () => {
    const tag = personJsonLd({ ...SEO, author: "</script><b>" }, []);
    expect(tag.match(/<\/script>/g)).toHaveLength(1);
  });
  it("is empty when disabled", () => {
    expect(
      personJsonLd(
        { ...SEO, structuredData: { isEnabled: false, jobTitle: "" } },
        [],
      ),
    ).toBe("");
  });
});
