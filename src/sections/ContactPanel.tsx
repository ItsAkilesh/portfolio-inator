/**
 * File: ContactPanel.tsx
 * Purpose: Contact page body: email and phone at one shared size that shrinks to fit the longest
 *          line, then the social links (a tile grid on desktop, rows on small screens).
 * Author: Akilesh
 * Date: 2026-10-20 (updated 2026-10-21)
 */
import type { CSSProperties } from "react";
import { SmartLink } from "../components/ui/SmartLink";
import { BrandIcon, brandStyle } from "../icons/BrandIcon";
import { staggerDelay } from "../lib/text";
import { contactPageData, socialMediaLinks } from "../portfolio";
import styles from "./ContactPanel.module.css";

const NON_DIGITS = /[^\d+]/g;
const ICON_SIZE = 26;
/** Characters the trailing " ↗" adds to the email line. */
const ARROW_CHARS = 2;

/** Character count the shared contact font size must fit: the longest of the lines. */
export const contactFitChars = (email: string, phone: string): number =>
  Math.max(email.length + ARROW_CHARS, phone.length, 1);

function SocialGrid() {
  return (
    <ul className={`plain-list ${styles.grid}`} aria-label="Social links">
      {socialMediaLinks.map((item, index) => (
        <li
          key={item.name}
          className="enter"
          style={{ animationDelay: staggerDelay(index) }}
        >
          <SmartLink
            href={item.link}
            className={styles.tile}
            style={brandStyle(item.icon)}
          >
            <BrandIcon name={item.icon} size={ICON_SIZE} />
            <span className={styles.label}>{item.name}</span>
            <span className={`arrow ${styles.arrow}`} aria-hidden="true">
              ↗
            </span>
          </SmartLink>
        </li>
      ))}
    </ul>
  );
}

export function ContactPanel() {
  const { title: email, subtitle: phone } = contactPageData.phoneSection;
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
      <SocialGrid />
    </div>
  );
}
