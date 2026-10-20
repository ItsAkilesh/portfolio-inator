/**
 * File: BrandIcon.tsx
 * Purpose: Renders a registry icon in the current text color; exposes the brand color as --brand for hover states.
 * Author: Akilesh
 * Date: 2026-10-20
 */
import type { CSSProperties } from "react";
import { brandColorFor } from "../lib/color";
import { getIcon, type IconKey } from "./registry";

const DEFAULT_SIZE = 20;

interface BrandIconProps {
  readonly name: IconKey;
  readonly size?: number;
  readonly className?: string;
}

export function BrandIcon({
  name,
  size = DEFAULT_SIZE,
  className,
}: BrandIconProps) {
  const icon = getIcon(name);
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path d={icon.path} fill="currentColor" />
    </svg>
  );
}

/** Inline style that hands an icon's brand color to CSS hover rules via var(--brand). */
export const brandStyle = (name: IconKey): CSSProperties =>
  ({ "--brand": brandColorFor(getIcon(name).hex) }) as CSSProperties;
