/**
 * File: seoChecks.ts
 * Purpose: Checks of the SEO settings against common search and link-preview guidance (title and
 *          description lengths, address form, preview image and its description). Shared by the SEO
 *          panel and the health check. Pure.
 * Author: Akilesh
 * Date: 2026-10-21
 */
export interface SeoInput {
  readonly title: string;
  readonly description: string;
  readonly siteUrl: string;
  readonly language: string;
  readonly keywords: readonly string[];
  readonly social: {
    readonly title: string;
    readonly description: string;
    readonly image: string;
    readonly imageAlt: string;
    readonly twitterHandle: string;
  };
}

export interface SeoFinding {
  readonly field: string;
  readonly severity: "warning" | "error";
  readonly message: string;
}

export const TITLE_RANGE = { min: 30, max: 60 } as const;
export const DESCRIPTION_RANGE = { min: 70, max: 160 } as const;
const LANGUAGE = /^[a-z]{2,3}(-[A-Z]{2})?$/;

function lengthFinding(
  field: string,
  label: string,
  value: string,
  range: { min: number; max: number },
): SeoFinding | null {
  const n = value.trim().length;
  if (n === 0)
    return { field, severity: "error", message: `${label} is empty` };
  if (n < range.min)
    return {
      field,
      severity: "warning",
      message: `${label} is short (${n}; aim for ${range.min} to ${range.max} characters)`,
    };
  if (n > range.max)
    return {
      field,
      severity: "warning",
      message: `${label} may be cut off (${n}; aim for at most ${range.max} characters)`,
    };
  return null;
}

const warning = (field: string, message: string): SeoFinding => ({
  field,
  severity: "warning",
  message,
});

function textFindings(seo: SeoInput): (SeoFinding | null)[] {
  return [
    lengthFinding("title", "Site title", seo.title, TITLE_RANGE),
    lengthFinding(
      "description",
      "Description",
      seo.description,
      DESCRIPTION_RANGE,
    ),
  ];
}

function addressFindings(seo: SeoInput): (SeoFinding | null)[] {
  return [
    seo.siteUrl.startsWith("https://")
      ? null
      : warning("siteUrl", "Use an https:// address"),
    seo.siteUrl.endsWith("/")
      ? null
      : warning("siteUrl", "End the site address with /"),
    LANGUAGE.test(seo.language)
      ? null
      : warning("language", 'Use a language tag like "en" or "en-US"'),
    seo.keywords.length > 0 ? null : warning("keywords", "Add a few keywords"),
  ];
}

function socialFindings(seo: SeoInput): (SeoFinding | null)[] {
  return [
    seo.social.image
      ? null
      : warning("social.image", "Add a preview image for shared links"),
    seo.social.image && !seo.social.imageAlt.trim()
      ? warning("social.imageAlt", "Describe the preview image")
      : null,
    seo.social.twitterHandle.startsWith("@")
      ? {
          field: "social.twitterHandle",
          severity: "error",
          message: 'Leave out the "@" in the X/Twitter handle',
        }
      : null,
  ];
}

export function checkSeo(seo: SeoInput): SeoFinding[] {
  const findings: (SeoFinding | null)[] = [
    ...textFindings(seo),
    ...addressFindings(seo),
    ...socialFindings(seo),
  ];
  return findings.filter((f): f is SeoFinding => f !== null);
}

/** Text as a search result shows it: cut at `max` characters with an ellipsis. */
export const clipTo = (text: string, max: number): string =>
  text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;

/** Where a preview image is served from in the dev server: absolute URLs as they are, paths under public/. */
export const previewImageUrl = (image: string): string =>
  /^https?:\/\//.test(image)
    ? image
    : image
      ? `/${image.replace(/^\/+/, "")}`
      : "";

export const hostOf = (url: string): string => {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
};
