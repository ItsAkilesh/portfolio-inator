/**
 * File: Disclosure.tsx
 * Purpose: The collapsible frame of a list item or named entry: a header with a toggle button (kind
 *          chip, title, problem badge) and the item's own controls beside it, never inside it, so
 *          no control is nested in another. The body renders only while open.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import { useId, type ReactNode } from "react";
import { pathId, type Path } from "../paths";
import { ProblemBadge } from "./Group";
import listStyles from "./listItems.module.css";

interface DisclosureProps {
  readonly path: Path;
  readonly title: string;
  readonly isOpen: boolean;
  readonly onToggle: () => void;
  readonly children: ReactNode;
  readonly chip?: string;
  readonly depth?: number;
  readonly controls?: ReactNode;
  readonly frameProps?: Readonly<Record<string, unknown>>;
}

export function Disclosure({
  path,
  title,
  isOpen,
  onToggle,
  children,
  chip,
  depth = 0,
  controls,
  frameProps,
}: DisclosureProps) {
  const bodyId = useId();
  return (
    <div
      className={listStyles.item}
      data-item=""
      data-depth={depth}
      data-path={pathId(path)}
      data-open={isOpen || undefined}
      {...frameProps}
    >
      <div className={listStyles.itemHead}>
        <button
          type="button"
          className={listStyles.summary}
          data-summary=""
          aria-expanded={isOpen}
          aria-controls={bodyId}
          onClick={onToggle}
        >
          {chip ? <span className={listStyles.chip}>{chip}</span> : null}
          <span className={listStyles.summaryText}>{title}</span>
          <ProblemBadge path={path} />
        </button>
        {controls}
      </div>
      {isOpen && (
        <div id={bodyId} className={listStyles.itemBody}>
          {children}
        </div>
      )}
    </div>
  );
}
