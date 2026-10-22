/**
 * File: UiIcon.tsx
 * Purpose: Small stroke icons used by the interface itself (theme toggle, arrows).
 * Author: Akilesh
 * Date: 2026-10-20
 */
const UI_PATHS = {
  sun: "M12 7.8a4.2 4.2 0 1 0 0 8.4a4.2 4.2 0 0 0 0-8.4zM12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6",
  moon: "M20.5 13.6A8.5 8.5 0 1 1 10.4 3.5a6.6 6.6 0 0 0 10.1 10.1z",
} as const;

export type UiIconName = keyof typeof UI_PATHS;

const DEFAULT_SIZE = 18;
const STROKE_WIDTH = 1.8;

interface UiIconProps {
  readonly name: UiIconName;
  readonly size?: number;
}

export function UiIcon({ name, size = DEFAULT_SIZE }: UiIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={STROKE_WIDTH}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={UI_PATHS[name]} />
    </svg>
  );
}
