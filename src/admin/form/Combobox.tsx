/**
 * File: Combobox.tsx
 * Purpose: Searchable dropdown used for icons and images: type to filter, arrow keys and Enter to pick,
 *          a toggle button to see every option, and an optional preview beside each option.
 *          Follows the ARIA combobox pattern.
 * Author: Akilesh
 * Date: 2026-10-21 (updated 2026-10-22)
 */
import { useId, type ReactNode } from "react";
import { useCombobox, type ComboOption } from "./useCombobox";
import styles from "./form.module.css";
import comboStyles from "./combobox.module.css";

interface ComboboxProps {
  readonly id: string;
  readonly value: string;
  readonly options: readonly ComboOption[];
  readonly onChange: (value: string) => void;
  readonly renderPreview?: (value: string) => ReactNode;
  readonly emptyText?: string;
  /** Called with the typed text ("" while the field shows the chosen value), e.g. to search more. */
  readonly onQueryChange?: (query: string) => void;
}

export function Combobox({
  id,
  value,
  options,
  onChange,
  renderPreview,
  emptyText = "No matches",
  onQueryChange,
}: ComboboxProps) {
  const listId = useId();
  const combo = useCombobox(options, value, onChange, onQueryChange);
  const optionId = (index: number) => `${listId}-${index}`;
  return (
    <div ref={combo.rootRef} className={comboStyles.combo}>
      <input
        id={id}
        className={styles.input}
        role="combobox"
        aria-expanded={combo.isOpen}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={
          combo.isOpen && combo.visible.length > 0
            ? optionId(combo.active)
            : undefined
        }
        value={combo.query}
        onChange={(e) => combo.type(e.target.value)}
        onFocus={() => combo.setIsOpen(true)}
        onKeyDown={combo.onKeyDown}
        autoComplete="off"
      />
      <button
        type="button"
        className={comboStyles.comboToggle}
        aria-label="Show all options"
        tabIndex={-1}
        onClick={() => combo.setIsOpen(!combo.isOpen)}
      >
        ▾
      </button>
      {combo.isOpen && (
        <ul id={listId} role="listbox" className={comboStyles.comboList}>
          {combo.visible.length === 0 && (
            <li className={comboStyles.comboEmpty}>{emptyText}</li>
          )}
          {combo.visible.map((option, index) => (
            <li
              key={option.value}
              id={optionId(index)}
              role="option"
              aria-selected={option.value === value}
              data-active={index === combo.active || undefined}
              className={comboStyles.comboOption}
              onPointerEnter={() => combo.setActive(index)}
              onPointerDown={(e) => {
                e.preventDefault();
                combo.choose(option);
              }}
            >
              {renderPreview && (
                <span className={comboStyles.comboPreview}>
                  {renderPreview(option.value)}
                </span>
              )}
              {option.label}
              {option.hint && (
                <span className={comboStyles.comboHint}>{option.hint}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
