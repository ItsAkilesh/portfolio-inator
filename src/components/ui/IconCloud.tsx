/**
 * File: IconCloud.tsx
 * Purpose: Decorative rotating glass polyhedron of brand icons: one vertex per icon, white edges between
 *          neighbors, translucent reflective faces, inside a frosted glass sphere. Receives icon keys, so
 *          any section can reuse it; the home hero feeds it every tool from the "What I do" groups.
 * Author: Akilesh
 * Date: 2026-10-20
 */
import { useId, useMemo, useRef } from "react";
import {
  CLOUD_EDGE_ATTR,
  CLOUD_FACE_ATTR,
  CLOUD_ITEM_ATTR,
  CLOUD_ORIGIN_ATTR,
  useIconCloud,
  type CloudMesh,
} from "../../hooks/useIconCloud";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { BrandIcon } from "../../icons/BrandIcon";
import type { IconKey } from "../../icons/registry";
import {
  fibonacciSphere,
  neighborEdges,
  triangleFaces,
} from "../../lib/sphere";
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

/** Vertices, edges and faces for a polyhedron with `count` vertices. */
export function buildMesh(count: number): CloudMesh {
  const points = fibonacciSphere(count);
  const edges = neighborEdges(points);
  return { points, edges, faces: triangleFaces(edges, points.length) };
}

function MeshLayer({ mesh }: { readonly mesh: CloudMesh }) {
  const gradientId = useId();
  return (
    <svg className={styles.mesh} focusable="false">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="1" />
          <stop offset="0.55" stopColor="#fff" stopOpacity="0.35" />
          <stop offset="1" stopColor="#fff" stopOpacity="0.05" />
        </linearGradient>
      </defs>
      <g {...{ [CLOUD_ORIGIN_ATTR]: "" }}>
        <g fill={`url(#${gradientId})`} stroke="none">
          {mesh.faces.map((face) => (
            <polygon key={face.join("-")} {...{ [CLOUD_FACE_ATTR]: "" }} />
          ))}
        </g>
        <g className={styles.edges}>
          {mesh.edges.map(([from, to]) => (
            <line key={`${from}-${to}`} {...{ [CLOUD_EDGE_ATTR]: "" }} />
          ))}
        </g>
      </g>
    </svg>
  );
}

export function IconCloud({ icons, className }: IconCloudProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isReduced = useReducedMotion();
  const keys = useMemo(() => uniqueIcons(icons), [icons]);
  const mesh = useMemo(() => buildMesh(keys.length), [keys.length]);
  useIconCloud(containerRef, mesh, !isReduced);
  return (
    <div
      ref={containerRef}
      className={`${styles.cloud} ${className ?? ""}`}
      aria-hidden="true"
    >
      {keys.length > 0 && <div className={styles.glass} />}
      <MeshLayer mesh={mesh} />
      {keys.map((key) => (
        <span key={key} className={styles.item} {...{ [CLOUD_ITEM_ATTR]: "" }}>
          <BrandIcon name={key} size={ICON_SIZE} />
        </span>
      ))}
    </div>
  );
}
