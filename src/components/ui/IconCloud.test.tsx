/**
 * File: IconCloud.test.tsx
 * Purpose: Tests that IconCloud renders one decorative item per unique icon.
 * Author: Akilesh
 * Date: 2026-10-20
 */
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { IconCloud, uniqueIcons } from "./IconCloud";

describe("uniqueIcons", () => {
  it("drops duplicates and keeps first-seen order", () => {
    expect(uniqueIcons(["react", "python", "react", "rust"])).toEqual([
      "react",
      "python",
      "rust",
    ]);
  });
  it("handles an empty list", () => {
    expect(uniqueIcons([])).toEqual([]);
  });
});

describe("IconCloud", () => {
  it("renders one hidden-from-assistive-tech item per unique icon", () => {
    const { container } = render(
      <IconCloud icons={["react", "python", "react"]} />,
    );
    const cloud = container.firstElementChild;
    expect(cloud?.getAttribute("aria-hidden")).toBe("true");
    expect(cloud?.children).toHaveLength(2);
    expect(cloud?.querySelectorAll("svg")).toHaveLength(2);
  });
  it("renders an empty container without icons", () => {
    const { container } = render(<IconCloud icons={[]} />);
    expect(container.firstElementChild?.children).toHaveLength(0);
  });
});
