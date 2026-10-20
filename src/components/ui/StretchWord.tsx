/**
 * File: StretchWord.tsx
 * Purpose: Splits a word into letters that compress individually on hover (variable font width axis).
 * Author: Akilesh
 * Date: 2026-10-20
 */
import styles from "./StretchWord.module.css";

interface StretchWordProps {
  readonly word: string;
  readonly className?: string;
}

export function StretchWord({ word, className }: StretchWordProps) {
  return (
    <span className={`${styles.word} ${className ?? ""}`} aria-label={word}>
      {Array.from(word).map((letter, index) => (
        <span
          key={`${letter}-${index}`}
          className={styles.letter}
          aria-hidden="true"
        >
          {letter}
        </span>
      ))}
    </span>
  );
}
