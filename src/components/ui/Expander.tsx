/**
 * File: Expander.tsx
 * Purpose: Height-animated disclosure region (animates grid-template-rows, not height).
 * Author: Akilesh
 * Date: 2026-10-20
 */
import type { ReactNode } from "react";
import styles from "./Expander.module.css";

interface ExpanderProps {
  readonly id: string;
  readonly isOpen: boolean;
  readonly children: ReactNode;
}

export function Expander({ id, isOpen, children }: ExpanderProps) {
  return (
    <div
      id={id}
      className={isOpen ? `${styles.body} ${styles.open}` : styles.body}
    >
      <div className={styles.inner} inert={!isOpen}>
        {children}
      </div>
    </div>
  );
}
