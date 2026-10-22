/**
 * File: FitWord.tsx
 * Purpose: Display word that scales to its container width (never wraps or overflows) and reveals
 *          letter by letter on load. Used for the name in the home hero.
 * Author: Akilesh
 * Date: 2026-10-20 (updated 2026-10-22)
 */
import type { CSSProperties } from "react";
import styles from "./FitWord.module.css";

interface FitWordProps {
  readonly word: string;
  /** Largest font size in px, reached on wide screens. */
  readonly maxSize: number;
  readonly className?: string;
}

export function FitWord({ word, maxSize, className }: FitWordProps) {
  const letters = Array.from(word);
  const style = {
    "--chars": Math.max(letters.length, 1),
    "--max-size": `${maxSize}px`,
  } as CSSProperties;
  return (
    <span className={`${styles.fit} ${className ?? ""}`} style={style}>
      {/* Screen readers get the word once; the animated letters are hidden from them. */}
      <span className="visually-hidden">{word}</span>
      <span className={styles.word} aria-hidden="true">
        {letters.map((letter, index) => (
          <span
            key={`${letter}-${index}`}
            className={styles.letter}
            style={{ animationDelay: `${0.1 + index * 0.045}s` }}
          >
            {letter}
          </span>
        ))}
      </span>
    </span>
  );
}
