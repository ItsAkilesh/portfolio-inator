/**
 * File: RecordField.tsx
 * Purpose: Generated editor for named entries (palettes, language icons): rename, edit, add, remove.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import { useId } from "react";
import type { z } from "zod";
import { getIn, renameKey, type Path } from "../paths";
import { useForm, type FieldProps } from "./FormContext";
import { Group } from "./Group";
import { emptyValue, metaOf, recordValue } from "./introspect";
import styles from "./form.module.css";

/** First unused "new-n" key. */
export function nextKey(record: Readonly<Record<string, unknown>>): string {
  let n = Object.keys(record).length + 1;
  while (`new-${n}` in record) n += 1;
  return `new-${n}`;
}

interface EntryProps {
  readonly name: string;
  readonly record: Readonly<Record<string, unknown>>;
  readonly path: Path;
  readonly valueSchema: z.ZodType;
}

function Entry({ name, record, path, valueSchema }: EntryProps) {
  const { onChange, Field } = useForm();
  const inputId = useId();
  const without = Object.fromEntries(
    Object.entries(record).filter(([key]) => key !== name),
  );
  const rename = (next: string) =>
    onChange(path, renameKey(record, name, next.trim()));
  return (
    <details className={styles.item}>
      <summary className={styles.summary}>
        <span>{name}</span>
        <button
          type="button"
          className={styles.icon}
          aria-label={`Remove ${name}`}
          onClick={() => onChange(path, without)}
        >
          ✕
        </button>
      </summary>
      <div className={styles.field}>
        <label className={styles.label} htmlFor={inputId}>
          Name
        </label>
        {/* Renamed on blur, so typing does not move the entry under a half-written key. */}
        <input
          id={inputId}
          className={styles.input}
          defaultValue={name}
          onBlur={(e) => rename(e.target.value)}
        />
      </div>
      <Field schema={valueSchema} path={[...path, name]} label={name} isBare />
    </details>
  );
}

export function RecordField({ schema, path, label }: FieldProps) {
  const { root, onChange } = useForm();
  const record =
    (getIn(root, path) as Record<string, unknown> | undefined) ?? {};
  const valueSchema = recordValue(schema);
  return (
    <Group label={label} description={metaOf(schema).description} path={path}>
      {Object.keys(record).map((name) => (
        <Entry
          key={name}
          name={name}
          record={record}
          path={path}
          valueSchema={valueSchema}
        />
      ))}
      <button
        type="button"
        className={styles.button}
        onClick={() =>
          onChange(path, {
            ...record,
            [nextKey(record)]: emptyValue(valueSchema),
          })
        }
      >
        Add
      </button>
    </Group>
  );
}
