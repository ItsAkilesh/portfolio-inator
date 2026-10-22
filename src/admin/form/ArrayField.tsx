/**
 * File: ArrayField.tsx
 * Purpose: Generated editor for a list. Plain values (strings, numbers) are inline rows; objects and
 *          blocks are collapsible items titled by their summary. Items can be added, moved and removed.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import { useContext, type ReactNode } from "react";
import type { z } from "zod";
import { getIn, moveItem, removeAt, type Path } from "../paths";
import { DepthContext, useForm, type FieldProps } from "./FormContext";
import { Group, ProblemBadge } from "./Group";
import { arrayElement, kindOf, metaOf, titleOf } from "./introspect";
import { AddItem, ItemControls, summaryOf } from "./listParts";
import styles from "./form.module.css";

const NESTED_KINDS: ReadonlySet<string> = new Set([
  "object",
  "union",
  "array",
  "record",
]);

interface ItemProps {
  readonly element: z.ZodType;
  readonly item: unknown;
  readonly itemPath: Path;
  readonly index: number;
  readonly controls: ReactNode;
}

function ScalarItem({ element, itemPath, index, controls }: ItemProps) {
  const { Field } = useForm();
  return (
    <div className={styles.row}>
      <Field
        schema={element}
        path={itemPath}
        label={`${titleOf(element, "item")} ${index + 1}`}
      />
      {controls}
    </div>
  );
}

/** Nesting levels get distinct shades; deeper levels cycle. */
const DEPTH_SHADES = 4;

function NestedItem({ element, item, itemPath, index, controls }: ItemProps) {
  const { Field } = useForm();
  const depth = useContext(DepthContext);
  const summary = summaryOf(element, item, index);
  const kind = metaOf(element).title;
  return (
    <details className={styles.item} data-depth={depth % DEPTH_SHADES}>
      <summary className={styles.summary}>
        {kind ? <span className={styles.chip}>{kind}</span> : null}
        <span className={styles.summaryText}>{summary}</span>
        <ProblemBadge path={itemPath} />
        {controls}
      </summary>
      <div className={styles.itemBody}>
        <DepthContext.Provider value={depth + 1}>
          <Field
            schema={element}
            path={itemPath}
            label={summary}
            isBare
            isTypeLocked
          />
        </DepthContext.Provider>
      </div>
    </details>
  );
}

export function ArrayField({ schema, path, label }: FieldProps) {
  const { root, onChange } = useForm();
  const items = (getIn(root, path) as unknown[] | undefined) ?? [];
  const element = arrayElement(schema);
  const Item = NESTED_KINDS.has(kindOf(element)) ? NestedItem : ScalarItem;
  return (
    <Group
      label={label}
      description={metaOf(schema).description}
      path={path}
      count={items.length}
    >
      {items.map((item, index) => (
        <Item
          key={index}
          element={element}
          item={item}
          itemPath={[...path, index]}
          index={index}
          controls={
            <ItemControls
              index={index}
              total={items.length}
              onMove={(to) => onChange(path, moveItem(items, index, to))}
              onRemove={() => onChange(path, removeAt(items, index))}
            />
          }
        />
      ))}
      <AddItem
        element={element}
        onAdd={(value) => onChange(path, [...items, value])}
      />
    </Group>
  );
}
