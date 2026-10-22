/**
 * File: AssetFields.tsx
 * Purpose: Editors for icon keys (searchable list with a live icon) and images (pick from
 *          public/images or upload, with a preview).
 * Author: Akilesh
 * Date: 2026-10-21
 */
import { useId, useState } from "react";
import { BrandIcon } from "../../icons/BrandIcon";
import { isIconKey } from "../../icons/registry";
import { imageUrl } from "../../lib/assets";
import { useForm } from "./FormContext";
import styles from "./form.module.css";

const ICON_PREVIEW = 20;

interface AssetProps {
  readonly id: string;
  readonly value: string;
  readonly onChange: (value: string) => void;
}

export function IconInput({
  id,
  value,
  onChange,
  options,
}: AssetProps & { readonly options: readonly string[] }) {
  const listId = useId();
  return (
    <div className={styles.inline}>
      <span className={styles.preview} aria-hidden="true">
        {isIconKey(value) && <BrandIcon name={value} size={ICON_PREVIEW} />}
      </span>
      <input
        id={id}
        className={styles.input}
        list={listId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <datalist id={listId}>
        {options.map((option) => (
          <option key={option} value={option} />
        ))}
      </datalist>
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

const IMAGE_TYPES = "image/png,image/jpeg,image/webp,image/gif,image/avif";

export function ImageInput({ id, value, onChange }: AssetProps) {
  const { images } = useForm();
  const listId = useId();
  const { isUploading, upload } = useUpload(onChange);
  return (
    <div className={styles.inline}>
      <span className={styles.preview}>
        {value && images.includes(value) && (
          <img src={imageUrl(value)} alt="" />
        )}
      </span>
      <input
        id={id}
        className={styles.input}
        list={listId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <datalist id={listId}>
        {images.map((image) => (
          <option key={image} value={image} />
        ))}
      </datalist>
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
