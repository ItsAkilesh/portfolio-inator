/**
 * File: ThemeProvider.tsx
 * Purpose: Holds the light/dark mode, follows the system setting until the visitor chooses, and applies the palette.
 * Author: Akilesh
 * Date: 2026-10-20
 */
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { readStored, writeStored } from "../lib/storage";
import type { ColorMode, ThemeConfig } from "../types/theme";
import { applyTheme, loadFontStylesheet } from "./cssVars";
import { ThemeContext, type ThemeContextValue } from "./themeContext";

const STORAGE_KEY = "portfolio.colorMode";
const DARK_QUERY = "(prefers-color-scheme: dark)";

const isColorMode = (value: unknown): value is ColorMode =>
  value === "light" || value === "dark";

function systemMode(): ColorMode {
  try {
    return window.matchMedia(DARK_QUERY).matches ? "dark" : "light";
  } catch {
    return "light";
  }
}

function initialMode(config: ThemeConfig): {
  mode: ColorMode;
  isExplicit: boolean;
} {
  const stored = readStored("local", STORAGE_KEY);
  if (isColorMode(stored)) return { mode: stored, isExplicit: true };
  if (config.defaultMode !== "system")
    return { mode: config.defaultMode, isExplicit: false };
  return { mode: systemMode(), isExplicit: false };
}

interface ThemeProviderProps {
  readonly config: ThemeConfig;
  readonly children: ReactNode;
}

export function ThemeProvider({ config, children }: ThemeProviderProps) {
  const [{ mode, isExplicit }, setState] = useState(() => initialMode(config));

  useEffect(() => {
    applyTheme(document.documentElement, config, mode);
  }, [config, mode]);

  useEffect(() => {
    loadFontStylesheet(document, config.fonts.stylesheet);
  }, [config.fonts.stylesheet]);

  useEffect(() => {
    if (isExplicit || config.defaultMode !== "system") return undefined;
    let query: MediaQueryList;
    try {
      query = window.matchMedia(DARK_QUERY);
    } catch {
      return undefined;
    }
    const onChange = (event: MediaQueryListEvent) =>
      setState({ mode: event.matches ? "dark" : "light", isExplicit: false });
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, [isExplicit, config.defaultMode]);

  const toggle = useCallback(() => {
    setState((prev) => {
      const next: ColorMode = prev.mode === "dark" ? "light" : "dark";
      writeStored("local", STORAGE_KEY, next);
      return { mode: next, isExplicit: true };
    });
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({ mode, toggle }),
    [mode, toggle],
  );
  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
