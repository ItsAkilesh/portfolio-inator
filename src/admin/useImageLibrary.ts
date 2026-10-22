/**
 * File: useImageLibrary.ts
 * Purpose: The list of images in public/images and uploading new ones through the dev server,
 *          optimised in the browser first (see media/optimiseImage.ts).
 * Author: Akilesh
 * Date: 2026-10-21 (updated 2026-10-22)
 */
import { useCallback, useEffect, useState } from "react";
import { listImages, uploadImage } from "./api/assets";
import { prepareUpload } from "./media/optimiseImage";

export interface ImageLibrary {
  readonly images: readonly string[];
  /** Stored file name, or null when the upload was refused (reported through onFailure). */
  readonly upload: (file: File) => Promise<string | null>;
  readonly refresh: () => Promise<void>;
}

export function useImageLibrary(
  onFailure: (issues: readonly string[]) => void,
  onNotice: (message: string) => void,
): ImageLibrary {
  const [images, setImages] = useState<readonly string[]>([]);
  const refresh = useCallback(async () => {
    const result = await listImages();
    if (result.ok) setImages(result.data.images);
    else onFailure(result.issues);
  }, [onFailure]);
  useEffect(() => {
    void refresh();
  }, [refresh]);
  const upload = useCallback(
    async (file: File) => {
      const prepared = await prepareUpload(file);
      const result = await uploadImage(prepared.blob, prepared.fileName);
      if (!result.ok) {
        onFailure(result.issues);
        return null;
      }
      onNotice(
        prepared.note
          ? `${prepared.note}: ${result.data.fileName}`
          : `Uploaded ${result.data.fileName}`,
      );
      await refresh();
      return result.data.fileName;
    },
    [onFailure, onNotice, refresh],
  );
  return { images, upload, refresh };
}
