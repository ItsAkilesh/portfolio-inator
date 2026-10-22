/**
 * File: PreviewBridge.tsx
 * Purpose: Dev-only helper mounted when the site runs inside the admin console's preview frame. It
 *          answers the console's messages (reveal a block, light/dark, a draft palette, click-to-edit)
 *          and reports block clicks back. Only same-origin messages from the parent window count.
 *          main.tsx loads it with import.meta.env.DEV, so builds contain none of it.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { theme } from "../portfolio";
import { applyTheme } from "../theme/cssVars";
import type { ColorMode, Palette } from "../types/theme";
import { asToSite, type ToAdmin, type ToSite } from "./protocol";
import { blockFromEvent, currentPageId, revealBlock, setEditMode } from "./dom";

let paletteOverride: Palette | null = null;

const post = (message: ToAdmin) =>
  window.parent.postMessage(message, window.location.origin);

function currentMode(): ColorMode {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function applyPreviewTheme(mode: ColorMode): void {
  const config = paletteOverride
    ? {
        ...theme,
        activePalette: "__preview",
        palettes: { ...theme.palettes, __preview: paletteOverride },
      }
    : theme;
  applyTheme(document.documentElement, config, mode);
}

function handle(message: ToSite): void {
  switch (message.type) {
    case "portfolio-admin:reveal":
      revealBlock(message.pageId, message.blockIndex);
      break;
    case "portfolio-admin:mode":
      applyPreviewTheme(message.mode);
      break;
    case "portfolio-admin:palette":
      paletteOverride = message.palette;
      applyPreviewTheme(currentMode());
      break;
    case "portfolio-admin:edit-mode":
      setEditMode(message.isOn);
      break;
  }
}

export default function PreviewBridge() {
  const { pathname } = useLocation();
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (
        event.origin !== window.location.origin ||
        event.source !== window.parent
      )
        return;
      const message = asToSite(event.data);
      if (message) handle(message);
    };
    const onClick = (event: MouseEvent) => {
      const hit = blockFromEvent(event);
      if (!hit) return;
      event.preventDefault();
      event.stopPropagation();
      post({ type: "portfolio-admin:edit", ...hit });
    };
    window.addEventListener("message", onMessage);
    document.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener("message", onMessage);
      document.removeEventListener("click", onClick, true);
    };
  }, []);
  useEffect(() => {
    const frame = requestAnimationFrame(() =>
      post({ type: "portfolio-admin:ready", pageId: currentPageId() }),
    );
    return () => cancelAnimationFrame(frame);
  }, [pathname]);
  return null;
}
