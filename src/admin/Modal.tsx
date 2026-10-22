/**
 * File: Modal.tsx
 * Purpose: Accessible dialog used by the admin console: labelled, focus moves in on open and back on
 *          close, Escape and the backdrop close it, and Tab stays inside.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import { useEffect, useId, useRef, type ReactNode } from "react";
import ui from "./ui.module.css";
import overlay from "./overlay.module.css";

interface ModalProps {
  readonly title: string;
  readonly onClose: () => void;
  readonly children: ReactNode;
  readonly isWide?: boolean;
}

const FOCUSABLE =
  "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])";

function trapTab(event: KeyboardEvent, root: HTMLElement): void {
  const items = [...root.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
    (el) => !el.hasAttribute("disabled"),
  );
  const first = items[0];
  const last = items[items.length - 1];
  if (!first || !last) return;
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

export function Modal({
  title,
  onClose,
  children,
  isWide = false,
}: ModalProps) {
  const titleId = useId();
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    panel.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      else if (event.key === "Tab" && panel.current)
        trapTab(event, panel.current);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      previous?.focus?.();
    };
  }, [onClose]);
  return (
    <div
      className={overlay.backdrop}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={panel}
        className={overlay.modal}
        data-wide={isWide || undefined}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className={overlay.modalHead}>
          <h2 id={titleId} className={overlay.modalTitle}>
            {title}
          </h2>
          <button type="button" className={ui.secondary} onClick={onClose}>
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
