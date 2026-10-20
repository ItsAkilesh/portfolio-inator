/**
 * File: IconCloud.tsx
 * Purpose: Decorative rotating polyhedron of brand icons: one vertex per icon, white edges between
 *          neighboring vertices. Receives icon keys, so any section can reuse it; the home hero feeds it
 *          every tool from the "What I do" groups.
 * Author: Akilesh
 * Date: 2026-10-20
 */
import { useMemo, useRef } from "react";
import {
  CLOUD_EDGE_ATTR,
  CLOUD_ITEM_ATTR,
  CLOUD_ORIGIN_ATTR,
  useIconCloud,
} from "../../hooks/useIconCloud";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { BrandIcon } from "../../icons/BrandIcon";
import type { IconKey } from "../../icons/registry";
import { fibonacciSphere, neighborEdges } from "../../lib/sphere";
import styles from "./IconCloud.module.css";

const ICON_SIZE = 24;

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
  const keys = useMemo(() => uniqueIcons(icons), [icons]);
  const points = useMemo(() => fibonacciSphere(keys.length), [keys.length]);
  const edges = useMemo(() => neighborEdges(points), [points]);
  useIconCloud(containerRef, points, edges, !isReduced);
  return (
    <div
      ref={containerRef}
      className={`${styles.cloud} ${className ?? ""}`}
      aria-hidden="true"
    >
      <svg className={styles.edges} focusable="false">
        <g {...{ [CLOUD_ORIGIN_ATTR]: "" }}>
          {edges.map(([from, to]) => (
            <line key={`${from}-${to}`} {...{ [CLOUD_EDGE_ATTR]: "" }} />
          ))}
        </g>
      </svg>
      {keys.map((key) => (
        <span key={key} className={styles.item} {...{ [CLOUD_ITEM_ATTR]: "" }}>
          <BrandIcon name={key} size={ICON_SIZE} />
        </span>
      ))}
    </div>
  );
}
