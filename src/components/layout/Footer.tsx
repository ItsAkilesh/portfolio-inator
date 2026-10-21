/**
 * File: Footer.tsx
 * Purpose: Site footer with the credit line, a Links page shortcut and social icons from config.
 * Author: Akilesh
 * Date: 2026-10-20 (updated 2026-10-21)
 */
import { Link } from "react-router-dom";
import { BrandIcon } from "../../icons/BrandIcon";
import { footer, socialLinks } from "../../portfolio";
import { SmartLink } from "../ui/SmartLink";
import styles from "./Footer.module.css";

const ICON_SIZE = 17;

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`wrap ${styles.inner}`}>
        <span>{footer.credit}</span>
        <div className={styles.end}>
          <Link to={footer.linksPath} className={styles.text}>
            {footer.linksLabel}
          </Link>
          {socialLinks.map((item) => (
            <SmartLink
              key={item.name}
              href={item.link}
              className={styles.icon}
              aria-label={item.name}
              title={item.name}
            >
              <BrandIcon name={item.icon} size={ICON_SIZE} />
            </SmartLink>
          ))}
        </div>
      </div>
    </footer>
  );
}
