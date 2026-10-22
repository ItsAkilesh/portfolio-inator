/**
 * File: Combobox.test.tsx
 * Purpose: Tests for the searchable dropdown: filtering, mouse and keyboard selection, and closing.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Combobox } from "./Combobox";
import { filterOptions, type ComboOption } from "./useCombobox";

const OPTIONS: readonly ComboOption[] = [
  { value: "github", label: "GitHub" },
  { value: "gitlab", label: "GitLab" },
  { value: "linkedin", label: "LinkedIn" },
];

describe("filterOptions", () => {
  it("returns everything for an empty query or the current value", () => {
    expect(filterOptions(OPTIONS, "", "github")).toHaveLength(3);
    expect(filterOptions(OPTIONS, "github", "github")).toHaveLength(3);
  });
  it("matches labels and values case-insensitively", () => {
    expect(filterOptions(OPTIONS, "GIT", "").map((o) => o.value)).toEqual([
      "github",
      "gitlab",
    ]);
    expect(filterOptions(OPTIONS, "in", "")[0]?.value).toBe("linkedin");
  });
  it("returns nothing when nothing matches", () => {
    expect(filterOptions(OPTIONS, "zzz", "")).toEqual([]);
  });
});

function renderCombo(value = "github") {
  const onChange = vi.fn<(value: string) => void>();
  render(
    <>
      <label htmlFor="c">Icon</label>
      <Combobox id="c" value={value} options={OPTIONS} onChange={onChange} />
      <button type="button">outside</button>
    </>,
  );
  return { onChange, input: screen.getByRole("combobox", { name: "Icon" }) };
}

describe("Combobox", () => {
  it("opens on focus with every option and picks one with the pointer", () => {
    const { onChange, input } = renderCombo();
    fireEvent.focus(input);
    expect(screen.getAllByRole("option")).toHaveLength(3);
    fireEvent.pointerDown(screen.getByRole("option", { name: "LinkedIn" }));
    expect(onChange).toHaveBeenCalledWith("linkedin");
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("filters while typing and picks with the keyboard", () => {
    const { onChange, input } = renderCombo();
    fireEvent.change(input, { target: { value: "git" } });
    expect(screen.getAllByRole("option")).toHaveLength(2);
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onChange).toHaveBeenCalledWith("gitlab");
  });

  it("shows an empty message and restores the value on Escape", () => {
    const { onChange, input } = renderCombo();
    fireEvent.change(input, { target: { value: "zzz" } });
    expect(screen.getByText("No matches")).toBeTruthy();
    fireEvent.keyDown(input, { key: "Escape" });
    expect((input as HTMLInputElement).value).toBe("github");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("closes when clicking outside and toggles from the button", () => {
    const { input } = renderCombo();
    fireEvent.focus(input);
    fireEvent.pointerDown(screen.getByRole("button", { name: "outside" }));
    expect(screen.queryByRole("listbox")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Show all options" }));
    expect(screen.getByRole("listbox")).toBeTruthy();
  });
});
