/**
 * File: ObjectField.tsx
 * Purpose: Generated editor for an object: one field per key, in schema order.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import { useForm, type FieldProps } from "./FormContext";
import { Group } from "./Group";
import { metaOf, objectShape, titleOf } from "./introspect";

/** "$schema" points editors at the JSON Schema; it is not content. */
const HIDDEN_KEYS: ReadonlySet<string> = new Set(["$schema"]);

export function ObjectField({ schema, path, label, isBare }: FieldProps) {
  const { Field } = useForm();
  const fields = Object.entries(objectShape(schema)).filter(
    ([key]) => !HIDDEN_KEYS.has(key),
  );
  return (
    <Group
      label={label}
      description={metaOf(schema).description}
      path={path}
      isBare={isBare}
    >
      {fields.map(([key, child]) => (
        <Field
          key={key}
          schema={child}
          path={[...path, key]}
          label={titleOf(child, key)}
        />
      ))}
    </Group>
  );
}
