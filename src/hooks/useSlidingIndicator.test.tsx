/**
 * File: useSlidingIndicator.test.tsx
 * Purpose: Tests for the sliding tab indicator measurement and the segmented control wiring.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { SegmentedControl } from "../components/ui/SegmentedControl";
import { activeBox } from "./useSlidingIndicator";

const OPTIONS = [
  { value: "a", label: "Alpha" },
  { value: "b", label: "Beta" },
] as const;

function Harness() {
  const [value, setValue] = useState<"a" | "b">("a");
  return (
    <SegmentedControl
      label="Pick"
      options={OPTIONS}
      value={value}
      onChange={setValue}
    />
  );
}

describe("activeBox", () => {
  it("returns null when no option is pressed", () => {
    const group = document.createElement("div");
    group.innerHTML = `<button aria-pressed="false">x</button>`;
    expect(activeBox(group)).toBeNull();
  });
  it("returns the pressed option's offsets", () => {
    const group = document.createElement("div");
    group.innerHTML = `<button aria-pressed="true">x</button>`;
    expect(activeBox(group)).toEqual({ x: 0, y: 0, width: 0, height: 0 });
  });
});

describe("SegmentedControl indicator", () => {
  it("marks the group once an option is measured", () => {
    render(<Harness />);
    expect(screen.getByRole("group").dataset.indicator).toBe("on");
  });
  it("moves the pressed state when another option is chosen", () => {
    render(<Harness />);
    fireEvent.click(screen.getByRole("button", { name: "Beta" }));
    expect(
      screen.getByRole("button", { name: "Beta" }).getAttribute("aria-pressed"),
    ).toBe("true");
    expect(
      screen
        .getByRole("button", { name: "Alpha" })
        .getAttribute("aria-pressed"),
    ).toBe("false");
  });
});
