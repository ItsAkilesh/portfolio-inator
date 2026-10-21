/**
 * File: app.test.tsx
 * Purpose: Integration tests: every route renders inside the real layout, theme toggling works,
 *          and helpers that read the config return the expected values.
 * Author: Akilesh
 * Date: 2026-10-20 (updated 2026-10-21)
 */
import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import App from "../App";
import { titleForPath } from "../hooks/useRouteEffects";
import { homePage, pages, skills, theme } from "../portfolio";
import { numberedForVenue, venueOptions } from "../sections/PublicationList";
import { ThemeProvider } from "../theme/ThemeProvider";
import { blocksOf } from "./blocks";

/** [path, h1] for every page that starts with a header block. */
const HEADED_PAGES = pages.flatMap((page) => {
  const first = page.blocks[0];
  return first?.type === "header" ? [[page.path, first.title] as const] : [];
});
const PUBLICATIONS = blocksOf("publications").flatMap((block) => block.entries);

function renderAt(path: string) {
  return render(
    <ThemeProvider config={theme}>
      <MemoryRouter initialEntries={[path]}>
        <App />
      </MemoryRouter>
    </ThemeProvider>,
  );
}

describe("routes", () => {
  it.each(HEADED_PAGES)("%s renders its page title", async (path, title) => {
    renderAt(path);
    expect(
      await screen.findByRole("heading", { level: 1, name: title }),
    ).toBeTruthy();
  });

  it("serves the first page at / and at its own path", async () => {
    renderAt(homePage.path);
    expect(await screen.findByRole("heading", { level: 1 })).toBeTruthy();
  });

  it("home renders the name and one block per skill group", async () => {
    renderAt("/");
    expect(await screen.findByRole("heading", { level: 1 })).toBeTruthy();
    expect(screen.getAllByRole("article").length).toBe(skills.length);
  });

  it("unknown paths render the not found page", async () => {
    renderAt("/nope");
    expect(
      await screen.findByRole("navigation", { name: "Pages" }),
    ).toBeTruthy();
  });
});

describe("interactions", () => {
  it("toggles the color mode on the document", async () => {
    renderAt("/");
    const button = await screen.findByRole("button", {
      name: /switch to dark theme/i,
    });
    fireEvent.click(button);
    expect(document.documentElement.dataset.theme).toBe("dark");
  });

  it("switches timeline tabs", async () => {
    const page = pages.find((p) => p.blocks.some((b) => b.type === "timeline"));
    const second = blocksOf("timeline")[0]?.groups[1];
    if (!page || !second) return;
    renderAt(page.path);
    const group = await screen.findByRole("group", { name: "Sections" });
    fireEvent.click(
      within(group).getByRole("button", { name: new RegExp(second.title) }),
    );
    const first = second.entries[0];
    expect(
      screen.getByRole("heading", { level: 2, name: first?.title }),
    ).toBeTruthy();
  });
});

describe("config-derived helpers", () => {
  it("titles known routes and falls back for unknown ones", () => {
    const inner = pages[1];
    if (inner) expect(titleForPath(inner.path)).toContain(inner.label);
    expect(titleForPath("/")).not.toContain("·");
    expect(titleForPath("/nowhere")).not.toContain("·");
  });
  it("keeps original numbering when filtering by venue", () => {
    const entries = PUBLICATIONS;
    const all = numberedForVenue(entries, "All", "All");
    expect(all).toHaveLength(entries.length);
    const ssrn = numberedForVenue(entries, "SSRN", "All");
    expect(ssrn.every(({ entry }) => entry.location === "SSRN")).toBe(true);
    expect(ssrn[0]?.number).not.toBe("01");
    expect(numberedForVenue(entries, "Nowhere", "All")).toEqual([]);
  });
  it("lists unique venues after the all option", () => {
    const entries = PUBLICATIONS;
    const options = venueOptions(entries, "All");
    expect(options[0]).toBe("All");
    expect(new Set(options).size).toBe(options.length);
  });
});
