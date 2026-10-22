/**
 * File: SchemaField.test.tsx
 * Purpose: Tests that generated forms render the right editors and report edits by path.
 * Author: Akilesh
 * Date: 2026-10-21 (updated 2026-10-22)
 */
import { fireEvent, render, screen, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import type { Path } from "../paths";
import { FormContext, type FormContextValue } from "./FormContext";
import { SchemaField } from "./SchemaField";

/* Generated fields read the focus target from the URL, so they render inside a router. */
const renderInRouter = (ui: ReactNode) =>
  render(<MemoryRouter>{ui}</MemoryRouter>);

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
  renderInRouter(
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

  it("adds, removes, duplicates and reorders list items", () => {
    const onChange = renderForm();
    const tags = screen.getByRole("region", { name: "Tags" });
    fireEvent.click(within(tags).getByRole("button", { name: "Add tag" }));
    expect(onChange).toHaveBeenLastCalledWith(["tags"], ["a", "b", ""]);
    fireEvent.click(
      within(tags).getByRole("button", { name: "Move Tag 1 down" }),
    );
    expect(onChange).toHaveBeenLastCalledWith(["tags"], ["b", "a"]);
    fireEvent.click(within(tags).getByRole("button", { name: "Remove Tag 2" }));
    expect(onChange).toHaveBeenLastCalledWith(["tags"], ["a"]);
    fireEvent.click(
      within(tags).getByRole("button", { name: "Duplicate Tag 1" }),
    );
    expect(onChange).toHaveBeenLastCalledWith(["tags"], ["a", "a", "b"]);
    expect(
      (
        within(tags).getByRole("button", {
          name: "Move Tag 1 up",
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true);
  });

  it("reorders by dragging an item by its handle onto another", () => {
    const onChange = renderForm();
    const tags = screen.getByRole("region", { name: "Tags" });
    const handles = tags.querySelectorAll<HTMLElement>(
      "[title='Drag to reorder']",
    );
    const first = tags.querySelector<HTMLElement>(
      "[data-path='tags.0']",
    ) as HTMLElement;
    const data = new Map<string, string>();
    const dataTransfer = {
      setData: (k: string, v: string) => data.set(k, v),
      getData: (k: string) => data.get(k) ?? "",
      get types() {
        return [...data.keys()];
      },
      effectAllowed: "",
    };
    expect(handles[1]?.getAttribute("draggable")).toBe("true");
    fireEvent.dragStart(handles[1] as HTMLElement, { dataTransfer });
    fireEvent.dragOver(first, { dataTransfer });
    expect(first.getAttribute("data-drop")).toBe("before");
    fireEvent.drop(first, { dataTransfer });
    expect(onChange).toHaveBeenLastCalledWith(["tags"], ["b", "a"]);
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
    renderInRouter(
      <FormContext.Provider value={context}>
        <SchemaField schema={recordSchema} path={[]} label="Root" />
      </FormContext.Provider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "python" }));
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

describe("nested list items", () => {
  const link = z
    .object({ label: z.string().meta({ title: "Label" }) })
    .meta({ title: "Link", summaryKey: "label" });
  const text = z
    .object({
      type: z.literal("text"),
      heading: z.string().meta({ title: "Heading" }),
      links: z.array(link).meta({ title: "Links" }),
    })
    .meta({ title: "Text", description: "Some text" });
  const image = z
    .object({ type: z.literal("image"), src: z.string() })
    .meta({ title: "Image" });
  const pageSchema = z.object({
    blocks: z
      .array(
        z.discriminatedUnion("type", [text, image]).meta({ title: "Block" }),
      )
      .meta({ title: "Blocks" }),
  });
  const root = {
    blocks: [
      { type: "text", heading: "Hello", links: [{ label: "Docs" }] },
      { type: "image", src: "a.png" },
    ],
  };

  function renderPage() {
    const onChange = vi.fn<(path: Path, value: unknown) => void>();
    const { container } = renderInRouter(
      <FormContext.Provider
        value={{
          root,
          onChange,
          issues: new Map(),
          images: [],
          uploadImage: async () => null,
          Field: SchemaField,
        }}
      >
        <SchemaField schema={pageSchema} path={[]} label="Page" isBare />
      </FormContext.Provider>,
    );
    return { container, onChange };
  }
  const openFirst = (container: HTMLElement) => {
    const first = container.querySelector<HTMLElement>(
      "[data-item]",
    ) as HTMLElement;
    fireEvent.click(first.querySelector("[data-summary]") as HTMLElement);
    return first;
  };

  it("renders items closed, then shows fields, kind and depth when opened", () => {
    const { container } = renderPage();
    expect(screen.queryByLabelText("Heading")).toBeNull();
    const first = openFirst(container);
    expect(first.dataset.depth).toBe("0");
    expect(screen.getByLabelText("Heading")).toBeTruthy();
    const inner = first.querySelector("[data-item]");
    expect((inner as HTMLElement).dataset.depth).toBe("1");
    expect(within(first).getAllByText("Block").length).toBeGreaterThan(0);
    expect(within(inner as HTMLElement).getByText("Link")).toBeTruthy();
    expect(
      screen.getByRole("region", { name: "Blocks" }).textContent,
    ).toContain("2");
  });

  it("does not offer to change a listed block's type, and adds blocks from a palette", () => {
    const { container, onChange } = renderPage();
    openFirst(container);
    expect(screen.queryByLabelText("Type")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Add block" }));
    const palette = screen.getByRole("list", { name: "Block types" });
    fireEvent.click(within(palette).getByRole("button", { name: /Image/ }));
    expect(onChange).toHaveBeenLastCalledWith(
      ["blocks"],
      [...root.blocks, { type: "image", src: "" }],
    );
  });

  it("inserts a block between others", () => {
    const { onChange } = renderPage();
    fireEvent.click(
      screen.getByRole("button", { name: "Insert a block here" }),
    );
    fireEvent.click(
      within(screen.getByRole("list", { name: "Block types" })).getByRole(
        "button",
        { name: /Image/ },
      ),
    );
    expect(onChange).toHaveBeenLastCalledWith(
      ["blocks"],
      [root.blocks[0], { type: "image", src: "" }, root.blocks[1]],
    );
  });

  it("keeps item controls outside the toggle and opens items from it", () => {
    const { container, onChange } = renderPage();
    const first = container.querySelector<HTMLElement>(
      "[data-item]",
    ) as HTMLElement;
    const toggle = first.querySelector("[data-summary]") as HTMLElement;
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    expect(within(toggle).queryAllByRole("button")).toHaveLength(0);
    fireEvent.click(
      within(first).getAllByRole("button", {
        name: /^Remove/,
      })[0] as HTMLElement,
    );
    expect(onChange).toHaveBeenCalledWith(["blocks"], [root.blocks[1]]);
    fireEvent.click(toggle);
    expect(toggle.getAttribute("aria-expanded")).toBe("true");
    expect(
      document.getElementById(toggle.getAttribute("aria-controls") ?? ""),
    ).toBeTruthy();
  });
});
