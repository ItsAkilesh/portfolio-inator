/**
 * File: DateInput.tsx
 * Purpose: Date picker for content dates: a year, then an optional month and an optional day, plus
 *          "Present" for the end of ongoing ranges. Native date inputs always need a day, so this
 *          uses a year field and two selects. Stores "", YYYY, YYYY-MM, YYYY-MM-DD or "present".
 * Author: Akilesh
 * Date: 2026-10-21
 */
import { useEffect, useState } from "react";
import {
  PRESENT,
  daysInMonth,
  formatDateValue,
  parseDate,
  type PartialDate,
} from "../../lib/dates";
import styles from "./form.module.css";

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;
const YEAR_DIGITS = 4;

interface DateInputProps {
  readonly id: string;
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly allowPresent?: boolean;
}

/** Keeps the day only if it still exists in the new month (no Feb 30). */
function withParts(date: PartialDate, next: Partial<PartialDate>): string {
  const merged = { ...date, ...next };
  if (merged.month === undefined) return String(merged.year);
  const max = daysInMonth(merged.year, merged.month);
  const day =
    merged.day !== undefined && merged.day <= max ? merged.day : undefined;
  return formatDateValue({ ...merged, day });
}

const optionalNumber = (text: string): number | undefined =>
  text === "" ? undefined : Number(text);

function useYearText(value: string, date: PartialDate | null) {
  const year = date?.year;
  const [text, setText] = useState(year === undefined ? "" : String(year));
  /* Follow outside changes (undo, reload); typing a partial year keeps the local text. */
  useEffect(() => {
    if (value === "" || value === PRESENT) setText("");
    else if (year !== undefined) setText(String(year));
  }, [value, year]);
  return [text, setText] as const;
}

function MonthDaySelects({
  date,
  isDisabled,
  onChange,
}: {
  readonly date: PartialDate | null;
  readonly isDisabled: boolean;
  readonly onChange: (value: string) => void;
}) {
  const days = date?.month ? daysInMonth(date.year, date.month) : 0;
  return (
    <>
      <select
        className={styles.input}
        aria-label="Month (optional)"
        disabled={isDisabled || !date}
        value={date?.month ?? ""}
        onChange={(e) =>
          date &&
          onChange(withParts(date, { month: optionalNumber(e.target.value) }))
        }
      >
        <option value="">Month</option>
        {MONTH_NAMES.map((name, i) => (
          <option key={name} value={i + 1}>
            {name}
          </option>
        ))}
      </select>
      <select
        className={styles.input}
        aria-label="Day (optional)"
        disabled={isDisabled || !date?.month}
        value={date?.day ?? ""}
        onChange={(e) =>
          date &&
          onChange(withParts(date, { day: optionalNumber(e.target.value) }))
        }
      >
        <option value="">Day</option>
        {Array.from({ length: days }, (_, i) => (
          <option key={i + 1} value={i + 1}>
            {i + 1}
          </option>
        ))}
      </select>
    </>
  );
}

export function DateInput({
  id,
  value,
  onChange,
  allowPresent,
}: DateInputProps) {
  const isPresent = value === PRESENT;
  const date = isPresent ? null : parseDate(value);
  const [yearText, setYearText] = useYearText(value, date);
  const typeYear = (text: string) => {
    const digits = text.replace(/\D/g, "").slice(0, YEAR_DIGITS);
    setYearText(digits);
    if (digits === "") onChange("");
    else if (digits.length === YEAR_DIGITS && parseDate(digits))
      onChange(date ? withParts(date, { year: Number(digits) }) : digits);
  };
  return (
    <div className={styles.dateRow}>
      <input
        id={id}
        className={`${styles.input} ${styles.year}`}
        inputMode="numeric"
        placeholder="Year"
        aria-label="Year"
        disabled={isPresent}
        value={yearText}
        onChange={(e) => typeYear(e.target.value)}
      />
      <MonthDaySelects date={date} isDisabled={isPresent} onChange={onChange} />
      {allowPresent && (
        <label className={styles.checkLabel}>
          <input
            type="checkbox"
            className={styles.toggle}
            checked={isPresent}
            onChange={(e) => onChange(e.target.checked ? PRESENT : "")}
          />
          Present
        </label>
      )}
    </div>
  );
}
