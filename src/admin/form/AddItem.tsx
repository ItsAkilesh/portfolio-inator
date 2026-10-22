/**
 * File: AddItem.tsx
 * Purpose: Adding to a generated list. Plain lists get an "Add" button; lists of blocks (or other
 *          unions) get a palette of types with a picture and description of each; lists whose items
 *          offer templates (pages) also get "From template". The same palette inserts at a position.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import { useState } from "react";
import type { z } from "zod";
import {
  emptyValue,
  kindOf,
  metaOf,
  unionOptions,
} from "../../content/introspect";
import { getIn } from "../paths";
import { BlockThumbnail } from "./blockThumbnails";
import { useForm } from "./FormContext";
import { PAGE_TEMPLATES, pageFromTemplate } from "./pageTemplates";
import styles from "./form.module.css";
import paletteStyles from "./palette.module.css";

interface AddProps {
  readonly element: z.ZodType;
  readonly onAdd: (value: unknown) => void;
  readonly items: readonly unknown[];
}

export function TypePalette({
  element,
  onPick,
}: {
  readonly element: z.ZodType;
  readonly onPick: (value: unknown) => void;
}) {
  return (
    <ul className={paletteStyles.palette} aria-label="Block types">
      {unionOptions(element).map((option) => {
        const meta = metaOf(option.schema);
        return (
          <li key={option.value}>
            <button
              type="button"
              className={paletteStyles.paletteItem}
              onClick={() => onPick(emptyValue(option.schema))}
            >
              <BlockThumbnail type={option.value} />
              <span className={paletteStyles.paletteTitle}>
                {meta.title ?? option.value}
              </span>
              {meta.description && (
                <span className={paletteStyles.paletteText}>
                  {meta.description}
                </span>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function TemplateMenu({
  items,
  onAdd,
}: {
  readonly items: readonly unknown[];
  readonly onAdd: (value: unknown) => void;
}) {
  const { root } = useForm();
  const portrait = String(getIn(root, ["site", "portrait"]) ?? "");
  return (
    <ul className={paletteStyles.palette} aria-label="Page templates">
      {PAGE_TEMPLATES.map((template) => (
        <li key={template.id}>
          <button
            type="button"
            className={paletteStyles.paletteItem}
            onClick={() => onAdd(pageFromTemplate(template, items, portrait))}
          >
            <span className={paletteStyles.paletteTitle}>{template.label}</span>
            <span className={paletteStyles.paletteText}>
              {template.description}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

export function AddItem({ element, onAdd, items }: AddProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isUnion = kindOf(element) === "union";
  const hasTemplates = metaOf(element).templates === "pages";
  const add = (value: unknown) => {
    onAdd(value);
    setIsOpen(false);
  };
  if (!isUnion && !hasTemplates)
    return (
      <button
        type="button"
        className={styles.button}
        onClick={() => onAdd(emptyValue(element))}
      >
        Add {(metaOf(element).title ?? "item").toLowerCase()}
      </button>
    );
  return (
    <div className={paletteStyles.addArea}>
      <button
        type="button"
        className={styles.button}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
      >
        {isUnion ? "Add block" : "Add page"}
      </button>
      {isOpen &&
        (isUnion ? (
          <TypePalette element={element} onPick={add} />
        ) : (
          <TemplateMenu items={items} onAdd={add} />
        ))}
    </div>
  );
}

/** A slim "+" between list items that opens the palette and inserts there. */
export function InsertHere({
  element,
  onInsert,
}: {
  readonly element: z.ZodType;
  readonly onInsert: (value: unknown) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className={paletteStyles.insert}>
      <button
        type="button"
        className={paletteStyles.insertButton}
        aria-expanded={isOpen}
        aria-label="Insert a block here"
        onClick={() => setIsOpen((open) => !open)}
      >
        +
      </button>
      {isOpen && (
        <TypePalette
          element={element}
          onPick={(value) => {
            onInsert(value);
            setIsOpen(false);
          }}
        />
      )}
    </div>
  );
}
