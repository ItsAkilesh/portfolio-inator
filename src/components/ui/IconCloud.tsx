/**
 * File: IconCloud.tsx
 * Purpose: Decorative rotating glass polyhedron of brand icons: one vertex per icon, white edges between
 *          neighbors and frosted reflective faces. Receives icon keys, so
 *          any section can reuse it; the home hero feeds it every tool from the "What I do" groups.
 * Author: Akilesh
 * Date: 2026-10-20
 */
import { useMemo, useRef, type CSSProperties } from "react";
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
import { discSize, iconSize } from "../../lib/cloudSizing";
import type { IconKey } from "../../icons/registry";
import {
  fibonacciSphere,
  neighborEdges,
  triangleFaces,
} from "../../lib/sphere";
import styles from "./IconCloud.module.css";

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

function FaceLayer({ mesh }: { readonly mesh: CloudMesh }) {
  return (
    <div className={styles.faces}>
      {mesh.faces.map((face) => (
        <span
          key={face.join("-")}
          className={styles.face}
          {...{ [CLOUD_FACE_ATTR]: "" }}
        />
      ))}
    </div>
  );
}

function EdgeLayer({ mesh }: { readonly mesh: CloudMesh }) {
  return (
    <svg className={styles.mesh} focusable="false">
      <g className={styles.edges} {...{ [CLOUD_ORIGIN_ATTR]: "" }}>
        {mesh.edges.map(([from, to]) => (
          <line key={`${from}-${to}`} {...{ [CLOUD_EDGE_ATTR]: "" }} />
        ))}
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
  const discStyle = { "--disc": `${discSize(keys.length)}px` } as CSSProperties;
  return (
    <div
      ref={containerRef}
      className={`${styles.cloud} ${className ?? ""}`}
      style={discStyle}
      aria-hidden="true"
    >
      <FaceLayer mesh={mesh} />
      <EdgeLayer mesh={mesh} />
      {keys.map((key) => (
        <span key={key} className={styles.item} {...{ [CLOUD_ITEM_ATTR]: "" }}>
          <BrandIcon name={key} size={iconSize(keys.length)} />
        </span>
      ))}
    </div>
  );
}
