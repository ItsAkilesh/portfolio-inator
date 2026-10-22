/**
 * File: CommandPalette.tsx
 * Purpose: Search dialog (Ctrl/Cmd+K) over sections, tools and every field of the draft. Enter or a
 *          click opens the section or jumps to the field, opening the list items on the way.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import {
  useId,
  useMemo,
  useState,
  type Dispatch,
  type KeyboardEvent,
  type SetStateAction,
} from "react";
import { useNavigate } from "react-router-dom";
import { portfolioSchema } from "../../content/schema";
import { useAdmin } from "../AdminContext";
import { useFocusField } from "../focus";
import { Modal } from "../Modal";
import { buildIndex, searchIndex, type SearchEntry } from "./searchIndex";
import ui from "../ui.module.css";
import pages from "../tools/toolPages.module.css";

const resultKey = (entry: SearchEntry): string =>
  entry.kind === "section"
    ? `s:${entry.sectionId}`
    : `f:${(entry.path ?? []).join(".")}`;

/** Opens a result: navigates to a section or focuses a field, closing the palette first. */
function useOpenEntry(onClose: () => void) {
  const navigate = useNavigate();
  const focusField = useFocusField();
  return (entry: SearchEntry | undefined) => {
    if (!entry) return;
    onClose();
    if (entry.kind === "section") navigate(`/admin/${entry.sectionId ?? ""}`);
    else if (entry.path) focusField(entry.path);
  };
}

function ResultList({
  listId,
  results,
  active,
  onHover,
  onOpen,
}: {
  readonly listId: string;
  readonly results: readonly SearchEntry[];
  readonly active: number;
  readonly onHover: (index: number) => void;
  readonly onOpen: (entry: SearchEntry) => void;
}) {
  return (
    <ul
      id={listId}
      role="listbox"
      className={pages.searchResults}
      aria-label="Results"
    >
      {results.length === 0 && <li className={ui.muted}>Nothing matches.</li>}
      {results.map((entry, i) => (
        <li
          key={resultKey(entry)}
          id={`${listId}-${i}`}
          role="option"
          aria-selected={i === active}
          className={pages.searchResult}
          onMouseEnter={() => onHover(i)}
          onClick={() => onOpen(entry)}
        >
          <span className={pages.searchTitle}>{entry.title}</span>
          <span className={ui.muted}>{entry.detail}</span>
        </li>
      ))}
    </ul>
  );
}

/** Search state: the query, its results and the highlighted result. */
function useSearch() {
  const { content } = useAdmin();
  const draft = content.state.draft;
  const index = useMemo(() => buildIndex(portfolioSchema, draft), [draft]);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const results = useMemo(() => searchIndex(index, query), [index, query]);
  const changeQuery = (next: string) => {
    setQuery(next);
    setActive(0);
  };
  return { query, changeQuery, active, setActive, results };
}

/** Arrow keys move the highlight within the results; Enter opens the highlighted one. */
function useResultKeys(
  results: readonly SearchEntry[],
  active: number,
  setActive: Dispatch<SetStateAction<number>>,
  open: (entry: SearchEntry | undefined) => void,
) {
  return (event: KeyboardEvent<HTMLInputElement>) => {
    const step =
      event.key === "ArrowDown" ? 1 : event.key === "ArrowUp" ? -1 : 0;
    if (step) {
      event.preventDefault();
      setActive((i) =>
        Math.min(Math.max(i + step, 0), Math.max(results.length - 1, 0)),
      );
    } else if (event.key === "Enter") {
      event.preventDefault();
      open(results[active]);
    }
  };
}

export function CommandPalette({ onClose }: { readonly onClose: () => void }) {
  const { query, changeQuery, active, setActive, results } = useSearch();
  const listId = useId();
  const open = useOpenEntry(onClose);
  const onKeyDown = useResultKeys(results, active, setActive, open);
  return (
    <Modal title="Search" onClose={onClose} isWide>
      <input
        className={ui.searchInput}
        role="combobox"
        aria-expanded="true"
        aria-controls={listId}
        aria-activedescendant={
          results.length ? `${listId}-${active}` : undefined
        }
        aria-label="Search sections and content"
        placeholder="Type a section, a name, a date, any text…"
        value={query}
        onChange={(e) => changeQuery(e.target.value)}
        onKeyDown={onKeyDown}
      />
      <ResultList
        listId={listId}
        results={results}
        active={active}
        onHover={setActive}
        onOpen={open}
      />
    </Modal>
  );
}
