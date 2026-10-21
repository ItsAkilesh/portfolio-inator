/**
 * File: ContactPanel.tsx
 * Purpose: Contact page body: email and phone at one shared size that shrinks to fit the longest
 *          line, then the social links as a tile grid.
 * Author: Akilesh
 * Date: 2026-10-20 (updated 2026-10-21)
 */
import type { CSSProperties } from "react";
import { LinkGrid } from "../components/ui/LinkGrid";
import { socialLinks } from "../portfolio";
import styles from "./ContactPanel.module.css";

const NON_DIGITS = /[^\d+]/g;
/** Characters the trailing " ↗" adds to the email line. */
const ARROW_CHARS = 2;

/** Character count the shared contact font size must fit: the longest of the lines. */
export const contactFitChars = (email: string, phone: string): number =>
  Math.max(email.length + ARROW_CHARS, phone.length, 1);

interface ContactPanelProps {
  readonly email: string;
  readonly phone: string;
}

export function ContactPanel({ email, phone }: ContactPanelProps) {
  const fitStyle = {
    "--fit-chars": contactFitChars(email, phone),
  } as CSSProperties;
  return (
    <div className={`wrap ${styles.panel}`}>
      <div className={styles.direct} style={fitStyle}>
        <a className={`display enter ${styles.line}`} href={`mailto:${email}`}>
          {email}{" "}
          <span className={`arrow ${styles.arrow}`} aria-hidden="true">
            ↗
          </span>
        </a>
        <a
          className={`display enter ${styles.line}`}
          href={`tel:${phone.replace(NON_DIGITS, "")}`}
        >
          {phone}
        </a>
      </div>
      <LinkGrid items={socialLinks} label="Social links" />
    </div>
  );
}
