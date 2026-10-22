/**
 * File: analytics.ts
 * Purpose: Optional Google Analytics and Microsoft Clarity, enabled by IDs in the portfolio config.
 *          IDs are validated against strict patterns before any script URL is built.
 * Author: Akilesh
 * Date: 2026-10-20
 */
import { describeError, logger } from "./logger";

const GA_ID_PATTERN = /^G-[A-Z0-9]{4,16}$/;
const CLARITY_ID_PATTERN = /^[a-z0-9]{6,16}$/;
const GA_SCRIPT = "https://www.googletagmanager.com/gtag/js?id=";
const CLARITY_SCRIPT = "https://www.clarity.ms/tag/";

type Gtag = (...args: unknown[]) => void;
type Clarity = ((...args: unknown[]) => void) & { q?: unknown[][] };

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: Gtag;
    clarity?: Clarity;
  }
}

export interface AnalyticsIds {
  readonly googleAnalyticsId?: string;
  readonly clarityId?: string;
}

export const isValidGaId = (id: string | undefined): id is string =>
  !!id && GA_ID_PATTERN.test(id);
export const isValidClarityId = (id: string | undefined): id is string =>
  !!id && CLARITY_ID_PATTERN.test(id);

function addScript(src: string): void {
  const script = document.createElement("script");
  script.async = true;
  script.src = src;
  script.addEventListener("error", () =>
    logger.warn("analytics.load", `failed: ${new URL(src).host}`),
  );
  document.head.appendChild(script);
}

function initGoogle(id: string): void {
  window.dataLayer = window.dataLayer ?? [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer?.push(args);
  };
  window.gtag("js", new Date());
  window.gtag("config", id, { send_page_view: false });
  addScript(`${GA_SCRIPT}${encodeURIComponent(id)}`);
}

function initClarity(id: string): void {
  const queue: Clarity = Object.assign(
    (...args: unknown[]) => (queue.q = queue.q ?? []).push(args),
    {},
  );
  window.clarity = window.clarity ?? queue;
  addScript(`${CLARITY_SCRIPT}${encodeURIComponent(id)}`);
}

let activeGaId: string | null = null;

/** Loads the configured providers once. Invalid IDs are skipped with a warning. */
export function initAnalytics(ids: AnalyticsIds): void {
  try {
    if (isValidGaId(ids.googleAnalyticsId) && !activeGaId) {
      activeGaId = ids.googleAnalyticsId;
      initGoogle(activeGaId);
    } else if (ids.googleAnalyticsId && !activeGaId) {
      logger.warn(
        "analytics.init",
        "googleAnalyticsId has an unexpected format; skipped",
      );
    }
    if (isValidClarityId(ids.clarityId) && !window.clarity)
      initClarity(ids.clarityId);
  } catch (error) {
    logger.error("analytics.init", describeError(error));
  }
}

/** Records a page view for client-side navigation. */
export function trackPageview(path: string): void {
  try {
    if (activeGaId && window.gtag)
      window.gtag("event", "page_view", { page_path: path });
    window.clarity?.("set", "page", path);
  } catch (error) {
    logger.warn("analytics.pageview", describeError(error));
  }
}
