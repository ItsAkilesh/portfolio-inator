/**
 * File: FormContext.tsx
 * Purpose: Shared state for generated forms: the value being edited, the change callback, validation
 *          problems by path, the image library, and the field renderer itself. Passing the renderer
 *          through context lets container fields render children without importing SchemaField,
 *          which would create a circular dependency.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import { createContext, useContext, type ComponentType } from "react";
import type { z } from "zod";
import type { Path } from "../paths";

export interface FieldProps {
  readonly schema: z.ZodType;
  readonly path: Path;
  readonly label: string;
  /** Render a container's fields without its own frame, e.g. inside an expanded list item. */
  readonly isBare?: boolean;
  /** Hide the type picker of a union whose type was chosen when it was added (blocks). */
  readonly isTypeLocked?: boolean;
}

export interface FormContextValue {
  readonly root: unknown;
  readonly onChange: (path: Path, value: unknown) => void;
  /** Validation messages keyed by pathId(path). */
  readonly issues: ReadonlyMap<string, readonly string[]>;
  readonly images: readonly string[];
  readonly uploadImage: (file: File) => Promise<string | null>;
  readonly Field: ComponentType<FieldProps>;
}

export const FormContext = createContext<FormContextValue | null>(null);

/** How many list items deep a field sits; drives each level's shade and edge colour. */
export const DepthContext = createContext(0);

export function useForm(): FormContextValue {
  const value = useContext(FormContext);
  if (!value)
    throw new Error(
      "Generated form fields must be rendered inside <FormContext>",
    );
  return value;
}

/** Number of problems at or below `prefix`, for badges on collapsed groups. */
export function issueCount(
  issues: ReadonlyMap<string, readonly string[]>,
  prefix: string,
): number {
  let total = 0;
  for (const [key, list] of issues)
    if (key === prefix || key.startsWith(`${prefix}.`) || prefix === "")
      total += list.length;
  return total;
}
