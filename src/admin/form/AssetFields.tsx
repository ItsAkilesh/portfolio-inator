/**
 * File: AssetFields.tsx
 * Purpose: Editors for icon keys and images: a searchable dropdown with a preview of every option,
 *          plus uploading new images into public/images.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import { useMemo, useState } from "react";
import { BrandIcon } from "../../icons/BrandIcon";
import { isIconKey } from "../../icons/registry";
import { imageUrl } from "../../lib/assets";
import { Combobox } from "./Combobox";
import { useForm } from "./FormContext";
import styles from "./form.module.css";

const ICON_PREVIEW = 18;
const IMAGE_TYPES = "image/png,image/jpeg,image/webp,image/gif,image/avif";

interface AssetProps {
  readonly id: string;
  readonly value: string;
  readonly onChange: (value: string) => void;
}

const iconPreview = (key: string) =>
  isIconKey(key) ? <BrandIcon name={key} size={ICON_PREVIEW} /> : null;
const imagePreview = (file: string) => <img src={imageUrl(file)} alt="" />;
const asOptions = (values: readonly string[]) =>
  values.map((value) => ({ value, label: value }));

export function IconInput({
  id,
  value,
  onChange,
  options,
}: AssetProps & { readonly options: readonly string[] }) {
  const choices = useMemo(() => asOptions(options), [options]);
  return (
    <div className={styles.inline}>
      <span className={styles.preview} aria-hidden="true">
        {iconPreview(value)}
      </span>
      <Combobox
        id={id}
        value={value}
        options={choices}
        onChange={onChange}
        renderPreview={iconPreview}
      />
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
