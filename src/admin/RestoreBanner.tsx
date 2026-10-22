/**
 * File: RestoreBanner.tsx
 * Purpose: Offers to restore unsaved edits this browser kept from an earlier visit.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import { useAdmin } from "./AdminContext";
import ui from "./ui.module.css";

const timeOf = (iso: string): string => {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "earlier" : date.toLocaleString();
};

export function RestoreBanner() {
  const offer = useAdmin().content.restoreOffer;
  if (!offer) return null;
  return (
    <div className={ui.banner} role="region" aria-label="Unsaved edits found">
      <p>
        Unsaved edits from {timeOf(offer.savedAt)} were found in this browser.
        {offer.isStale &&
          " The file has changed since; restoring may undo those changes, so review before saving."}
      </p>
      <span className={ui.actions}>
        <button type="button" className={ui.primary} onClick={offer.accept}>
          Restore
        </button>
        <button type="button" className={ui.secondary} onClick={offer.dismiss}>
          Discard
        </button>
      </span>
    </div>
  );
}
