/**
 * File: jsonResume.ts
 * Purpose: Reads a JSON Resume file (https://jsonresume.org) and maps it onto the content: profile,
 *          social links (icons guessed from the network name), work as timeline entries, education as
 *          degrees and publications. The file is validated at the boundary; unknown fields are ignored.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import { z } from "zod";
import { isIconKey } from "../../icons/registry";
import { PRESENT, parseDate } from "../../lib/dates";

const text = z.string().max(5000).optional();
const date = z.string().max(20).optional();

const resumeSchema = z.object({
  basics: z
    .object({
      name: text,
      label: text,
      email: text,
      phone: text,
      url: text,
      summary: text,
      profiles: z
        .array(z.object({ network: text, url: text, username: text }))
        .optional(),
    })
    .optional(),
  work: z
    .array(
      z.object({
        name: text,
        position: text,
        url: text,
        location: text,
        startDate: date,
        endDate: date,
        summary: text,
        highlights: z.array(z.string()).optional(),
      }),
    )
    .optional(),
  education: z
    .array(
      z.object({
        institution: text,
        url: text,
        area: text,
        studyType: text,
        startDate: date,
        endDate: date,
        courses: z.array(z.string()).optional(),
      }),
    )
    .optional(),
  publications: z
    .array(
      z.object({
        name: text,
        publisher: text,
        releaseDate: date,
        url: text,
        summary: text,
      }),
    )
    .optional(),
});

export type Resume = z.infer<typeof resumeSchema>;

export type ResumeResult =
  | { readonly ok: true; readonly resume: Resume }
  | { readonly ok: false; readonly reason: string };

export function parseResume(json: string): ResumeResult {
  let value: unknown;
  try {
    value = JSON.parse(json);
  } catch {
    return { ok: false, reason: "The file is not valid JSON" };
  }
  const result = resumeSchema.safeParse(value);
  return result.success
    ? { ok: true, resume: result.data }
    : { ok: false, reason: "This does not look like a JSON Resume file" };
}

const SAFE_URL = /^https:\/\//;
const safeUrl = (url: string | undefined): string =>
  url && SAFE_URL.test(url) ? url : "";
/** JSON Resume dates are ISO (YYYY, YYYY-MM or YYYY-MM-DD); anything else is dropped. */
const isoDate = (value: string | undefined): string =>
  value && parseDate(value) ? value : "";

function range(
  start: string | undefined,
  end: string | undefined,
  isOngoing: boolean,
) {
  const from = isoDate(start);
  const to = isoDate(end) || (from && isOngoing ? PRESENT : "");
  return { label: "", start: from, end: to, isEndExpected: false };
}

const NETWORK_ICONS: Readonly<Record<string, string>> = {
  linkedin: "linkedin",
  github: "github",
  twitter: "x",
  x: "x",
  instagram: "instagram",
  orcid: "orcid",
  researchgate: "researchgate",
  googlescholar: "googlescholar",
  scholar: "googlescholar",
};

export function iconForNetwork(network: string | undefined): string {
  const key = (network ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
  const guess = NETWORK_ICONS[key] ?? key;
  return isIconKey(guess) ? guess : "web";
}

export const toSocialLinks = (resume: Resume) =>
  (resume.basics?.profiles ?? []).flatMap((p) =>
    safeUrl(p.url)
      ? [
          {
            name: p.network ?? "Profile",
            link: safeUrl(p.url),
            icon: iconForNetwork(p.network),
          },
        ]
      : [],
  );

export const toTimeline = (resume: Resume, logo: string) =>
  (resume.work ?? []).map((w) => ({
    title: w.position ?? "",
    company: w.name ?? "",
    company_url: safeUrl(w.url),
    logo_path: logo,
    dates: range(w.startDate, w.endDate, true),
    location: w.location ?? "",
    description: [w.summary, ...(w.highlights ?? [])]
      .filter(Boolean)
      .join("\n"),
  }));

export const toDegrees = (resume: Resume, logo: string, fallbackLink: string) =>
  (resume.education ?? []).map((e) => ({
    title: e.institution ?? "",
    subtitle: [e.studyType, e.area].filter(Boolean).join(", "),
    logo_path: logo,
    alt_name: e.institution ?? "",
    dates: range(e.startDate, e.endDate, false),
    descriptions: e.courses ?? [],
    website_link: safeUrl(e.url) || fallbackLink,
  }));

export const toPublications = (resume: Resume, logo: string) =>
  (resume.publications ?? []).map((p) => ({
    title: p.name ?? "",
    company: resume.basics?.name ?? "",
    company_url: safeUrl(p.url),
    logo_path: logo,
    dates: range(p.releaseDate, undefined, false),
    location: p.publisher ?? "",
    description: p.summary ?? "",
  }));
