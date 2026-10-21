/**
 * File: setup.ts
 * Purpose: Vitest setup: browser APIs jsdom lacks (matchMedia, observers, canvas, scrollTo), DOM cleanup,
 *          and a silent log sink. Node-environment tests get only the log sink.
 * Author: Akilesh
 * Date: 2026-10-20 (updated 2026-10-21)
 */
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";
import { setLogSink } from "../lib/logger";

class ObserverStub {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
  takeRecords(): [] {
    return [];
  }
}

/** Browser API stubs; node-environment tests (tools/vite) have no window and skip them. */
function stubBrowserApis(): void {
  vi.stubGlobal("ResizeObserver", ObserverStub);
  vi.stubGlobal("IntersectionObserver", ObserverStub);

  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string): MediaQueryList =>
      ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
        addListener: () => undefined,
        removeListener: () => undefined,
        dispatchEvent: () => false,
      }) as MediaQueryList,
  });

  window.scrollTo = (() => undefined) as typeof window.scrollTo;
  HTMLCanvasElement.prototype.getContext = (() =>
    null) as typeof HTMLCanvasElement.prototype.getContext;
}

const hasDom = typeof window !== "undefined";
if (hasDom) stubBrowserApis();

setLogSink(() => undefined);

afterEach(() => {
  if (!hasDom) return;
  cleanup();
  window.localStorage.clear();
  window.sessionStorage.clear();
});
