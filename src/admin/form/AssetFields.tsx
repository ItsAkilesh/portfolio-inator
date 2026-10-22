/**
 * File: AssetFields.tsx
 * Purpose: Editors for icon keys and images. Icons: a searchable dropdown over the library that, as
 *          you type, also offers every simple-icons icon (picking one adds it to the library) and an
 *          SVG import. Images: a searchable dropdown with previews plus uploading (optimised first).
 * Author: Akilesh
 * Date: 2026-10-21 (updated 2026-10-22)
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { BrandIcon } from "../../icons/BrandIcon";
import { isIconKey } from "../../icons/registry";
import { imageUrl } from "../../lib/assets";
import { searchIcons, type CatalogIcon } from "../api/assets";
import { ImportSvgDialog } from "../icons/ImportSvgDialog";
import { useIconImport } from "../icons/useIconImport";
import type { Path } from "../paths";
import { Combobox } from "./Combobox";
import { useForm } from "./FormContext";
import styles from "./form.module.css";

const ICON_PREVIEW = 18;
const IMAGE_TYPES = "image/png,image/jpeg,image/webp,image/gif,image/avif";
const CATALOG_PREFIX = "simple-icons:";
const MIN_QUERY = 2;
const SEARCH_DELAY_MS = 200;

interface AssetProps {
  readonly id: string;
  readonly value: string;
  readonly onChange: (value: string) => void;
}

const imagePreview = (file: string) => <img src={imageUrl(file)} alt="" />;
const asOptions = (values: readonly string[]) =>
  values.map((value) => ({ value, label: value }));

/** simple-icons matches for the typed text that are not in the library yet. */
function useCatalogMatches(query: string): readonly CatalogIcon[] {
  const [results, setResults] = useState<readonly CatalogIcon[]>([]);
  useEffect(() => {
    if (query.trim().length < MIN_QUERY) {
      setResults([]);
      return undefined;
    }
    let isCurrent = true;
    const timer = setTimeout(() => {
      void searchIcons(query, 12).then((r) => {
        if (isCurrent && r.ok)
          setResults(r.data.results.filter((icon) => icon.key === null));
      });
    }, SEARCH_DELAY_MS);
    return () => {
      isCurrent = false;
      clearTimeout(timer);
    };
  }, [query]);
  return results;
}

function catalogPreview(icon: CatalogIcon) {
  return (
    <svg
      width={ICON_PREVIEW}
      height={ICON_PREVIEW}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d={icon.path} fill="currentColor" />
    </svg>
  );
}

export function IconInput({
  id,
  value,
  onChange,
  options,
  path,
}: AssetProps & { readonly options: readonly string[]; readonly path: Path }) {
  const [query, setQuery] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const icons = useIconImport();
  const matches = useCatalogMatches(icons.isAvailable ? query : "");
  const choices = useMemo(
    () => [
      ...asOptions(options),
      ...matches.map((icon) => ({
        value: `${CATALOG_PREFIX}${icon.slug}`,
        label: icon.title,
        hint: "add from simple-icons",
      })),
    ],
    [options, matches],
  );
  const preview = useCallback(
    (key: string) => {
      const match = matches.find(
        (icon) => `${CATALOG_PREFIX}${icon.slug}` === key,
      );
      if (match) return catalogPreview(match);
      return isIconKey(key) ? (
        <BrandIcon name={key} size={ICON_PREVIEW} />
      ) : null;
    },
    [matches],
  );
  const choose = (next: string) =>
    next.startsWith(CATALOG_PREFIX)
      ? void icons.addFromCatalog(next.slice(CATALOG_PREFIX.length), path)
      : onChange(next);
  return (
    <div className={styles.inline}>
      <span className={styles.preview} aria-hidden="true">
        {preview(value)}
      </span>
      <Combobox
        id={id}
        value={value}
        options={choices}
        onChange={choose}
        renderPreview={preview}
        onQueryChange={setQuery}
        emptyText="No icons match"
      />
      {icons.isAvailable && (
        <button
          type="button"
          className={styles.button}
          onClick={() => setIsImporting(true)}
        >
          Import SVG
        </button>
      )}
      {isImporting && (
        <ImportSvgDialog
          isBusy={icons.isBusy}
          onClose={() => setIsImporting(false)}
          onImport={(input) => void icons.importSvg(input, path)}
        />
      )}
    </div>
  );
}

/** Uploads a picked file and reports the stored name; tracks progress for the button label. */
function useUpload(onDone: (name: string) => void) {
  const { uploadImage } = useForm();
  const [isUploading, setIsUploading] = useState(false);
  const upload = async (file: File | undefined) => {
    if (!file) return;
    setIsUploading(true);
    const name = await uploadImage(file);
    setIsUploading(false);
    if (name) onDone(name);
  };
  return { isUploading, upload };
}

export function ImageInput({ id, value, onChange }: AssetProps) {
  const { images } = useForm();
  const choices = useMemo(() => asOptions(images), [images]);
  const { isUploading, upload } = useUpload(onChange);
  return (
    <div className={styles.inline}>
      <span className={styles.preview}>
        {value && images.includes(value) && imagePreview(value)}
      </span>
      <Combobox
        id={id}
        value={value}
        options={choices}
        onChange={onChange}
        renderPreview={imagePreview}
        emptyText="No images match; upload one"
      />
      <label className={styles.button}>
        {isUploading ? "Uploading…" : "Upload"}
        <input
          type="file"
          accept={IMAGE_TYPES}
          hidden
          onChange={(e) => void upload(e.target.files?.[0])}
        />
      </label>
    </div>
  );
}
