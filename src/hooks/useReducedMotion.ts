/**
 * File: useReducedMotion.ts
 * Purpose: Tracks the visitor's "reduce motion" preference.
 * Author: Akilesh
 * Date: 2026-10-20
 */
import { useEffect, useState } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function currentPreference(): boolean {
  try {
    return window.matchMedia(QUERY).matches;
  } catch {
    return false;
  }
}

export function useReducedMotion(): boolean {
  const [isReduced, setIsReduced] = useState(currentPreference);

  useEffect(() => {
    let query: MediaQueryList;
    try {
      query = window.matchMedia(QUERY);
    } catch {
      return undefined;
    }
    const onChange = (event: MediaQueryListEvent) =>
      setIsReduced(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  return isReduced;
}
