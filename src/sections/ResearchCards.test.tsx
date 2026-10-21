/**
 * File: ResearchCards.test.tsx
 * Purpose: Tests that the research-profile cards render config numbers and link to the profiles.
 * Author: Akilesh
 * Date: 2026-10-20
 */
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { researchProfiles, ui } from "../portfolio";
import { profileCards, ResearchCards } from "./ResearchCards";

describe("profileCards", () => {
  it("builds one card per profile with three stats each", () => {
    const cards = profileCards();
    expect(cards.map((card) => card.icon)).toEqual([
      "googlescholar",
      "researchgate",
    ]);
    cards.forEach((card) => expect(card.stats).toHaveLength(3));
  });
  it("uses the merged config numbers", () => {
    const [scholar, gate] = profileCards();
    expect(scholar?.stats[0]?.value).toBe(researchProfiles.scholar.citations);
    expect(gate?.stats[0]?.value).toBe(
      researchProfiles.researchGate.interestScore,
    );
  });
});

describe("ResearchCards", () => {
  it("links each card to its profile", () => {
    render(<ResearchCards />);
    const scholar = screen.getByRole("link", {
      name: new RegExp(ui.researchCards.scholar),
    });
    const gate = screen.getByRole("link", {
      name: new RegExp(ui.researchCards.researchGate),
    });
    expect(scholar.getAttribute("href")).toBe(
      researchProfiles.scholar.profileUrl,
    );
    expect(gate.getAttribute("href")).toBe(
      researchProfiles.researchGate.profileUrl,
    );
  });
  it("shows labels and values", () => {
    render(<ResearchCards />);
    expect(screen.getAllByText(ui.researchCards.citations)).toHaveLength(2);
    expect(
      screen.getByText(String(researchProfiles.researchGate.interestScore)),
    ).toBeTruthy();
  });
});
