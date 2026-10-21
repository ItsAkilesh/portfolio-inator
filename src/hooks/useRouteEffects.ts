/**
 * File: useRouteEffects.ts
 * Purpose: On every route change: scroll to top, set the document title and record a page view.
 * Author: Akilesh
 * Date: 2026-10-20 (updated 2026-10-21)
 */
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { trackPageview } from "../lib/analytics";
import { homePage, pageForPath, seo } from "../portfolio";

const TITLE_SEPARATOR = " · ";

/** "Experience · Akilesh Srinivasa Kumar" for a known route, the bare site title otherwise. */
export function titleForPath(pathname: string): string {
  const page = pageForPath(pathname);
  return page && page.id !== homePage.id
    ? `${page.label}${TITLE_SEPARATOR}${seo.title}`
    : seo.title;
}

export function useRouteEffects(): void {
  const { pathname, search } = useLocation();

  useEffect(() => {
    document.title = titleForPath(pathname);
    window.scrollTo({ top: 0 });
    trackPageview(pathname + search);
  }, [pathname, search]);
}
