/**
 * File: useListDrag.ts
 * Purpose: Drag-and-drop reordering for one generated list, with native HTML drag events. Only the
 *          handle is draggable (so selecting text in fields still works), the whole item is shown
 *          as the drag image, and drops are accepted only from the same list. The move buttons
 *          remain for keyboard users.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import {
  useState,
  type Dispatch,
  type DragEvent,
  type SetStateAction,
} from "react";

export const DRAG_TYPE = "application/x-portfolio-item";

export interface DropTarget {
  readonly index: number;
  readonly side: "before" | "after";
}

/** Index the dragged item lands at after removal from `from`. */
export function dropIndex(from: number, target: DropTarget): number {
  const raw = target.side === "after" ? target.index + 1 : target.index;
  return raw > from ? raw - 1 : raw;
}

const carries = (event: DragEvent<HTMLElement>): boolean =>
  Array.from(event.dataTransfer.types).includes(DRAG_TYPE);

/** Which half of the item the pointer is over. */
function sideOf(event: DragEvent<HTMLElement>): DropTarget["side"] {
  const box = event.currentTarget.getBoundingClientRect();
  return event.clientY > box.top + box.height / 2 ? "after" : "before";
}

/** Offset of the pointer inside the drag image, in pixels. */
const DRAG_IMAGE_OFFSET = 16;

type SetOver = Dispatch<SetStateAction<DropTarget | null>>;

/** Shows the drop marker on the hovered half of the item. */
function handleDragOver(
  event: DragEvent<HTMLElement>,
  index: number,
  setOver: SetOver,
): void {
  if (!carries(event)) return;
  event.preventDefault();
  event.stopPropagation();
  const box = event.currentTarget.getBoundingClientRect();
  setOver({
    index,
    side: event.clientY > box.top + box.height / 2 ? "after" : "before",
  });
}

/** Moves the dropped item when it came from the same list. */
function handleDrop(
  event: DragEvent<HTMLElement>,
  index: number,
  listId: string,
  onMove: (from: number, to: number) => void,
): void {
  const [list, from] = event.dataTransfer.getData(DRAG_TYPE).split(":");
  if (list !== listId || from === undefined) return;
  /* Measured on the drop itself: the last dragover's state may not have rendered yet. */
  const target: DropTarget = { index, side: sideOf(event) };
  event.preventDefault();
  event.stopPropagation();
  const fromIndex = Number(from);
  const to = dropIndex(fromIndex, target);
  if (to !== fromIndex) onMove(fromIndex, to);
}

/** Starts a drag from the handle, carrying the list id and index. */
function handleDragStart(
  event: DragEvent<HTMLElement>,
  index: number,
  listId: string,
): void {
  event.stopPropagation();
  event.dataTransfer.setData(DRAG_TYPE, `${listId}:${index}`);
  event.dataTransfer.effectAllowed = "move";
  const item = event.currentTarget.closest<HTMLElement>("[data-path]");
  if (item)
    event.dataTransfer.setDragImage?.(
      item,
      DRAG_IMAGE_OFFSET,
      DRAG_IMAGE_OFFSET,
    );
}

export function useListDrag(
  listId: string,
  onMove: (from: number, to: number) => void,
) {
  const [over, setOver] = useState<DropTarget | null>(null);
  const itemProps = (index: number) => ({
    "data-drop": over?.index === index ? over.side : undefined,
    onDragOver: (event: DragEvent<HTMLElement>) =>
      handleDragOver(event, index, setOver),
    onDragLeave: () =>
      setOver((current) => (current?.index === index ? null : current)),
    onDrop: (event: DragEvent<HTMLElement>) => {
      setOver(null);
      handleDrop(event, index, listId, onMove);
    },
  });
  const handleProps = (index: number) => ({
    draggable: true,
    onDragStart: (event: DragEvent<HTMLElement>) =>
      handleDragStart(event, index, listId),
    onDragEnd: () => setOver(null),
  });
  return { itemProps, handleProps };
}
