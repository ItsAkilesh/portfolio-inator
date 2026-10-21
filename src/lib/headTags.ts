/**
 * File: headTags.ts
 * Purpose: Builds the <head> tags (title, meta, canonical, Open Graph, Twitter, verification,
 *          schema.org Person) from the SEO config. Pure and dependency-free so vite.config.ts can
 *          write them into index.html at build time, where crawlers and link previews read them.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import type { Seo } from "../types/portfolio";

const HTML_ESCAPES: Readonly<Record<string, string>> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

/** Escapes text for use inside an HTML attribute or element. */
export const escapeHtml = (text: string): string =>
  text.replace(/[&<>"']/g, (char) => HTML_ESCAPES[char] ?? char);

/** Absolute https URL for a public/ path or URL; null when it is not a safe https address. */
export function absoluteUrl(pathOrUrl: string, siteUrl: string): string | null {
  try {
    const url = new URL(pathOrUrl, siteUrl);
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

/** Contact links (chat, phone) are not public profiles and stay out of schema.org sameAs. */
const NON_PROFILE_HOSTS: readonly string[] = ["wa.me", "api.whatsapp.com"];

const isProfileLink = (link: string, siteUrl: string): boolean => {
  const url = absoluteUrl(link, siteUrl);
  return url === link && !NON_PROFILE_HOSTS.includes(new URL(link).hostname);
};

const meta = (
  key: "name" | "property",
  id: string,
  content: string | undefined,
): string =>
  content ? `<meta ${key}="${id}" content="${escapeHtml(content)}" />` : "";

/** Root-relative path for a public/ asset, respecting the deploy base. */
const publicPath = (path: string, base: string): string =>
  /^https?:\/\//.test(path) ? path : `${base}${path.replace(/^\//, "")}`;

function basicTags(seo: Seo, base: string): string[] {
  const canonical = absoluteUrl(seo.siteUrl, seo.siteUrl);
  return [
    `<title>${escapeHtml(seo.title)}</title>`,
    meta("name", "description", seo.description),
    meta("name", "author", seo.author),
    meta("name", "keywords", seo.keywords.join(", ")),
    meta("name", "theme-color", seo.themeColor),
    `<link rel="icon" href="${escapeHtml(publicPath(seo.favicon, base))}" />`,
    `<link rel="apple-touch-icon" href="${escapeHtml(publicPath(seo.favicon, base))}" />`,
    canonical ? `<link rel="canonical" href="${escapeHtml(canonical)}" />` : "",
    meta("name", "google-site-verification", seo.verification.google),
    meta("name", "msvalidate.01", seo.verification.bing),
  ];
}

function socialTags(seo: Seo): string[] {
  const { social } = seo;
  const title = social.title || seo.title;
  const description = social.description || seo.description;
  const image = absoluteUrl(social.image, seo.siteUrl) ?? undefined;
  const handle = social.twitterHandle ? `@${social.twitterHandle}` : undefined;
  return [
    meta("property", "og:type", "website"),
    meta("property", "og:site_name", seo.title),
    meta("property", "og:title", title),
    meta("property", "og:description", description),
    meta(
      "property",
      "og:url",
      absoluteUrl(seo.siteUrl, seo.siteUrl) ?? undefined,
    ),
    meta("property", "og:locale", seo.language.replace("-", "_")),
    meta("property", "og:image", image),
    meta("property", "og:image:alt", social.imageAlt),
    meta("name", "twitter:card", social.twitterCard),
    meta("name", "twitter:title", title),
    meta("name", "twitter:description", description),
    meta("name", "twitter:image", image),
    meta("name", "twitter:site", handle),
  ];
}

/** schema.org Person as JSON-LD; "<" is escaped so the data can never close the script tag. */
export function personJsonLd(seo: Seo, sameAs: readonly string[]): string {
  if (!seo.structuredData.isEnabled) return "";
  const data = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: seo.author,
    url: absoluteUrl(seo.siteUrl, seo.siteUrl),
    image: absoluteUrl(seo.social.image, seo.siteUrl),
    jobTitle: seo.structuredData.jobTitle,
    ...(seo.structuredData.worksFor
      ? {
          worksFor: {
            "@type": "Organization",
            name: seo.structuredData.worksFor,
          },
        }
      : {}),
    sameAs: sameAs.filter((link) => isProfileLink(link, seo.siteUrl)),
  };
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return `<script type="application/ld+json">${json}</script>`;
}

/** Every SEO tag for the page head, one per line. */
export function renderHeadTags(
  seo: Seo,
  sameAs: readonly string[],
  base = "/",
): string {
  return [
    ...basicTags(seo, base),
    ...socialTags(seo),
    personJsonLd(seo, sameAs),
  ]
    .filter(Boolean)
    .join("\n    ");
}
