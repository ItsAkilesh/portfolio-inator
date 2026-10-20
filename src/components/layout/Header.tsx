/**
 * File: Header.tsx
 * Purpose: Sticky site header: logo, navigation from config, and the light/dark toggle.
 * Author: Akilesh
 * Date: 2026-10-20
 */
import { useEffect, useRef, type RefObject } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { UiIcon } from "../../icons/UiIcon";
import { greeting, navigation } from "../../portfolio";
import { useTheme } from "../../theme/themeContext";
import styles from "./Header.module.css";

const HOME_PATH = "/home";
const HEADER_HEIGHT_VAR = "--header-h";

function NavLinks() {
  const { pathname } = useLocation();
  return (
    <>
      {navigation.map((item) => {
        const isRootHome = item.path === HOME_PATH && pathname === "/";
        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              isActive || isRootHome
                ? `${styles.link} ${styles.active}`
                : styles.link
            }
            aria-current={isRootHome ? "page" : undefined}
          >
            {item.label}
          </NavLink>
        );
      })}
    </>
  );
}

/** Publishes the header's rendered height as --header-h so page content can clear the fixed header. */
function useHeaderHeight(ref: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    const header = ref.current;
    if (!header) return undefined;
    const root = document.documentElement;
    const publish = () =>
      root.style.setProperty(HEADER_HEIGHT_VAR, `${header.offsetHeight}px`);
    const observer = new ResizeObserver(publish);
    observer.observe(header);
    publish();
    return () => observer.disconnect();
  }, [ref]);
}

export function Header() {
  const { mode, toggle } = useTheme();
  const headerRef = useRef<HTMLElement>(null);
  const isDark = mode === "dark";
  useHeaderHeight(headerRef);

  return (
    <header ref={headerRef} className={styles.header}>
      <nav aria-label="Primary" className={`wrap ${styles.nav}`}>
        <Link to={HOME_PATH} className={`display ${styles.logo}`}>
          {greeting.logo_name}
        </Link>
        <div className={styles.links}>
          <NavLinks />
          <button
            type="button"
            className={styles.toggle}
            onClick={toggle}
            aria-label={
              isDark ? "Switch to light theme" : "Switch to dark theme"
            }
          >
            <UiIcon name={isDark ? "sun" : "moon"} />
          </button>
        </div>
      </nav>
    </header>
  );
}
