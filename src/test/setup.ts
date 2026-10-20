/**
 * File: setup.ts
 * Purpose: Vitest setup: browser APIs jsdom lacks (matchMedia, observers, canvas, scrollTo) and DOM cleanup.
 * Author: Akilesh
 * Date: 2026-10-20
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

setLogSink(() => undefined);

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  window.sessionStorage.clear();
});
