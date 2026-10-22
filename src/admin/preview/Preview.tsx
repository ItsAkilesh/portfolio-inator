/**
 * File: Preview.tsx
 * Purpose: Live site preview beside the editor. It shows the saved content (saving reloads it), at
 *          phone, tablet or desktop width, in the site's own, light or dark mode, with the draft
 *          palette from the theme studio. While a block is being edited it scrolls to it, and with
 *          "Click to edit" on, clicking a block in the preview opens its fields.
 * Author: Akilesh
 * Date: 2026-10-21 (updated 2026-10-22)
 */
import { useEffect, useMemo, useState, type RefObject } from "react";
import { getIn } from "../paths";
import { useAdmin } from "../AdminContext";
import { useFocusTarget } from "../focus";
import { usePreviewControls } from "./PreviewContext";
import { usePreviewFrame, type PreviewMode } from "./usePreviewFrame";
import styles from "../admin.module.css";
import ui from "../ui.module.css";

const DEVICES = { phone: 390, tablet: 768, desktop: 0 } as const;
type Device = keyof typeof DEVICES;

interface PageRef {
  readonly id: string;
  readonly path: string;
  readonly label: string;
}

const pagesOf = (content: unknown): PageRef[] =>
  ((getIn(content, ["pages"]) as PageRef[] | undefined) ?? []).map(
    ({ id, path, label }) => ({ id, path, label }),
  );

/** The page and block the focused field belongs to, e.g. pages.2.blocks.1.title. */
function useRevealTarget(pages: readonly PageRef[]) {
  const target = useFocusTarget();
  return useMemo(() => {
    if (!target || target[0] !== "pages" || typeof target[1] !== "number")
      return null;
    const page = pages[target[1]];
    if (!page) return null;
    const blockIndex =
      target[2] === "blocks" && typeof target[3] === "number" ? target[3] : 0;
    return { page, blockIndex };
  }, [target, pages]);
}

function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  readonly label: string;
  readonly value: T;
  readonly options: readonly T[];
  readonly onChange: (v: T) => void;
}) {
  return (
    <span className={ui.segmented} role="group" aria-label={label}>
      {options.map((option) => (
        <button
          key={option}
          type="button"
          aria-pressed={value === option}
          onClick={() => onChange(option)}
        >
          {option}
        </button>
      ))}
    </span>
  );
}

function PageSelect({
  pages,
  path,
  onChange,
}: {
  readonly pages: readonly PageRef[];
  readonly path: string;
  readonly onChange: (path: string) => void;
}) {
  return (
    <select
      className={ui.select}
      value={path}
      aria-label="Preview page"
      onChange={(e) => onChange(e.target.value)}
    >
      {pages.map((page) => (
        <option key={page.id} value={page.path}>
          {page.label}
        </option>
      ))}
    </select>
  );
}

function EditModeToggle({
  isOn,
  onChange,
}: {
  readonly isOn: boolean;
  readonly onChange: (isOn: boolean) => void;
}) {
  return (
    <label className={ui.checkLabel}>
      <input
        type="checkbox"
        checked={isOn}
        onChange={(e) => onChange(e.target.checked)}
      />
      Click to edit
    </label>
  );
}

/** The page shown: a newly edited block takes the preview to its page; picking a page afterwards wins until then. */
function usePreviewPath(
  pages: readonly PageRef[],
  reveal: ReturnType<typeof useRevealTarget>,
) {
  const [chosenPath, setChosenPath] = useState<string | null>(null);
  useEffect(() => setChosenPath(null), [reveal]);
  const path = chosenPath ?? reveal?.page.path ?? pages[0]?.path ?? "/";
  return { path, setChosenPath };
}

function useRevealMessage(reveal: ReturnType<typeof useRevealTarget>) {
  return useMemo(
    () =>
      reveal ? { pageId: reveal.page.id, blockIndex: reveal.blockIndex } : null,
    [reveal],
  );
}

function PreviewFrame({
  frameRef,
  width,
  path,
  hasPalette,
}: {
  readonly frameRef: RefObject<HTMLIFrameElement | null>;
  readonly width: number;
  readonly path: string;
  readonly hasPalette: boolean;
}) {
  return (
    <>
      <p className={styles.previewNote}>
        {hasPalette
          ? "Showing the draft palette; save to keep it."
          : "Showing the saved version."}
      </p>
      <div className={styles.frameWrap}>
        <iframe
          ref={frameRef}
          className={styles.frame}
          style={width ? { width, flex: "none" } : undefined}
          title="Site preview"
          src={path}
        />
      </div>
    </>
  );
}

/** Width, colour mode and click-to-edit, chosen in the preview bar. */
function useViewControls() {
  const [device, setDevice] = useState<Device>("desktop");
  const [mode, setMode] = useState<PreviewMode>("site");
  const [isEditMode, setIsEditMode] = useState(false);
  return { device, setDevice, mode, setMode, isEditMode, setIsEditMode };
}

function PreviewBar({
  pages,
  path,
  onPath,
  view,
}: {
  readonly pages: readonly PageRef[];
  readonly path: string;
  readonly onPath: (path: string) => void;
  readonly view: ReturnType<typeof useViewControls>;
}) {
  return (
    <div className={styles.previewBar}>
      <PageSelect pages={pages} path={path} onChange={onPath} />
      <Segmented
        label="Preview width"
        value={view.device}
        options={["phone", "tablet", "desktop"]}
        onChange={view.setDevice}
      />
      <Segmented
        label="Preview colours"
        value={view.mode}
        options={["site", "light", "dark"]}
        onChange={view.setMode}
      />
      <EditModeToggle isOn={view.isEditMode} onChange={view.setIsEditMode} />
    </div>
  );
}

export function Preview() {
  const { content } = useAdmin();
  const pages = useMemo(
    () => pagesOf(content.state.saved),
    [content.state.saved],
  );
  const reveal = useRevealTarget(pages);
  const { path, setChosenPath } = usePreviewPath(pages, reveal);
  const view = useViewControls();
  const { palette } = usePreviewControls();
  const frame = usePreviewFrame({
    mode: view.mode,
    palette,
    isEditMode: view.isEditMode,
    reveal: useRevealMessage(reveal),
    pageIds: pages.map((p) => p.id),
  });
  return (
    <section className={styles.preview} aria-label="Preview">
      <PreviewBar
        pages={pages}
        path={path}
        onPath={setChosenPath}
        view={view}
      />
      <PreviewFrame
        frameRef={frame}
        width={DEVICES[view.device]}
        path={path}
        hasPalette={palette !== null}
      />
    </section>
  );
}
