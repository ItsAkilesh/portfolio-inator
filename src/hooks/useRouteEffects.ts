/**
 * File: useRouteEffects.ts
 * Purpose: On every route change: scroll to top, set the document title and record a page view.
 * Author: Akilesh
 * Date: 2026-10-20
 */
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { trackPageview } from "../lib/analytics";
import { navigation, seo } from "../portfolio";

const TITLE_SEPARATOR = " · ";

/** "Experience · Akilesh Srinivasa Kumar" for a known route, the bare site title otherwise. */
export function titleForPath(pathname: string): string {
  const item = navigation.find((nav) => nav.path === pathname);
  const isHome = pathname === "/" || pathname === "/home";
  return item && !isHome
    ? `${item.label}${TITLE_SEPARATOR}${seo.title}`
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
