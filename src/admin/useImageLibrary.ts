/**
 * File: useImageLibrary.ts
 * Purpose: The list of images in public/images and uploading new ones through the dev server.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import { useCallback, useEffect, useState } from "react";
import { listImages, uploadImage } from "./api";

export interface ImageLibrary {
  readonly images: readonly string[];
  /** Stored file name, or null when the upload was refused (reported through onFailure). */
  readonly upload: (file: File) => Promise<string | null>;
}

export function useImageLibrary(
  onFailure: (issues: readonly string[]) => void,
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
      const result = await uploadImage(file);
      if (!result.ok) {
        onFailure(result.issues);
        return null;
      }
      await refresh();
      return result.data.fileName;
    },
    [onFailure, refresh],
  );
  return { images, upload };
}
