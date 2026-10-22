/**
 * File: useCombobox.ts
 * Purpose: State and keyboard behaviour of a searchable dropdown: open/close, filtering by the typed
 *          text (all options when the field still shows the chosen value), the highlighted option,
 *          and closing on outside clicks. The listener is removed on close and unmount.
 * Author: Akilesh
 * Date: 2026-10-21
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

export function useCombobox(
  options: readonly ComboOption[],
  value: string,
  onChange: (value: string) => void,
) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const [active, setActive] = useState(0);
  const visible = useMemo(
    () => filterOptions(options, query, value),
    [options, query, value],
  );
  const close = useCallback(() => {
    setIsOpen(false);
    setQuery(value);
  }, [value]);
  const choose = (option: ComboOption | undefined) => {
    if (option) onChange(option.value);
    setQuery(option?.value ?? value);
    setIsOpen(false);
  };
  useOutsideClose(rootRef, isOpen, close);
  useEffect(() => setQuery(value), [value]);
  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    const moves: Record<string, () => void> = {
      ArrowDown: () =>
        isOpen
          ? setActive((i) => Math.min(i + 1, visible.length - 1))
          : setIsOpen(true),
      ArrowUp: () => setActive((i) => Math.max(i - 1, 0)),
      Enter: () => isOpen && choose(visible[active]),
      Escape: close,
    };
    const move = moves[event.key];
    if (!move) return;
    event.preventDefault();
    move();
  };
  const type = (text: string) => {
    setQuery(text);
    setActive(0);
    setIsOpen(true);
  };
  return {
    rootRef,
    isOpen,
    setIsOpen,
    query,
    type,
    visible,
    active,
    setActive,
    choose,
    onKeyDown,
  };
}
