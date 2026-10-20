/**
 * File: Footer.tsx
 * Purpose: Site footer with the credit line, a Links page shortcut and social icons from config.
 * Author: Akilesh
 * Date: 2026-10-20
 */
import { Link } from "react-router-dom";
import { BrandIcon } from "../../icons/BrandIcon";
import { links, socialMediaLinks, ui } from "../../portfolio";
import { SmartLink } from "../ui/SmartLink";
import styles from "./Footer.module.css";

const ICON_SIZE = 17;
const LINKS_PATH = "/links";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`wrap ${styles.inner}`}>
        <span>{ui.footer}</span>
        <div className={styles.end}>
          <Link to={LINKS_PATH} className={styles.text}>
            {links.title}
          </Link>
          {socialMediaLinks.map((item) => (
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
