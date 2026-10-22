/**
 * File: useCombobox.ts
 * Purpose: State and keyboard behaviour of a searchable dropdown: open/close, filtering by the typed
 *          text (all options when the field still shows the chosen value), the highlighted option,
 *          and closing on outside clicks. The listener is removed on close and unmount.
 * Author: Akilesh
 * Date: 2026-10-21 (updated 2026-10-22)
 */
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type RefObject,
} from "react";

export interface ComboOption {
  readonly value: string;
  readonly label: string;
  /** Extra text after the label, e.g. "add to library". */
  readonly hint?: string;
}

/** Options containing the query, case-insensitively; everything when the query is the current value. */
export function filterOptions(
  options: readonly ComboOption[],
  query: string,
  current: string,
): ComboOption[] {
  const q = query.trim().toLowerCase();
  if (!q || query === current) return [...options];
  return options.filter(
    (o) =>
      o.label.toLowerCase().includes(q) || o.value.toLowerCase().includes(q),
  );
}

function useOutsideClose(
  ref: RefObject<HTMLElement | null>,
  isOpen: boolean,
  close: () => void,
): void {
  useEffect(() => {
    if (!isOpen) return undefined;
    const onDown = (event: PointerEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) close();
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [ref, isOpen, close]);
}

interface KeyActions {
  readonly isOpen: boolean;
  readonly count: number;
  readonly open: () => void;
  readonly move: (step: number) => void;
  readonly pick: () => void;
  readonly close: () => void;
}

/** Keyboard behaviour of the ARIA combobox pattern. */
function keyHandler(actions: KeyActions) {
  return (event: KeyboardEvent<HTMLInputElement>) => {
    const moves: Record<string, () => void> = {
      ArrowDown: () => (actions.isOpen ? actions.move(1) : actions.open()),
      ArrowUp: () => actions.move(-1),
      Enter: () => actions.isOpen && actions.pick(),
      Escape: actions.close,
    };
    const run = moves[event.key];
    if (!run) return;
    event.preventDefault();
    run();
  };
}

/** Clamps the highlighted index after a step to the visible options. */
function stepIndex(current: number, step: number, count: number): number {
  return Math.min(Math.max(current + step, 0), Math.max(count - 1, 0));
}

/** The typed text, reset to the chosen value when it changes and reported to the caller. */
function useComboQuery(value: string, onQueryChange?: (query: string) => void) {
  const [query, setQuery] = useState(value);
  useEffect(() => setQuery(value), [value]);
  useEffect(
    () => onQueryChange?.(query === value ? "" : query),
    [query, value, onQueryChange],
  );
  return [query, setQuery] as const;
}

/** Open state, typed text and highlighted option, with the actions that change them together. */
function useComboState(
  value: string,
  onChange: (value: string) => void,
  onQueryChange?: (query: string) => void,
) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useComboQuery(value, onQueryChange);
  const [active, setActive] = useState(0);
  const close = useCallback(() => {
    setIsOpen(false);
    setQuery(value);
  }, [value, setQuery]);
  const choose = (option: ComboOption | undefined) => {
    if (option) onChange(option.value);
    setQuery(option?.value ?? value);
    setIsOpen(false);
  };
  const type = (text: string) => {
    setQuery(text);
    setActive(0);
    setIsOpen(true);
  };
  return { isOpen, setIsOpen, query, active, setActive, close, choose, type };
}

export function useCombobox(
  options: readonly ComboOption[],
  value: string,
  onChange: (value: string) => void,
  onQueryChange?: (query: string) => void,
) {
  const rootRef = useRef<HTMLDivElement>(null);
  const state = useComboState(value, onChange, onQueryChange);
  const { isOpen, setIsOpen, query, active, setActive, close, choose } = state;
  const visible = useMemo(
    () => filterOptions(options, query, value),
    [options, query, value],
  );
  useOutsideClose(rootRef, isOpen, close);
  const onKeyDown = keyHandler({
    isOpen,
    count: visible.length,
    open: () => setIsOpen(true),
    move: (step) => setActive((i) => stepIndex(i, step, visible.length)),
    pick: () => choose(visible[active]),
    close,
  });
  return {
    rootRef,
    isOpen,
    setIsOpen,
    query,
    type: state.type,
    visible,
    active,
    setActive,
    choose,
    onKeyDown,
  };
}
