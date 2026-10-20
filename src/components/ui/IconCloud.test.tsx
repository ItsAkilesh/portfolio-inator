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
  it("renders one vertex per unique icon and edges between neighbors", () => {
    const { container } = render(
      <IconCloud icons={["react", "python", "react", "rust", "docker"]} />,
    );
    const cloud = container.firstElementChild;
    expect(cloud?.getAttribute("aria-hidden")).toBe("true");
    expect(cloud?.querySelectorAll("[data-cloud-item]")).toHaveLength(4);
    expect(cloud?.querySelectorAll("[data-cloud-edge]").length).toBeGreaterThan(
      0,
    );
  });
  it("renders no vertices or edges without icons", () => {
    const { container } = render(<IconCloud icons={[]} />);
    expect(container.querySelectorAll("[data-cloud-item]")).toHaveLength(0);
    expect(container.querySelectorAll("[data-cloud-edge]")).toHaveLength(0);
  });
});
