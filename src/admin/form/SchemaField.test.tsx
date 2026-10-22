/**
 * File: SchemaField.test.tsx
 * Purpose: Tests that generated forms render the right editors and report edits by path.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import type { Path } from "../paths";
import { FormContext, type FormContextValue } from "./FormContext";
import { SchemaField } from "./SchemaField";

const schema = z.object({
  name: z.string().meta({ title: "Name", description: "Shown in the header" }),
  bio: z.string().meta({ title: "Bio", widget: "multiline" }),
  count: z.number().meta({ title: "Count" }),
  isOn: z.boolean().meta({ title: "Enabled" }),
  mode: z.enum(["light", "dark"]).meta({ title: "Mode" }),
  tags: z.array(z.string().meta({ title: "Tag" })).meta({ title: "Tags" }),
});

const VALUE = {
  name: "Ada",
  bio: "Hi",
  count: 2,
  isOn: true,
  mode: "dark",
  tags: ["a", "b"],
};

function renderForm(overrides: Partial<FormContextValue> = {}) {
  const onChange = vi.fn<(path: Path, value: unknown) => void>();
  const context: FormContextValue = {
    root: VALUE,
    onChange,
    issues: new Map([["name", ["Too short"]]]),
    images: [],
    uploadImage: async () => null,
    Field: SchemaField,
    ...overrides,
  };
  render(
    <FormContext.Provider value={context}>
      <SchemaField schema={schema} path={[]} label="Person" />
    </FormContext.Provider>,
  );
  return onChange;
}

describe("SchemaField", () => {
  it("renders an editor per field with labels, help and errors", () => {
    renderForm();
    expect((screen.getByLabelText("Name") as HTMLInputElement).value).toBe(
      "Ada",
    );
    expect(screen.getByLabelText("Bio").tagName).toBe("TEXTAREA");
    expect((screen.getByLabelText("Enabled") as HTMLInputElement).checked).toBe(
      true,
    );
    expect((screen.getByLabelText("Mode") as HTMLSelectElement).value).toBe(
      "dark",
    );
    expect(screen.getByText("Shown in the header")).toBeTruthy();
    expect(screen.getByRole("alert").textContent).toBe("Too short");
  });

  it("reports edits with the field's path", () => {
    const onChange = renderForm();
    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Grace" },
    });
    fireEvent.change(screen.getByLabelText("Count"), {
      target: { value: "7" },
    });
    fireEvent.click(screen.getByLabelText("Enabled"));
    expect(onChange).toHaveBeenCalledWith(["name"], "Grace");
    expect(onChange).toHaveBeenCalledWith(["count"], 7);
    expect(onChange).toHaveBeenCalledWith(["isOn"], false);
  });

  it("adds, removes and reorders list items", () => {
    const onChange = renderForm();
    const tags = screen.getByRole("group", { name: "Tags" });
    fireEvent.click(within(tags).getByRole("button", { name: "Add" }));
    expect(onChange).toHaveBeenLastCalledWith(["tags"], ["a", "b", ""]);
    fireEvent.click(
      within(tags).getAllByRole("button", {
        name: "Move down",
      })[0] as HTMLElement,
    );
    expect(onChange).toHaveBeenLastCalledWith(["tags"], ["b", "a"]);
    fireEvent.click(
      within(tags).getAllByRole("button", { name: "Remove" })[1] as HTMLElement,
    );
    expect(onChange).toHaveBeenLastCalledWith(["tags"], ["a"]);
  });
});

describe("record and union editors", () => {
  const recordSchema = z.object({
    icons: z
      .record(z.string(), z.enum(["a", "b"]).meta({ title: "Icon" }))
      .meta({ title: "Icons" }),
  });

  it("renames, adds and removes named entries", () => {
    const onChange = vi.fn<(path: Path, value: unknown) => void>();
    const context: FormContextValue = {
      root: { icons: { python: "a" } },
      onChange,
      issues: new Map(),
      images: [],
      uploadImage: async () => null,
      Field: SchemaField,
    };
    render(
      <FormContext.Provider value={context}>
        <SchemaField schema={recordSchema} path={[]} label="Root" />
      </FormContext.Provider>,
    );
    const name = screen.getByLabelText("Name");
    fireEvent.change(name, { target: { value: "rust" } });
    fireEvent.blur(name);
    expect(onChange).toHaveBeenLastCalledWith(["icons"], { rust: "a" });
    fireEvent.click(screen.getByRole("button", { name: "Add" }));
    expect(onChange).toHaveBeenLastCalledWith(["icons"], {
      python: "a",
      "new-2": "a",
    });
    fireEvent.click(screen.getByRole("button", { name: "Remove python" }));
    expect(onChange).toHaveBeenLastCalledWith(["icons"], {});
  });
});
