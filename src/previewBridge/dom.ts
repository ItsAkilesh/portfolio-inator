/**
 * File: dom.ts
 * Purpose: DOM side of the preview bridge: find a page's block, scroll it into view with a brief
 *          outline, and turn click-to-edit on and off (outlines on hover, clicks reported, not followed).
 * Author: Akilesh
 * Date: 2026-10-21
 */
const EDIT_ATTR = "adminEdit";
const FLASH_ATTR = "data-admin-flash";
const FLASH_MS = 1400;
const STYLE_ID = "admin-preview-style";
const STYLE = `
html[data-admin-edit] .block-slot > * { cursor: pointer; }
html[data-admin-edit] .block-slot > *:hover, [${FLASH_ATTR}] { outline: 3px solid #3b82f6; outline-offset: -3px; }
`;

export const currentPageId = (): string | null =>
  document.querySelector<HTMLElement>("[data-page]")?.dataset.page ?? null;

function blockElement(pageId: string, index: number): HTMLElement | null {
  const page = [...document.querySelectorAll<HTMLElement>("[data-page]")].find(
    (el) => el.dataset.page === pageId,
  );
  const slot = page?.querySelector<HTMLElement>(
    `:scope > [data-block-index="${index}"]`,
  );
  return (slot?.firstElementChild as HTMLElement | null) ?? null;
}

function ensureStyle(): void {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = STYLE;
  document.head.appendChild(style);
}

export function revealBlock(pageId: string, index: number): void {
  const element = blockElement(pageId, index);
  if (!element) return;
  ensureStyle();
  element.scrollIntoView({ behavior: "smooth", block: "start" });
  element.setAttribute(FLASH_ATTR, "");
  setTimeout(() => element.removeAttribute(FLASH_ATTR), FLASH_MS);
}

export function setEditMode(isOn: boolean): void {
  ensureStyle();
  if (isOn) document.documentElement.dataset[EDIT_ATTR] = "";
  else delete document.documentElement.dataset[EDIT_ATTR];
}

/** The page block a click landed in while click-to-edit is on. */
export function blockFromEvent(
  event: MouseEvent,
): { pageId: string; blockIndex: number } | null {
  if (!(EDIT_ATTR in document.documentElement.dataset)) return null;
  const target = event.target instanceof Element ? event.target : null;
  const slot = target?.closest<HTMLElement>("[data-block-index]");
  const page = slot?.closest<HTMLElement>("[data-page]");
  if (!slot || !page?.dataset.page) return null;
  return {
    pageId: page.dataset.page,
    blockIndex: Number(slot.dataset.blockIndex),
  };
}
