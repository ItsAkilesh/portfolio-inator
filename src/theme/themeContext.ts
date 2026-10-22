/**
 * File: themeContext.ts
 * Purpose: React context and hook exposing the current color mode and a toggle.
 * Author: Akilesh
 * Date: 2026-10-20
 */
import { createContext, useContext } from "react";
import type { ColorMode } from "../types/theme";

export interface ThemeContextValue {
  readonly mode: ColorMode;
  readonly toggle: () => void;
  /** False when the config hides the toggle and forces a mode. */
  readonly canToggle: boolean;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme(): ThemeContextValue {
  const value = useContext(ThemeContext);
  if (!value) throw new Error("useTheme must be used inside <ThemeProvider>");
  return value;
}
