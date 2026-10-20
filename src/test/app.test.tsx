/**
 * File: app.test.tsx
 * Purpose: Integration tests: every route renders inside the real layout, theme toggling works,
 *          and helpers that read the config return the expected values.
 * Author: Akilesh
 * Date: 2026-10-20
 */
import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import App from "../App";
import { titleForPath } from "../hooks/useRouteEffects";
import {
  contactPageData,
  experience,
  links,
  projectsHeader,
  research,
  skills,
  theme,
} from "../portfolio";
import { venueOptions } from "../sections/PublicationList";
import { ThemeProvider } from "../theme/ThemeProvider";

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
  it.each([
    ["/experience", experience.title],
    ["/research", research.title],
    ["/projects", projectsHeader.title],
    ["/contact", contactPageData.contactSection.title],
    ["/links", links.title],
  ])("%s renders its page title", async (path, title) => {
    renderAt(path);
    expect(
      await screen.findByRole("heading", { level: 1, name: title }),
    ).toBeTruthy();
  });

  it("home renders the name and one block per skill group", async () => {
    renderAt("/");
    expect(await screen.findByRole("heading", { level: 1 })).toBeTruthy();
    expect(screen.getAllByRole("article").length).toBe(skills.data.length);
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

  it("switches experience tabs", async () => {
    renderAt("/experience");
    const second = experience.sections[1];
    if (!second) return;
    const group = await screen.findByRole("group", { name: experience.title });
    fireEvent.click(
      within(group).getByRole("button", { name: new RegExp(second.title) }),
    );
    const first = second.experiences[0];
    expect(
      screen.getByRole("heading", { level: 2, name: first?.title }),
    ).toBeTruthy();
  });
});

describe("config-derived helpers", () => {
  it("titles known routes and falls back for unknown ones", () => {
    expect(titleForPath("/research")).toContain("Research");
    expect(titleForPath("/nowhere")).not.toContain("·");
  });
  it("lists unique venues after the all option", () => {
    const entries = research.sections.flatMap((s) => s.research);
    const options = venueOptions(entries, "All");
    expect(options[0]).toBe("All");
    expect(new Set(options).size).toBe(options.length);
  });
});
