/**
 * File: SeoPanel.tsx
 * Purpose: SEO section panel: how the site appears in a search result and as a shared link (Open
 *          Graph / X card), with character counts and warnings, all from the draft.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import { useMemo } from "react";
import { useAdmin } from "../AdminContext";
import { getIn } from "../paths";
import {
  DESCRIPTION_RANGE,
  TITLE_RANGE,
  checkSeo,
  clipTo,
  hostOf,
  previewImageUrl,
  type SeoInput,
} from "../seo/seoChecks";
import ui from "../ui.module.css";
import tool from "../tools/tools.module.css";

function Counter({
  label,
  value,
  range,
}: {
  readonly label: string;
  readonly value: string;
  readonly range: { min: number; max: number };
}) {
  const n = value.trim().length;
  const isOk = n >= range.min && n <= range.max;
  return (
    <span className={tool.counter} data-ok={isOk || undefined}>
      {label}: {n}/{range.max}
    </span>
  );
}

function SearchResult({ seo }: { readonly seo: SeoInput }) {
  return (
    <figure className={tool.serp} aria-label="Search result preview">
      <span className={tool.serpUrl}>
        {seo.siteUrl.replace(/^https?:\/\//, "").replace(/\/$/, "")}
      </span>
      <span className={tool.serpTitle}>
        {clipTo(seo.title, TITLE_RANGE.max)}
      </span>
      <span className={tool.serpText}>
        {clipTo(seo.description, DESCRIPTION_RANGE.max)}
      </span>
    </figure>
  );
}

function ShareCard({
  seo,
  isLarge,
}: {
  readonly seo: SeoInput;
  readonly isLarge: boolean;
}) {
  const image = previewImageUrl(seo.social.image);
  return (
    <figure
      className={tool.shareCard}
      data-large={isLarge || undefined}
      aria-label="Shared link preview"
    >
      {image ? (
        <img src={image} alt={seo.social.imageAlt} />
      ) : (
        <span className={tool.shareEmpty}>No image</span>
      )}
      <figcaption>
        <span className={ui.muted}>{hostOf(seo.siteUrl)}</span>
        <strong>{seo.social.title || seo.title}</strong>
        <span>
          {clipTo(
            seo.social.description || seo.description,
            DESCRIPTION_RANGE.max,
          )}
        </span>
      </figcaption>
    </figure>
  );
}

export default function SeoPanel() {
  const { content } = useAdmin();
  const seo = getIn(content.state.draft, ["site", "seo"]) as
    | (SeoInput & { social: { twitterCard: string } })
    | undefined;
  const findings = useMemo(() => (seo ? checkSeo(seo) : []), [seo]);
  if (!seo) return null;
  return (
    <section className={ui.panel} aria-label="Search and sharing preview">
      <h2 className={ui.panelTitle}>Preview</h2>
      <div className={tool.counters}>
        <Counter label="Title" value={seo.title} range={TITLE_RANGE} />
        <Counter
          label="Description"
          value={seo.description}
          range={DESCRIPTION_RANGE}
        />
      </div>
      <div className={tool.cardGrid}>
        <SearchResult seo={seo} />
        <ShareCard
          seo={seo}
          isLarge={seo.social.twitterCard === "summary_large_image"}
        />
      </div>
      {findings.length > 0 ? (
        <ul className={tool.findings}>
          {findings.map((f) => (
            <li key={`${f.field}-${f.message}`} data-severity={f.severity}>
              {f.message}
            </li>
          ))}
        </ul>
      ) : (
        <p className={ui.good}>Title, description and previews look good.</p>
      )}
    </section>
  );
}
