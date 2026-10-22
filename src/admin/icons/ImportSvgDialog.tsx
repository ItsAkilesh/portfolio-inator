/**
 * File: ImportSvgDialog.tsx
 * Purpose: Imports an SVG file as a custom icon: pick the file, see it, name it and give it a brand
 *          colour. The server keeps only the shapes' geometry, so scripts or styles in the file are
 *          dropped.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import { useId, useState } from "react";
import { Modal } from "../Modal";
import { freeKey, takenKeys, type SvgInput } from "./useIconImport";
import ui from "../ui.module.css";
import pages from "../tools/toolPages.module.css";

const DEFAULT_HEX = "#6B7280";

interface ImportSvgDialogProps {
  readonly onImport: (input: SvgInput) => void;
  readonly onClose: () => void;
  readonly isBusy: boolean;
}

const titleFromFile = (name: string): string =>
  name
    .replace(/\.svg$/i, "")
    .replace(/[-_]+/g, " ")
    .trim();

export function ImportSvgDialog({
  onImport,
  onClose,
  isBusy,
}: ImportSvgDialogProps) {
  const ids = { file: useId(), title: useId(), key: useId(), hex: useId() };
  const [svg, setSvg] = useState("");
  const [title, setTitle] = useState("");
  const [key, setKey] = useState("");
  const [hex, setHex] = useState(DEFAULT_HEX);
  const pick = async (file: File | undefined) => {
    if (!file) return;
    setSvg(await file.text());
    const name = titleFromFile(file.name);
    setTitle(name);
    setKey(freeKey(name, takenKeys()));
  };
  const isReady =
    svg !== "" &&
    title.trim() !== "" &&
    /^[a-z0-9]+$/.test(key) &&
    /^#[0-9a-fA-F]{6}$/.test(hex);
  return (
    <Modal title="Import an SVG icon" onClose={onClose}>
      <div className={pages.formGrid}>
        <label htmlFor={ids.file}>SVG file</label>
        <input
          id={ids.file}
          type="file"
          accept=".svg,image/svg+xml"
          onChange={(e) => void pick(e.target.files?.[0])}
        />
        <label htmlFor={ids.title}>Name</label>
        <input
          id={ids.title}
          className={ui.textInput}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <label htmlFor={ids.key}>Key (used in the content)</label>
        <input
          id={ids.key}
          className={ui.textInput}
          value={key}
          onChange={(e) => setKey(e.target.value.toLowerCase())}
        />
        <label htmlFor={ids.hex}>Brand colour</label>
        <input
          id={ids.hex}
          type="color"
          value={hex}
          onChange={(e) => setHex(e.target.value)}
        />
      </div>
      <p className={ui.muted}>
        Only the shapes are kept; flatten transforms in your editor first.
      </p>
      <div className={ui.actions}>
        <button
          type="button"
          className={ui.primary}
          disabled={!isReady || isBusy}
          onClick={() => onImport({ key, title: title.trim(), hex, svg })}
        >
          {isBusy ? "Importing…" : "Import icon"}
        </button>
      </div>
    </Modal>
  );
}
