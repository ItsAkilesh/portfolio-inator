/**
 * File: ArrayField.tsx
 * Purpose: Generated editor for a list. Plain values (strings, numbers) are inline rows; objects and
 *          blocks are collapsible items titled by their summary. Items can be added, moved and removed.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import type { ReactNode } from "react";
import type { z } from "zod";
import { getIn, moveItem, removeAt, type Path } from "../paths";
import { useForm, type FieldProps } from "./FormContext";
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

function NestedItem({ element, item, itemPath, index, controls }: ItemProps) {
  const { Field } = useForm();
  const summary = summaryOf(element, item, index);
  return (
    <details className={styles.item}>
      <summary className={styles.summary}>
        <span>{summary}</span>
        <ProblemBadge path={itemPath} />
        {controls}
      </summary>
      <Field schema={element} path={itemPath} label={summary} isBare />
    </details>
  );
}

export function ArrayField({ schema, path, label }: FieldProps) {
  const { root, onChange } = useForm();
  const items = (getIn(root, path) as unknown[] | undefined) ?? [];
  const element = arrayElement(schema);
  const Item = NESTED_KINDS.has(kindOf(element)) ? NestedItem : ScalarItem;
  return (
    <Group label={label} description={metaOf(schema).description} path={path}>
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
