/**
 * File: ContactPanel.test.tsx
 * Purpose: Tests for the contact panel: shared fit size and the social grid.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { socialLinks } from "../portfolio";
import { ContactPanel, contactFitChars } from "./ContactPanel";

describe("contactFitChars", () => {
  it("fits the email plus its arrow when that is the longest line", () => {
    expect(contactFitChars("a@b.co", "+1")).toBe(8);
  });
  it("fits the phone when it is longer", () => {
    expect(contactFitChars("a@b", "+1 555 000 0000")).toBe(15);
  });
  it("never returns zero", () => {
    expect(contactFitChars("", "")).toBe(2);
  });
});

const EMAIL = "someone@example.com";

describe("ContactPanel", () => {
  it("links the email, the phone and every social profile", () => {
    render(
      <MemoryRouter>
        <ContactPanel email={EMAIL} phone="+1 555 000 0000" />
      </MemoryRouter>,
    );
    const email = EMAIL;
    expect(
      screen
        .getByRole("link", { name: new RegExp(email) })
        .getAttribute("href"),
    ).toBe(`mailto:${email}`);
    expect(
      screen.getByRole("list", { name: "Social links" }).children,
    ).toHaveLength(socialLinks.length);
  });
});
