/**
 * File: LinkRow.tsx
 * Purpose: Full-width link with a brand icon, used on the Contact and Links pages.
 * Author: Akilesh
 * Date: 2026-10-20
 */
import { BrandIcon, brandStyle } from "../../icons/BrandIcon";
import type { LinkItem } from "../../types/portfolio";
import { SmartLink, isInternalPath } from "./SmartLink";
import styles from "./LinkRow.module.css";

const ICON_SIZE = 20;

interface LinkRowProps {
  readonly item: LinkItem;
  readonly isEmphasized?: boolean;
  readonly delay?: string;
}

export function LinkRow({ item, isEmphasized = false, delay }: LinkRowProps) {
  const className = `${styles.row} enter ${isEmphasized ? styles.emphasized : ""}`;
  return (
    <SmartLink
      href={item.link}
      className={className}
      style={{ ...brandStyle(item.icon), animationDelay: delay }}
    >
      <BrandIcon name={item.icon} size={ICON_SIZE} />
      <span className={styles.label}>{item.name}</span>
      <span className="arrow" aria-hidden="true">
        {isInternalPath(item.link) ? "→" : "↗"}
      </span>
    </SmartLink>
  );
}
