/**
 * File: LinkGrid.tsx
 * Purpose: Grid of link tiles (brand icon, name, arrow), styled like the What I do tool tiles.
 *          Two columns on phones, as many as fit on wider screens. Internal routes are emphasized.
 *          Used by the Contact and Links pages.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import { BrandIcon, brandStyle } from "../../icons/BrandIcon";
import { staggerDelay } from "../../lib/text";
import type { LinkItem } from "../../types/portfolio";
import { SmartLink, isInternalPath } from "./SmartLink";
import styles from "./LinkGrid.module.css";

const ICON_SIZE = 26;

interface LinkGridProps {
  readonly items: readonly LinkItem[];
  readonly label: string;
}

function LinkTile({ item }: { readonly item: LinkItem }) {
  const isInternal = isInternalPath(item.link);
  return (
    <SmartLink
      href={item.link}
      className={`${styles.tile} ${isInternal ? styles.emphasized : ""}`}
      style={brandStyle(item.icon)}
    >
      <BrandIcon name={item.icon} size={ICON_SIZE} />
      <span className={styles.label}>{item.name}</span>
      <span className={`arrow ${styles.arrow}`} aria-hidden="true">
        {isInternal ? "→" : "↗"}
      </span>
    </SmartLink>
  );
}

export function LinkGrid({ items, label }: LinkGridProps) {
  return (
    <ul className={`plain-list ${styles.grid}`} aria-label={label}>
      {items.map((item, index) => (
        <li
          key={item.name}
          className={`enter ${styles.cell}`}
          style={{ animationDelay: staggerDelay(index) }}
        >
          <LinkTile item={item} />
        </li>
      ))}
    </ul>
  );
}
