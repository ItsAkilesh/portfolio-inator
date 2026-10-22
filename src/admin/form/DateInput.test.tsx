/**
 * File: DateInput.test.tsx
 * Purpose: Tests for the date picker: year first, optional month and day, Present, and clearing.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DateInput } from "./DateInput";

function setup(value: string, allowPresent = false) {
  const onChange = vi.fn<(value: string) => void>();
  const view = render(
    <DateInput
      id="d"
      value={value}
      onChange={onChange}
      allowPresent={allowPresent}
    />,
  );
  return { onChange, view };
}

const year = () => screen.getByLabelText("Year") as HTMLInputElement;
const month = () =>
  screen.getByLabelText("Month (optional)") as HTMLSelectElement;
const day = () => screen.getByLabelText("Day (optional)") as HTMLSelectElement;

describe("DateInput", () => {
  it("shows the parts of a stored date", () => {
    setup("2025-08-14");
    expect(year().value).toBe("2025");
    expect(month().value).toBe("8");
    expect(day().value).toBe("14");
  });

  it("stores a year once four digits are typed, and clears when emptied", () => {
    const { onChange } = setup("");
    expect(month().disabled).toBe(true);
    fireEvent.change(year(), { target: { value: "20" } });
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.change(year(), { target: { value: "2021x" } });
    expect(onChange).toHaveBeenLastCalledWith("2021");
    fireEvent.change(year(), { target: { value: "" } });
    expect(onChange).toHaveBeenLastCalledWith("");
  });

  it("adds and removes the month and day", () => {
    const { onChange, view } = setup("2024");
    expect(day().disabled).toBe(true);
    fireEvent.change(month(), { target: { value: "2" } });
    expect(onChange).toHaveBeenLastCalledWith("2024-02");
    view.rerender(<DateInput id="d" value="2024-02" onChange={onChange} />);
    expect(day().options).toHaveLength(30);
    fireEvent.change(day(), { target: { value: "29" } });
    expect(onChange).toHaveBeenLastCalledWith("2024-02-29");
    view.rerender(<DateInput id="d" value="2024-02-29" onChange={onChange} />);
    fireEvent.change(month(), { target: { value: "" } });
    expect(onChange).toHaveBeenLastCalledWith("2024");
  });

  it("drops a day that does not exist in the new month or year", () => {
    const { onChange, view } = setup("2024-01-31");
    fireEvent.change(month(), { target: { value: "2" } });
    expect(onChange).toHaveBeenLastCalledWith("2024-02");
    view.rerender(<DateInput id="d" value="2024-02-29" onChange={onChange} />);
    fireEvent.change(year(), { target: { value: "2023" } });
    expect(onChange).toHaveBeenLastCalledWith("2023-02");
  });

  it("offers Present only when allowed, and disables the parts while set", () => {
    setup("2025");
    expect(screen.queryByLabelText("Present")).toBeNull();
    const { onChange } = setup("present", true);
    const present = screen.getAllByLabelText("Present")[0] as HTMLInputElement;
    expect(present.checked).toBe(true);
    expect(
      (screen.getAllByLabelText("Year")[1] as HTMLInputElement).disabled,
    ).toBe(true);
    fireEvent.click(present);
    expect(onChange).toHaveBeenLastCalledWith("");
  });
});
