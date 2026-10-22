/**
 * File: useInViewFlag.test.tsx
 * Purpose: Tests that useInViewFlag mirrors visibility onto <html> and cleans up on unmount.
 * Author: Akilesh
 * Date: 2026-10-20
 */
import { render } from "@testing-library/react";
import { useRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useInViewFlag } from "./useInViewFlag";

const ATTRIBUTE = "data-test-in-view";
type Callback = (entries: Array<{ isIntersecting: boolean }>) => void;

let lastCallback: Callback | null = null;

class ControlledObserver {
  constructor(callback: Callback) {
    lastCallback = callback;
  }
  observe(): void {}
  disconnect(): void {}
}

function Probe() {
  const ref = useRef<HTMLDivElement>(null);
  useInViewFlag(ref, ATTRIBUTE);
  return <div ref={ref} />;
}

afterEach(() => {
  vi.unstubAllGlobals();
  lastCallback = null;
});

describe("useInViewFlag", () => {
  it("sets and clears the attribute as visibility changes", () => {
    vi.stubGlobal("IntersectionObserver", ControlledObserver);
    render(<Probe />);
    lastCallback?.([{ isIntersecting: true }]);
    expect(document.documentElement.getAttribute(ATTRIBUTE)).toBe("true");
    lastCallback?.([{ isIntersecting: false }]);
    expect(document.documentElement.hasAttribute(ATTRIBUTE)).toBe(false);
  });

  it("removes the attribute on unmount", () => {
    vi.stubGlobal("IntersectionObserver", ControlledObserver);
    const { unmount } = render(<Probe />);
    lastCallback?.([{ isIntersecting: true }]);
    unmount();
    expect(document.documentElement.hasAttribute(ATTRIBUTE)).toBe(false);
  });

  it("does not throw when IntersectionObserver is unavailable", () => {
    vi.stubGlobal("IntersectionObserver", () => {
      throw new Error("unsupported");
    });
    expect(() => render(<Probe />)).not.toThrow();
  });
});
