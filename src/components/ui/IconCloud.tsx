/**
 * File: IconCloud.tsx
 * Purpose: Decorative rotating glass polyhedron of brand icons: one vertex per icon, white edges between
 *          neighbors and shaded glass faces over one static frosted disc. Receives icon keys, so
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
import { discSize, iconSize, minCloudBox } from "../../lib/cloudSizing";
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

/**
 * Faces and edges share one SVG, so a frame repaints a single layer instead of one clipped,
 * blurred element per face. Faces sit under the edges.
 */
function MeshLayer({ mesh }: { readonly mesh: CloudMesh }) {
  return (
    <svg className={styles.mesh} focusable="false">
      <g {...{ [CLOUD_ORIGIN_ATTR]: "" }}>
        <g className={styles.faces}>
          {mesh.faces.map((face) => (
            <polygon
              key={face.join("-")}
              className={styles.face}
              {...{ [CLOUD_FACE_ATTR]: "" }}
            />
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
  const sizeStyle = {
    "--disc": `${discSize(keys.length)}px`,
    "--cloud-min": `${minCloudBox(keys.length)}px`,
  } as CSSProperties;
  return (
    <div
      ref={containerRef}
      className={`${styles.cloud} ${className ?? ""}`}
      style={sizeStyle}
      aria-hidden="true"
    >
      <span className={styles.frost} />
      <MeshLayer mesh={mesh} />
      {keys.map((key) => (
        <span key={key} className={styles.item} {...{ [CLOUD_ITEM_ATTR]: "" }}>
          <BrandIcon name={key} size={iconSize(keys.length)} />
        </span>
      ))}
    </div>
  );
}
