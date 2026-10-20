/**
 * File: Splash.tsx
 * Purpose: Name intro shown once per browser session when settings.isSplash is on.
 * Author: Akilesh
 * Date: 2026-10-20
 */
import { useState } from "react";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { readStored, writeStored } from "../../lib/storage";
import { greeting, settings } from "../../portfolio";
import styles from "./Splash.module.css";

const SEEN_KEY = "portfolio.splashSeen";

export function Splash() {
  const isReduced = useReducedMotion();
  const [isVisible, setIsVisible] = useState(
    () => settings.isSplash && readStored("session", SEEN_KEY) === null,
  );

  if (!isVisible || isReduced) return null;

  const finish = () => {
    writeStored("session", SEEN_KEY, "1");
    setIsVisible(false);
  };

  return (
    <div
      className={styles.splash}
      aria-hidden="true"
      onAnimationEnd={(event) =>
        event.target === event.currentTarget && finish()
      }
    >
      <span className={`display ${styles.name}`}>{greeting.logo_name}</span>
    </div>
  );
}
