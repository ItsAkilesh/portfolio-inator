/**
 * File: MediaLibrary.tsx
 * Purpose: Media tool: every image in public/images with its size, dimensions and how often the
 *          content uses it; filters for unused and large images; upload (optimised to WebP in the
 *          browser, with adjustable settings), rename (references follow) and safe removal (unused
 *          images only, moved to the local history trash).
 * Author: Akilesh
 * Date: 2026-10-21
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { portfolioSchema } from "../../content/schema";
import { usageCounts } from "../../content/walk";
import { imageUrl } from "../../lib/assets";
import { useAdmin } from "../AdminContext";
import {
  imageDetails,
  removeImage,
  renameImage,
  type ImageDetails,
} from "../api/assets";
import { isDirty } from "../draft";
import { isLarge } from "../media/imageFacts";
import { OptimiseSettingsForm } from "../media/OptimiseSettingsForm";
import { useNotify } from "../notices";
import ui from "../ui.module.css";
import pages from "./toolPages.module.css";

type Filter = "all" | "unused" | "large";
const FILTERS: readonly Filter[] = ["all", "unused", "large"];
const BYTES_PER_KB = 1024;
const ACCEPTED_IMAGE_TYPES =
  "image/png,image/jpeg,image/webp,image/gif,image/avif";

const kb = (bytes: number): string =>
  `${Math.max(1, Math.round(bytes / BYTES_PER_KB))} KB`;

function useImages() {
  const [images, setImages] = useState<readonly ImageDetails[]>([]);
  const refresh = useCallback(async () => {
    const result = await imageDetails();
    if (result.ok) setImages(result.data.images);
  }, []);
  useEffect(() => {
    void refresh();
  }, [refresh]);
  return { images, refresh };
}

function ImageCard({
  image,
  draftUses,
  onRename,
  onRemove,
}: {
  readonly image: ImageDetails;
  readonly draftUses: number;
  readonly onRename: (to: string) => void;
  readonly onRemove: () => void;
}) {
  const [name, setName] = useState(image.name);
  const uses = Math.max(image.uses, draftUses);
  return (
    <li className={pages.mediaCard} data-large={isLarge(image) || undefined}>
      <img src={imageUrl(image.name)} alt="" loading="lazy" />
      <input
        className={ui.textInput}
        aria-label={`Name of ${image.name}`}
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <span className={ui.muted}>
        {image.width && image.height ? `${image.width}×${image.height} · ` : ""}
        {kb(image.bytes)} · {uses === 0 ? "unused" : `used ${uses}×`}
      </span>
      <span className={ui.actions}>
        <button
          type="button"
          className={ui.secondary}
          disabled={name === image.name || !name.trim()}
          onClick={() => onRename(name)}
        >
          Rename
        </button>
        <button
          type="button"
          className={ui.secondary}
          disabled={uses > 0}
          title={uses > 0 ? "Used by the content" : "Move to the history trash"}
          onClick={onRemove}
        >
          Remove
        </button>
      </span>
    </li>
  );
}

function useMediaActions(refresh: () => Promise<void>) {
  const { content } = useAdmin();
  const notify = useNotify();
  const rename = async (from: string, to: string) => {
    if (isDirty(content.state))
      return notify(
        "Save or revert your changes before renaming images",
        "error",
      );
    const result = await renameImage(from, to, content.state.version);
    if (!result.ok) return notify(result.issues.join("; "), "error");
    notify(`Renamed to ${result.data.fileName}; references updated`);
    await Promise.all([refresh(), content.reload(), content.refreshImages()]);
  };
  const remove = async (name: string) => {
    const result = await removeImage(name);
    if (!result.ok) return notify(result.issues.join("; "), "error");
    notify(`${name} moved to .admin-history/trash`);
    await Promise.all([refresh(), content.refreshImages()]);
  };
  const upload = async (files: FileList | null) => {
    for (const file of files ? [...files] : []) await content.upload(file);
    await refresh();
  };
  return { rename, remove, upload };
}

function useDraftUsage(): ReadonlyMap<string, number> {
  const { content } = useAdmin();
  return useMemo(
    () => usageCounts(portfolioSchema, content.state.draft, "image"),
    [content.state.draft],
  );
}

function MediaToolbar({
  filter,
  onFilter,
  onUpload,
  shownCount,
  totalCount,
}: {
  readonly filter: Filter;
  readonly onFilter: (filter: Filter) => void;
  readonly onUpload: (files: FileList | null) => void;
  readonly shownCount: number;
  readonly totalCount: number;
}) {
  return (
    <div className={ui.toolbar}>
      <label className={ui.primary}>
        Upload images
        <input
          type="file"
          accept={ACCEPTED_IMAGE_TYPES}
          multiple
          hidden
          onChange={(e) => onUpload(e.target.files)}
        />
      </label>
      <span className={ui.segmented} role="group" aria-label="Show">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            aria-pressed={filter === f}
            onClick={() => onFilter(f)}
          >
            {f}
          </button>
        ))}
      </span>
      <span className={ui.muted}>
        {shownCount} of {totalCount}
      </span>
    </div>
  );
}

export default function MediaLibrary() {
  const { images, refresh } = useImages();
  const { rename, remove, upload } = useMediaActions(refresh);
  const [filter, setFilter] = useState<Filter>("all");
  const draftUsage = useDraftUsage();
  const shown = images.filter(
    (i) =>
      filter === "all" ||
      (filter === "large"
        ? isLarge(i)
        : Math.max(i.uses, draftUsage.get(i.name) ?? 0) === 0),
  );
  return (
    <div className={ui.tool}>
      <MediaToolbar
        filter={filter}
        onFilter={setFilter}
        onUpload={(files) => void upload(files)}
        shownCount={shown.length}
        totalCount={images.length}
      />
      <OptimiseSettingsForm />
      <ul className={pages.mediaGrid} aria-label="Images">
        {shown.map((image) => (
          <ImageCard
            key={image.name}
            image={image}
            draftUses={draftUsage.get(image.name) ?? 0}
            onRename={(to) => void rename(image.name, to)}
            onRemove={() => void remove(image.name)}
          />
        ))}
      </ul>
    </div>
  );
}
