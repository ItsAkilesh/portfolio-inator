/**
 * File: DateText.tsx
 * Purpose: Shows an entry's dates ("Aug 2025 - Present", "Filed Oct 14, 2025") in the site's language
 *          inside a <time> element, so the start date is also machine-readable.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import { displayRange, machineDate, type DateRange } from "../../lib/dates";
import { seo, ui } from "../../portfolio";

const LABELS = {
  locale: seo.language,
  present: ui.present,
  expected: ui.expected,
} as const;

interface DateTextProps {
  readonly dates: DateRange;
  readonly className?: string;
}

export function DateText({ dates, className }: DateTextProps) {
  const text = displayRange(dates, LABELS);
  if (!text) return null;
  const machine = machineDate(dates);
  return (
    <time className={className} dateTime={machine || undefined}>
      {text}
    </time>
  );
}
