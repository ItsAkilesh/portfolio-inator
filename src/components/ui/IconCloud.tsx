/**
 * File: IconCloud.tsx
 * Purpose: Decorative rotating sphere of brand icons. Receives icon keys, so any section can reuse it;
 *          the home hero feeds it every tool from the "What I do" groups.
 * Author: Akilesh
 * Date: 2026-10-20
 */
import { useRef } from "react";
import { useIconCloud } from "../../hooks/useIconCloud";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { BrandIcon } from "../../icons/BrandIcon";
import type { IconKey } from "../../icons/registry";
import styles from "./IconCloud.module.css";

const ICON_SIZE = 26;

interface IconCloudProps {
  readonly icons: readonly IconKey[];
  readonly className?: string;
}

/** Unique icon keys in first-seen order. */
export const uniqueIcons = (icons: readonly IconKey[]): IconKey[] => [
  ...new Set(icons),
];

export function IconCloud({ icons, className }: IconCloudProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isReduced = useReducedMotion();
  const keys = uniqueIcons(icons);
  useIconCloud(containerRef, keys.length, !isReduced);
  return (
    <div
      ref={containerRef}
      className={`${styles.cloud} ${className ?? ""}`}
      aria-hidden="true"
    >
      {keys.map((key) => (
        <span key={key} className={styles.item}>
          <BrandIcon name={key} size={ICON_SIZE} />
        </span>
      ))}
    </div>
  );
}
