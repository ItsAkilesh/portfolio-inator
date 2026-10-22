/**
 * File: dates.ts
 * Purpose: Partial dates used in the content ("2025", "2025-08" or "2025-08-14"; day and month are
 *          optional) and date ranges: parsing, validation, ordering and locale-aware display.
 *          Pure functions shared by the content schema, the site and the admin date picker.
 * Author: Akilesh
 * Date: 2026-10-21
 */

/** "" (no date), YYYY, YYYY-MM or YYYY-MM-DD. */
const DATE_PATTERN = /^(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?$/;
export const PRESENT = "present";
const MONTHS_IN_YEAR = 12;
const MIN_YEAR = 1900;
const MAX_YEAR = 2200;

export interface PartialDate {
  readonly year: number;
  /** 1 to 12, or undefined when only the year is known. */
  readonly month?: number;
  /** 1 to 31, or undefined when the day is not given. */
  readonly day?: number;
}

export interface DateRange {
  /** Text before the dates, e.g. "Filed"; empty for none. */
  readonly label: string;
  readonly start: string;
  /** "" for a single date, "present" for ongoing, or a date. */
  readonly end: string;
  readonly isEndExpected: boolean;
}

export interface DateLabels {
  readonly locale: string;
  readonly present: string;
  readonly expected: string;
}

export const daysInMonth = (year: number, month: number): number =>
  new Date(Date.UTC(year, month, 0)).getUTCDate();

/** The parts of a date string, or null when it is empty or malformed (including 2025-02-30). */
export function parseDate(value: string): PartialDate | null {
  const match = DATE_PATTERN.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = match[2] === undefined ? undefined : Number(match[2]);
  const day = match[3] === undefined ? undefined : Number(match[3]);
  if (year < MIN_YEAR || year > MAX_YEAR) return null;
  if (month !== undefined && (month < 1 || month > MONTHS_IN_YEAR)) return null;
  if (day !== undefined && month !== undefined)
    if (day < 1 || day > daysInMonth(year, month)) return null;
  return { year, month, day };
}

const pad = (n: number): string => String(n).padStart(2, "0");

/** Back to the stored form; a day without a month is dropped. */
export function formatDateValue(date: PartialDate): string {
  if (date.month === undefined) return String(date.year);
  const ym = `${date.year}-${pad(date.month)}`;
  return date.day === undefined ? ym : `${ym}-${pad(date.day)}`;
}

/** Sort key: missing parts count as the start of the period. */
export const dateKey = (date: PartialDate): number =>
  date.year * 10000 + (date.month ?? 0) * 100 + (date.day ?? 0);

/** True when `end` (a date or "present") is not before `start`; empty values always pass. */
export function isOrdered(start: string, end: string): boolean {
  const from = parseDate(start);
  const to = parseDate(end);
  return !from || !to || dateKey(to) >= dateKey(from);
}

const FORMATS = {
  year: { year: "numeric", timeZone: "UTC" },
  month: { year: "numeric", month: "short", timeZone: "UTC" },
  day: { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" },
} as const satisfies Record<string, Intl.DateTimeFormatOptions>;

/** "2025", "Aug 2025" or "Aug 14, 2025" in the given locale; "" for an empty or invalid value. */
export function displayDate(value: string, locale: string): string {
  const date = parseDate(value);
  if (!date) return "";
  const format =
    date.month === undefined
      ? FORMATS.year
      : date.day === undefined
        ? FORMATS.month
        : FORMATS.day;
  const instant = Date.UTC(date.year, (date.month ?? 1) - 1, date.day ?? 1);
  try {
    return new Intl.DateTimeFormat(locale, format).format(instant);
  } catch {
    return new Intl.DateTimeFormat("en-US", format).format(instant);
  }
}

function displayEnd(range: DateRange, labels: DateLabels): string {
  if (range.end === PRESENT) return labels.present;
  const end = displayDate(range.end, labels.locale);
  return end && range.isEndExpected ? `${end} (${labels.expected})` : end;
}

/** "Filed Oct 14, 2025", "Aug 2025 - Present", "2021 - 2026"; "" when there is no start date. */
export function displayRange(range: DateRange, labels: DateLabels): string {
  const start = displayDate(range.start, labels.locale);
  if (!start) return "";
  const end = displayEnd(range, labels);
  const span = end && end !== start ? `${start} - ${end}` : start;
  return range.label ? `${range.label} ${span}` : span;
}

/** Machine-readable value for <time dateTime>: the start date, as stored. */
export const machineDate = (range: DateRange): string =>
  parseDate(range.start) ? range.start : "";
