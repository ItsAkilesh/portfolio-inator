/**
 * File: TimelineBlock.tsx
 * Purpose: "timeline" block: one tab per group (Work, Volunteering, ...) when there is more than one.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import { useState } from "react";
import { SegmentedControl } from "../components/ui/SegmentedControl";
import { TimelineList } from "../sections/TimelineList";
import type { BlockOf } from "../types/portfolio";

const TABS_STYLE = { marginBottom: 32 } as const;
const TABS_LABEL = "Sections";

export default function TimelineBlock({
  block,
}: {
  readonly block: BlockOf<"timeline">;
}) {
  const { groups } = block;
  const [active, setActive] = useState(groups[0]?.title ?? "");
  const group = groups.find((item) => item.title === active) ?? groups[0];
  const options = groups.map((item) => ({
    value: item.title,
    label: `${item.title} · ${item.entries.length}`,
  }));
  return (
    <>
      {options.length > 1 && (
        <div style={TABS_STYLE}>
          <SegmentedControl
            label={TABS_LABEL}
            options={options}
            value={active}
            onChange={setActive}
          />
        </div>
      )}
      {group && <TimelineList key={group.title} entries={group.entries} />}
    </>
  );
}
