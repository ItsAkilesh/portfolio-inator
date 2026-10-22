/**
 * File: SchemaField.tsx
 * Purpose: The form generator's dispatcher: picks the editor for a schema node from its kind and its
 *          admin widget hint, and wires value, change and validation messages from the form context.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import { useId } from "react";
import { getIn, pathId } from "../paths";
import { IconInput, ImageInput } from "./AssetFields";
import { ArrayField } from "./ArrayField";
import { ObjectField } from "./ObjectField";
import { RecordField } from "./RecordField";
import { UnionField } from "./UnionField";
import { FieldShell } from "./FieldShell";
import { useForm, type FieldProps } from "./FormContext";
import { enumOptions, kindOf, metaOf } from "./introspect";
import {
  ColorInput,
  NumberInput,
  SelectInput,
  TextInput,
  ToggleInput,
} from "./primitives";

function LeafEditor({
  schema,
  path,
  id,
}: FieldProps & { readonly id: string }) {
  const { root, onChange } = useForm();
  const value = getIn(root, path);
  const set = (next: unknown) => onChange(path, next);
  const widget = metaOf(schema).widget;
  switch (kindOf(schema)) {
    case "number":
      return <NumberInput id={id} value={Number(value)} onChange={set} />;
    case "boolean":
      return <ToggleInput id={id} value={value === true} onChange={set} />;
    case "enum":
      return widget === "icon" ? (
        <IconInput
          id={id}
          value={String(value ?? "")}
          onChange={set}
          options={enumOptions(schema)}
        />
      ) : (
        <SelectInput
          id={id}
          value={String(value ?? "")}
          onChange={set}
          options={enumOptions(schema)}
        />
      );
    default:
      if (widget === "image")
        return (
          <ImageInput id={id} value={String(value ?? "")} onChange={set} />
        );
      if (widget === "color")
        return (
          <ColorInput id={id} value={String(value ?? "")} onChange={set} />
        );
      return (
        <TextInput
          id={id}
          value={String(value ?? "")}
          onChange={set}
          isMultiline={widget === "multiline"}
        />
      );
  }
}

export function SchemaField(props: FieldProps) {
  const { issues } = useForm();
  const id = useId();
  switch (kindOf(props.schema)) {
    case "object":
      return <ObjectField {...props} />;
    case "array":
      return <ArrayField {...props} />;
    case "record":
      return <RecordField {...props} />;
    case "union":
      return <UnionField {...props} />;
    case "literal":
      return null;
    default:
      return (
        <FieldShell
          id={id}
          label={props.label}
          description={metaOf(props.schema).description}
          errors={issues.get(pathId(props.path)) ?? []}
        >
          <LeafEditor {...props} id={id} />
        </FieldShell>
      );
  }
}
