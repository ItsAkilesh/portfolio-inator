/**
 * File: introspect.ts
 * Purpose: Reads zod schemas for the form generator: what kind of editor a field needs, its admin
 *          metadata, and a valid empty value for new list items, record entries or block types.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import { z } from "zod";
import type { FieldMeta } from "../../content/schema/fields";

export type FieldKind =
  | "string"
  | "number"
  | "boolean"
  | "enum"
  | "literal"
  | "object"
  | "array"
  | "record"
  | "union"
  | "choice"
  | "unknown";

/** Optional wrappers are transparent to the editor. */
export function unwrap(schema: z.ZodType): z.ZodType {
  return schema instanceof z.ZodOptional
    ? unwrap(schema.unwrap() as z.ZodType)
    : schema;
}

export function kindOf(schema: z.ZodType): FieldKind {
  const s = unwrap(schema);
  if (s instanceof z.ZodString) return "string";
  if (s instanceof z.ZodNumber) return "number";
  if (s instanceof z.ZodBoolean) return "boolean";
  if (s instanceof z.ZodEnum) return "enum";
  if (s instanceof z.ZodLiteral) return "literal";
  if (s instanceof z.ZodObject) return "object";
  if (s instanceof z.ZodArray) return "array";
  if (s instanceof z.ZodRecord) return "record";
  if (s instanceof z.ZodDiscriminatedUnion) return "union";
  /* A plain union of string options, e.g. "" or a link: edited as text. */
  if (s instanceof z.ZodUnion) return "choice";
  return "unknown";
}

export const metaOf = (schema: z.ZodType): FieldMeta =>
  (schema.meta() as FieldMeta | undefined) ??
  (unwrap(schema).meta() as FieldMeta | undefined) ??
  {};

/** Title for a field: its meta title, else the key turned into words. */
export function titleOf(schema: z.ZodType, key: string | number): string {
  const title = metaOf(schema).title;
  if (title) return title;
  return String(key)
    .replace(/[_-]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^./, (c) => c.toUpperCase());
}

export const objectShape = (schema: z.ZodType): Record<string, z.ZodType> =>
  (unwrap(schema) as z.ZodObject).shape as Record<string, z.ZodType>;

export const arrayElement = (schema: z.ZodType): z.ZodType =>
  (unwrap(schema) as z.ZodArray<z.ZodType>).element;

export const recordValue = (schema: z.ZodType): z.ZodType =>
  (unwrap(schema) as z.ZodRecord<z.ZodString, z.ZodType>).valueType;

/** Options of a discriminated union with their discriminator values. */
export function unionOptions(
  schema: z.ZodType,
): { key: string; value: string; schema: z.ZodObject }[] {
  const union = unwrap(schema) as z.ZodDiscriminatedUnion<z.ZodObject[]>;
  const key = union.def.discriminator;
  return union.options.map((option) => {
    const literal = option.shape[key] as z.ZodLiteral<string>;
    return { key, value: String(literal.value), schema: option };
  });
}

export const enumOptions = (schema: z.ZodType): string[] =>
  (unwrap(schema) as z.ZodEnum).options.map(String);

/** A valid-shaped empty value: "" / 0 / false / first option / recursively for objects. */
export function emptyValue(schema: z.ZodType): unknown {
  const s = unwrap(schema);
  switch (kindOf(s)) {
    case "string":
    case "choice":
      return "";
    case "number":
      return (s as z.ZodNumber).minValue ?? 0;
    case "boolean":
      return false;
    case "enum":
      return enumOptions(s)[0] ?? "";
    case "literal":
      return (s as z.ZodLiteral).value;
    case "object":
      return Object.fromEntries(
        Object.entries(objectShape(s)).map(([k, v]) => [k, emptyValue(v)]),
      );
    case "array":
      return [];
    case "record":
      return {};
    case "union":
      return emptyValue(unionOptions(s)[0]?.schema ?? z.unknown());
    default:
      return null;
  }
}

/** Schema of the field at `path` below `root`, following objects, arrays, records and unions. */
export function schemaAt(
  root: z.ZodType,
  path: readonly (string | number)[],
  value: unknown,
): z.ZodType | undefined {
  let schema: z.ZodType | undefined = root;
  let node = value;
  for (const key of path) {
    if (!schema) return undefined;
    schema = childSchema(schema, key, node);
    node = (node as Record<string | number, unknown> | undefined)?.[key];
  }
  return schema;
}

function childSchema(
  schema: z.ZodType,
  key: string | number,
  node: unknown,
): z.ZodType | undefined {
  switch (kindOf(schema)) {
    case "object":
      return objectShape(schema)[String(key)];
    case "array":
      return arrayElement(schema);
    case "record":
      return recordValue(schema);
    case "union": {
      const option = optionFor(schema, node);
      return option ? childSchema(option, key, node) : undefined;
    }
    default:
      return undefined;
  }
}

/** The union option that matches a value's discriminator. */
export function optionFor(
  schema: z.ZodType,
  value: unknown,
): z.ZodObject | undefined {
  const options = unionOptions(schema);
  const key = options[0]?.key;
  const tag =
    key && typeof value === "object" && value !== null
      ? (value as Record<string, unknown>)[key]
      : undefined;
  return options.find((option) => option.value === tag)?.schema;
}
