/**
 * File: UnionField.tsx
 * Purpose: Generated editor for a discriminated union (a block, a palette): a type picker and the
 *          chosen type's fields. Changing type asks first, since it starts the item over. List items
 *          lock their type (it is chosen when adding), so the picker only shows for single values.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import { getIn } from "../paths";
import { useForm, type FieldProps } from "./FormContext";
import { Group } from "./Group";
import {
  emptyValue,
  metaOf,
  objectShape,
  optionFor,
  titleOf,
  unionOptions,
} from "./introspect";
import styles from "./form.module.css";

const CONFIRM_SWITCH = "Change the type? This clears this item's fields.";

interface TypePickerProps {
  readonly options: ReturnType<typeof unionOptions>;
  readonly current: string;
  readonly onPick: (value: string) => void;
}

function TypePicker({ options, current, onPick }: TypePickerProps) {
  if (options.length < 2) return null;
  return (
    <select
      className={styles.input}
      aria-label="Type"
      value={current}
      onChange={(e) => onPick(e.target.value)}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {metaOf(o.schema).title ?? o.value}
        </option>
      ))}
    </select>
  );
}

export function UnionField({
  schema,
  path,
  label,
  isBare,
  isTypeLocked,
}: FieldProps) {
  const { root, onChange, Field } = useForm();
  const options = unionOptions(schema);
  const option = optionFor(schema, getIn(root, path));
  const current = options.find((o) => o.schema === option)?.value ?? "";
  const switchTo = (next: string) => {
    const target = options.find((o) => o.value === next);
    if (target && next !== current && window.confirm(CONFIRM_SWITCH))
      onChange(path, emptyValue(target.schema));
  };
  const tagKey = options[0]?.key;
  const fields = option
    ? Object.entries(objectShape(option)).filter(([key]) => key !== tagKey)
    : [];
  return (
    <Group
      label={label}
      description={option ? metaOf(option).description : undefined}
      path={path}
      isBare={isBare}
    >
      {isTypeLocked ? null : (
        <TypePicker options={options} current={current} onPick={switchTo} />
      )}
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
