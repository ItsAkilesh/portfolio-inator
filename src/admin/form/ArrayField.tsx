/**
 * File: ArrayField.tsx
 * Purpose: Generated editor for a list. Plain values (strings, numbers) are inline rows; objects and
 *          blocks are collapsible items titled by their kind and summary, shaded by nesting depth.
 *          Items can be added (with a block palette or templates), inserted between others,
 *          dragged, moved, duplicated and removed. Items on the way to a focused field open.
 * Author: Akilesh
 * Date: 2026-10-21 (updated 2026-10-22)
 */
import {
  Fragment,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { z } from "zod";
import {
  arrayElement,
  kindOf,
  metaOf,
  titleOf,
} from "../../content/introspect";
import { useIsOnFocusPath, useMarkFocus } from "../focus";
import { getIn, moveItem, pathId, removeAt, type Path } from "../paths";
import { AddItem, InsertHere } from "./AddItem";
import { duplicateAt } from "./duplicate";
import { DepthContext, useForm, type FieldProps } from "./FormContext";
import { Disclosure } from "./Disclosure";
import { Group } from "./Group";
import { ItemControls, summaryOf } from "./listParts";
import { useListDrag } from "./useListDrag";
import listStyles from "./listItems.module.css";

const NESTED_KINDS: ReadonlySet<string> = new Set([
  "object",
  "union",
  "array",
  "record",
]);
/** Nesting levels get distinct shades; deeper levels cycle. */
const DEPTH_SHADES = 4;

interface ItemProps {
  readonly element: z.ZodType;
  readonly item: unknown;
  readonly itemPath: Path;
  readonly index: number;
  readonly controls: ReactNode;
  readonly dragProps: Record<string, unknown>;
}

function ScalarItem({
  element,
  itemPath,
  index,
  controls,
  dragProps,
}: ItemProps) {
  const { Field } = useForm();
  return (
    <div className={listStyles.row} data-path={pathId(itemPath)} {...dragProps}>
      <Field
        schema={element}
        path={itemPath}
        label={`${titleOf(element, "item")} ${index + 1}`}
      />
      {controls}
    </div>
  );
}

function NestedItem({
  element,
  item,
  itemPath,
  index,
  controls,
  dragProps,
}: ItemProps) {
  const { Field } = useForm();
  const depth = useContext(DepthContext);
  const isOnFocusPath = useIsOnFocusPath(itemPath);
  const markFocus = useMarkFocus();
  const [isOpen, setIsOpen] = useState(isOnFocusPath);
  useEffect(() => {
    if (isOnFocusPath) setIsOpen(true);
  }, [isOnFocusPath]);
  /* Opening an item makes it the focus, so the preview follows and the URL links back to it. */
  const toggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen && !isOnFocusPath) markFocus(itemPath);
  };
  const summary = summaryOf(element, item, index);
  return (
    <Disclosure
      path={itemPath}
      title={summary}
      chip={metaOf(element).title}
      depth={depth % DEPTH_SHADES}
      isOpen={isOpen}
      onToggle={toggle}
      controls={controls}
      frameProps={dragProps}
    >
      <DepthContext.Provider value={depth + 1}>
        <Field
          schema={element}
          path={itemPath}
          label={summary}
          isBare
          isTypeLocked
        />
      </DepthContext.Provider>
    </Disclosure>
  );
}

type ListDrag = ReturnType<typeof useListDrag>;

interface RowProps {
  readonly element: z.ZodType;
  readonly items: readonly unknown[];
  readonly item: unknown;
  readonly index: number;
  readonly path: Path;
  readonly drag: ListDrag;
  readonly set: (next: unknown[]) => void;
  readonly onInsert: (index: number, value: unknown) => void;
}

/** One list item, preceded by an insert point for block lists. */
function ArrayRow(props: RowProps) {
  const { element, items, item, index, path, drag, set, onInsert } = props;
  const isNested = NESTED_KINDS.has(kindOf(element));
  const isUnion = kindOf(element) === "union";
  const Item = isNested ? NestedItem : ScalarItem;
  return (
    <Fragment>
      {isUnion && index > 0 && (
        <InsertHere
          element={element}
          onInsert={(value) => onInsert(index, value)}
        />
      )}
      <Item
        element={element}
        item={item}
        itemPath={[...path, index]}
        index={index}
        dragProps={drag.itemProps(index)}
        controls={
          <ItemControls
            index={index}
            total={items.length}
            label={
              isNested
                ? summaryOf(element, item, index)
                : `${titleOf(element, "item")} ${index + 1}`
            }
            onMove={(to) => set(moveItem(items, index, to))}
            onDuplicate={() => set(duplicateAt(items, index, element))}
            onRemove={() => set(removeAt(items, index))}
            handleProps={drag.handleProps(index)}
          />
        }
      />
    </Fragment>
  );
}

export function ArrayField({ schema, path, label }: FieldProps) {
  const { root, onChange } = useForm();
  const items = (getIn(root, path) as unknown[] | undefined) ?? [];
  const element = arrayElement(schema);
  const set = (next: unknown[]) => onChange(path, next);
  const drag = useListDrag(pathId(path), (from, to) =>
    set(moveItem(items, from, to)),
  );
  const insertAt = (index: number, value: unknown) =>
    set([...items.slice(0, index), value, ...items.slice(index)]);
  return (
    <Group
      label={label}
      description={metaOf(schema).description}
      path={path}
      count={items.length}
    >
      {items.map((item, index) => (
        <ArrayRow
          key={index}
          element={element}
          items={items}
          item={item}
          index={index}
          path={path}
          drag={drag}
          set={set}
          onInsert={insertAt}
        />
      ))}
      <AddItem
        element={element}
        items={items}
        onAdd={(value) => set([...items, value])}
      />
    </Group>
  );
}
