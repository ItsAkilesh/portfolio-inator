/**
 * File: useDraftForm.ts
 * Purpose: The form context for editing the draft, for any page that embeds generated fields (the
 *          section editor and the setup wizard).
 * Author: Akilesh
 * Date: 2026-10-21
 */
import { useMemo } from "react";
import { useAdmin } from "../AdminContext";
import type { FormContextValue } from "./FormContext";
import { SchemaField } from "./SchemaField";

export function useDraftForm(): FormContextValue {
  const { content, issues } = useAdmin();
  return useMemo(
    () => ({
      root: content.state.draft,
      onChange: content.edit,
      issues: issues.byPath,
      images: content.images,
      uploadImage: content.upload,
      Field: SchemaField,
    }),
    [
      content.state.draft,
      content.edit,
      issues.byPath,
      content.images,
      content.upload,
    ],
  );
}
