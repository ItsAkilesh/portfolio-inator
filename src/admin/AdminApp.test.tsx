/**
 * File: AdminApp.test.tsx
 * Purpose: Integration test of the admin console with a mocked dev server: it loads the content,
 *          renders generated sections, and saves edits with the loaded version.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import rawContent from "../content/portfolio.json";
import AdminApp from "./AdminApp";

type Call = { url: string; init?: RequestInit };

function mockServer() {
  const calls: Call[] = [];
  /* Only fetch is replaced; the setup file's other browser stubs stay in place. */
  vi.spyOn(globalThis, "fetch").mockImplementation(async (input, init) => {
    const url = String(input);
    calls.push({ url, init });
    const body = url.endsWith("/images")
      ? { images: ["cmu.webp"] }
      : init?.method === "PUT"
        ? { version: "v2" }
        : { content: rawContent, version: "v1" };
    return new Response(JSON.stringify(body), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  });
  return calls;
}

const renderAdmin = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="admin/*" element={<AdminApp />} />
      </Routes>
    </MemoryRouter>,
  );

afterEach(() => vi.restoreAllMocks());

describe("AdminApp", () => {
  it("loads the content and renders the chosen section", async () => {
    mockServer();
    renderAdmin("/admin/profile");
    const name = (await screen.findByLabelText(
      "Full name",
    )) as HTMLInputElement;
    expect(name.value).toBe(rawContent.site.profile.title);
    expect(
      screen.getByRole("navigation", { name: "Admin sections" }),
    ).toBeTruthy();
  });

  it("saves an edit with the version it loaded", async () => {
    const calls = mockServer();
    renderAdmin("/admin/profile");
    fireEvent.change(await screen.findByLabelText("Nickname"), {
      target: { value: "New" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() =>
      expect(calls.some((c) => c.init?.method === "PUT")).toBe(true),
    );
    const put = calls.find((c) => c.init?.method === "PUT");
    const body = JSON.parse(String(put?.init?.body)) as {
      baseVersion: string;
      content: typeof rawContent;
    };
    expect(body.baseVersion).toBe("v1");
    expect(body.content.site.profile.nickname).toBe("New");
    expect(await screen.findByText(/Saved to portfolio.json/)).toBeTruthy();
  });

  it("blocks saving invalid content", async () => {
    mockServer();
    renderAdmin("/admin/seo");
    fireEvent.change(await screen.findByLabelText("Site address"), {
      target: { value: "not a url" },
    });
    const save = screen.getByRole("button", {
      name: "Save",
    }) as HTMLButtonElement;
    await waitFor(() => expect(save.disabled).toBe(true));
    expect(await screen.findByText(/1 problem/)).toBeTruthy();
  });
});
