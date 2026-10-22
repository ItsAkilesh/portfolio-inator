/**
 * File: blocks.test.tsx
 * Purpose: Tests that custom blocks are part of the schema and render through BlockView, that text
 *          blocks render Markdown safely, and that page blocks carry their index for the preview.
 * Author: Akilesh
 * Date: 2026-10-22
 */
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { blockSchema } from "../content/schema/blocks";
import type { BlockConfig, PageConfig } from "../types/portfolio";
import { BlockView } from "./BlockView";
import { PageRenderer } from "./PageRenderer";

const callout = {
  type: "callout",
  title: "Heads up",
  body: "Read **this**.",
  tone: "highlight",
} as const;
const text = {
  type: "text",
  heading: "Notes",
  body: "## Sub\n\n[ok](https://x.dev) [bad](javascript:alert(1)) <img src=x onerror=alert(1)>",
} as const;

describe("custom blocks", () => {
  it("are validated by the block schema", () => {
    expect(blockSchema.safeParse(callout).success).toBe(true);
    expect(blockSchema.safeParse({ ...callout, tone: "loud" }).success).toBe(
      false,
    );
  });
  it("render through BlockView", async () => {
    render(<BlockView block={callout as BlockConfig} />);
    expect(
      await screen.findByRole("heading", { name: "Heads up" }),
    ).toBeTruthy();
    expect(screen.getByText("this").tagName).toBe("STRONG");
  });
});

describe("text blocks", () => {
  it("render Markdown with safe links and no injected HTML", async () => {
    const { container } = render(
      <MemoryRouter>
        <BlockView block={text as BlockConfig} />
      </MemoryRouter>,
    );
    expect(
      await screen.findByRole("heading", { level: 4, name: "Sub" }),
    ).toBeTruthy();
    expect(screen.getByRole("link", { name: "ok" }).getAttribute("href")).toBe(
      "https://x.dev",
    );
    expect(screen.queryByRole("link", { name: "bad" })).toBeNull();
    expect(container.querySelector("img")).toBeNull();
    expect(container.textContent).toContain("<img src=x onerror=alert(1)>");
  });
});

describe("PageRenderer", () => {
  it("wraps each block in a slot carrying its index", () => {
    const page = {
      id: "p",
      path: "/p",
      label: "P",
      showInNav: false,
      blocks: [callout, callout],
    } as unknown as PageConfig;
    const { container } = render(<PageRenderer page={page} />);
    expect(
      [...container.querySelectorAll("[data-block-index]")].map((el) =>
        el.getAttribute("data-block-index"),
      ),
    ).toEqual(["0", "1"]);
  });
});
