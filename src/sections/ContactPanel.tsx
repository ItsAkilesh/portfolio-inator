/**
 * File: ContactPanel.tsx
 * Purpose: Contact page body: large email and phone links beside the social link list.
 * Author: Akilesh
 * Date: 2026-10-20
 */
import { LinkRow } from "../components/ui/LinkRow";
import { staggerDelay } from "../lib/text";
import { contactPageData, socialMediaLinks } from "../portfolio";
import styles from "./ContactPanel.module.css";

const NON_DIGITS = /[^\d+]/g;

export function ContactPanel() {
  const { title: email, subtitle: phone } = contactPageData.phoneSection;
  return (
    <div className={`wrap ${styles.panel}`}>
      <div className={styles.direct}>
        <a className={`display enter ${styles.email}`} href={`mailto:${email}`}>
          {email}{" "}
          <span className="arrow" aria-hidden="true">
            ↗
          </span>
        </a>
        <a
          className="mono enter muted"
          href={`tel:${phone.replace(NON_DIGITS, "")}`}
        >
          {phone}
        </a>
      </div>
      <div className={styles.links}>
        {socialMediaLinks.map((item, index) => (
          <LinkRow key={item.name} item={item} delay={staggerDelay(index)} />
        ))}
      </div>
    </div>
  );
}
