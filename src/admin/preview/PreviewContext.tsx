/**
 * File: PreviewContext.tsx
 * Purpose: Lets admin pages influence the live preview without reaching into it: the theme studio
 *          shows a draft palette there before it is saved.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import { createContext, useContext } from "react";
import type { Palette } from "../../types/theme";

export interface PreviewControls {
  readonly palette: Palette | null;
  readonly setPalette: (palette: Palette | null) => void;
}

export const PreviewContext = createContext<PreviewControls>({
  palette: null,
  setPalette: () => undefined,
});

export const usePreviewControls = (): PreviewControls =>
  useContext(PreviewContext);
