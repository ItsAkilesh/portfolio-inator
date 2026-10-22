/**
 * File: ThemeStudio.tsx
 * Purpose: Theme section panel: every palette in the draft with its colours in both modes, a sample
 *          of text and accent, WCAG contrast scores for the pairs that carry text, a "use this" button
 *          and a live preview of the draft palette in the site preview (follows edits below).
 * Author: Akilesh
 * Date: 2026-10-21
 */
import { useEffect, useMemo, useState } from "react";
import { gradeOf } from "../../lib/contrast";
import type { ColorMode, Palette, PaletteTokens } from "../../types/theme";
import { useAdmin } from "../AdminContext";
import { getIn } from "../paths";
import { usePreviewControls } from "../preview/PreviewContext";
import { checkContrast, resolveSource } from "../theme/palettes";
import ui from "../ui.module.css";
import tool from "../tools/tools.module.css";

const NO_PALETTES: Readonly<Record<string, unknown>> = {};
const SWATCHES: readonly (keyof PaletteTokens)[] = [
  "bg",
  "surface",
  "ink",
  "inkMuted",
  "accent",
  "onAccent",
  "link",
  "line",
];

function Sample({
  tokens,
  mode,
}: {
  readonly tokens: PaletteTokens;
  readonly mode: ColorMode;
}) {
  return (
    <div
      className={tool.sample}
      style={{
        background: tokens.bg,
        color: tokens.ink,
        borderColor: tokens.line,
      }}
    >
      <strong>{mode === "light" ? "Light" : "Dark"}</strong>
      <span style={{ color: tokens.inkMuted }}>Secondary text</span>
      <span style={{ color: tokens.link }}>A link</span>
      <span
        className={tool.sampleAccent}
        style={{ background: tokens.accent, color: tokens.onAccent }}
      >
        On accent
      </span>
      <span className={tool.swatchRow}>
        {SWATCHES.map((token) => (
          <span
            key={token}
            className={tool.swatchDot}
            style={{ background: tokens[token] }}
            title={`${token}: ${tokens[token]}`}
          />
        ))}
      </span>
    </div>
  );
}

function ContrastTable({ palette }: { readonly palette: Palette }) {
  const results = useMemo(() => checkContrast(palette), [palette]);
  return (
    <table className={ui.table}>
      <caption className={ui.srOnly}>Contrast ratios</caption>
      <thead>
        <tr>
          <th scope="col">Pair</th>
          <th scope="col">Mode</th>
          <th scope="col">Ratio</th>
          <th scope="col">Grade</th>
        </tr>
      </thead>
      <tbody>
        {results.map((r) => (
          <tr
            key={`${r.mode}-${r.label}`}
            data-fail={!r.isPassing || undefined}
          >
            <td>{r.label}</td>
            <td>{r.mode}</td>
            <td>
              {r.ratio === null ? "unreadable" : `${r.ratio.toFixed(2)}:1`}
            </td>
            <td>
              {r.ratio === null
                ? "?"
                : r.isPassing
                  ? gradeOf(r.ratio)
                  : `Fail (needs ${r.minimum}:1)`}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

interface CardProps {
  readonly name: string;
  readonly palette: Palette;
  readonly isActive: boolean;
  readonly isPreviewing: boolean;
  readonly onUse: () => void;
  readonly onPreview: () => void;
}

function PaletteCard({
  name,
  palette,
  isActive,
  isPreviewing,
  onUse,
  onPreview,
}: CardProps) {
  return (
    <article className={tool.card} aria-label={`Palette ${name}`}>
      <header className={tool.cardHead}>
        <h3 className={tool.cardTitle}>{name}</h3>
        {isActive && <span className={ui.tag}>Active</span>}
      </header>
      <div className={tool.sampleRow}>
        <Sample tokens={palette.light} mode="light" />
        <Sample tokens={palette.dark} mode="dark" />
      </div>
      <ContrastTable palette={palette} />
      <div className={ui.actions}>
        <button
          type="button"
          className={ui.secondary}
          disabled={isActive}
          onClick={onUse}
        >
          Use this palette
        </button>
        <button
          type="button"
          className={ui.secondary}
          aria-pressed={isPreviewing}
          onClick={onPreview}
        >
          {isPreviewing ? "Stop live preview" : "Preview live"}
        </button>
      </div>
    </article>
  );
}

/** Every palette in the draft that resolves, memoised so the live preview only updates when they change. */
function useDraftPalettes(draft: unknown) {
  const sources =
    (getIn(draft, ["theme", "palettes"]) as
      | Record<string, unknown>
      | undefined) ?? NO_PALETTES;
  return useMemo(
    () =>
      Object.entries(sources).flatMap(([name, source]) => {
        const palette = resolveSource(source);
        return palette ? [{ name, palette }] : [];
      }),
    [sources],
  );
}

/** Sends the previewed palette to the site preview, and clears it when the studio closes. */
function useLivePalette(live: Palette | null): void {
  const { setPalette } = usePreviewControls();
  useEffect(() => setPalette(live), [live, setPalette]);
  useEffect(() => () => setPalette(null), [setPalette]);
}

export default function ThemeStudio() {
  const { content } = useAdmin();
  const [previewing, setPreviewing] = useState<string | null>(null);
  const draft = content.state.draft;
  const active = String(getIn(draft, ["theme", "activePalette"]) ?? "");
  const palettes = useDraftPalettes(draft);
  const live = palettes.find((p) => p.name === previewing)?.palette ?? null;
  useLivePalette(live);
  return (
    <section className={ui.panel} aria-label="Theme studio">
      <h2 className={ui.panelTitle}>Palettes</h2>
      <div className={tool.cardGrid}>
        {palettes.map(({ name, palette }) => (
          <PaletteCard
            key={name}
            name={name}
            palette={palette}
            isActive={name === active}
            isPreviewing={name === previewing}
            onUse={() => content.edit(["theme", "activePalette"], name)}
            onPreview={() => setPreviewing((p) => (p === name ? null : name))}
          />
        ))}
      </div>
    </section>
  );
}
