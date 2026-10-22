/**
 * File: usePreviewFrame.ts
 * Purpose: Talks to the site in the preview frame: sends the current mode, draft palette and
 *          click-to-edit state whenever the frame (re)loads, reveals the block being edited, and
 *          turns block clicks in the frame into a jump to that block's fields.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import { useCallback, useEffect, useRef, type RefObject } from "react";
import { asToAdmin, type ToSite } from "../../previewBridge/protocol";
import type { Palette } from "../../types/theme";
import { useFocusField } from "../focus";

export type PreviewMode = "site" | "light" | "dark";

interface FrameState {
  readonly mode: PreviewMode;
  readonly palette: Palette | null;
  readonly isEditMode: boolean;
  /** Page id and block index to reveal, from the field being edited. */
  readonly reveal: {
    readonly pageId: string;
    readonly blockIndex: number;
  } | null;
  readonly pageIds: readonly string[];
}

/** Listens for the frame's "ready" (resync) and block-click messages. */
function useFrameMessages(
  frame: RefObject<HTMLIFrameElement | null>,
  latest: RefObject<FrameState>,
  sync: () => void,
): void {
  const focusField = useFocusField();
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (
        event.origin !== window.location.origin ||
        event.source !== frame.current?.contentWindow
      )
        return;
      const message = asToAdmin(event.data);
      if (message?.type === "portfolio-admin:ready") sync();
      if (message?.type === "portfolio-admin:edit") {
        const pageIndex = latest.current.pageIds.indexOf(message.pageId);
        if (pageIndex >= 0)
          focusField(["pages", pageIndex, "blocks", message.blockIndex]);
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [frame, latest, sync, focusField]);
}

export function usePreviewFrame(state: FrameState) {
  const frame = useRef<HTMLIFrameElement>(null);
  const send = useCallback((message: ToSite) => {
    frame.current?.contentWindow?.postMessage(message, window.location.origin);
  }, []);
  const latest = useRef(state);
  useEffect(() => {
    latest.current = state;
  });
  const sync = useCallback(() => {
    const { mode, palette, isEditMode, reveal } = latest.current;
    send({ type: "portfolio-admin:palette", palette });
    if (mode !== "site") send({ type: "portfolio-admin:mode", mode });
    send({ type: "portfolio-admin:edit-mode", isOn: isEditMode });
    if (reveal) send({ type: "portfolio-admin:reveal", ...reveal });
  }, [send]);
  useEffect(sync, [
    sync,
    state.mode,
    state.palette,
    state.isEditMode,
    state.reveal,
  ]);
  useFrameMessages(frame, latest, sync);
  return frame;
}
