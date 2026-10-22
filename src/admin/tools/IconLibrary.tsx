/**
 * File: IconLibrary.tsx
 * Purpose: Icons tool: the icons in the library with how often the content uses each, search across
 *          all of simple-icons to add more, SVG import for anything else, and removal of unused ones.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import { useEffect, useState } from "react";
import { BrandIcon } from "../../icons/BrandIcon";
import { ICONS, isIconKey } from "../../icons/registry";
import { useAdmin } from "../AdminContext";
import {
  iconUsage,
  removeIcon,
  searchIcons,
  type CatalogIcon,
  type IconUsage,
} from "../api/assets";
import { ImportSvgDialog } from "../icons/ImportSvgDialog";
import { useIconImport } from "../icons/useIconImport";
import { writeStash } from "../draftStash";
import { useNotify } from "../notices";
import ui from "../ui.module.css";
import pages from "./toolPages.module.css";

const SEARCH_LIMIT = 48;
const SEARCH_DELAY_MS = 200;
const ICON_SIZE = 24;
const ICON_VIEW_BOX = `0 0 ${ICON_SIZE} ${ICON_SIZE}`;

function useCatalogSearch(query: string) {
  const [results, setResults] = useState<readonly CatalogIcon[]>([]);
  useEffect(() => {
    let isCurrent = true;
    const timer = setTimeout(() => {
      void searchIcons(query, SEARCH_LIMIT).then(
        (r) => isCurrent && r.ok && setResults(r.data.results),
      );
    }, SEARCH_DELAY_MS);
    return () => {
      isCurrent = false;
      clearTimeout(timer);
    };
  }, [query]);
  return results;
}

function LibraryGrid({
  usage,
  onRemove,
}: {
  readonly usage: IconUsage | null;
  readonly onRemove: (key: string) => void;
}) {
  const keys = Object.keys(ICONS).sort();
  return (
    <ul className={pages.iconGrid} aria-label="Icons in the library">
      {keys.map((key) => {
        const uses = usage?.usage[key] ?? 0;
        const isProtected = usage?.protected.includes(key) ?? true;
        return (
          <li key={key} className={pages.iconCell}>
            {isIconKey(key) && <BrandIcon name={key} size={ICON_SIZE} />}
            <span>{key}</span>
            <span className={ui.muted}>
              {isProtected ? "site" : uses === 0 ? "unused" : `${uses}×`}
            </span>
            {!isProtected && uses === 0 && (
              <button
                type="button"
                className={ui.iconButton}
                aria-label={`Remove ${key}`}
                onClick={() => onRemove(key)}
              >
                ✕
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function useIconUsage(): IconUsage | null {
  const [usage, setUsage] = useState<IconUsage | null>(null);
  useEffect(() => {
    void iconUsage().then((r) => r.ok && setUsage(r.data));
  }, []);
  return usage;
}

function useIconRemoval() {
  const notify = useNotify();
  const { content } = useAdmin();
  return async (key: string) => {
    /* The library change reloads the console; keep unsaved edits across it. */
    writeStash(content.state.draft, content.state.version, "set");
    const result = await removeIcon(key);
    if (!result.ok) {
      writeStash(content.state.draft, content.state.version, "clear");
      return notify(result.issues.join("; "), "error");
    }
    notify(`Removed "${key}"`);
    window.location.reload();
  };
}

function CatalogResults({
  results,
  isBusy,
  onAdd,
}: {
  readonly results: readonly CatalogIcon[];
  readonly isBusy: boolean;
  readonly onAdd: (slug: string) => void;
}) {
  if (results.length === 0) return null;
  return (
    <ul className={pages.iconGrid} aria-label="simple-icons results">
      {results.map((icon) => (
        <li key={icon.slug} className={pages.iconCell}>
          <svg
            width={ICON_SIZE}
            height={ICON_SIZE}
            viewBox={ICON_VIEW_BOX}
            aria-hidden="true"
          >
            <path d={icon.path} fill="currentColor" />
          </svg>
          <span>{icon.title}</span>
          {icon.key ? (
            <span className={ui.muted}>in library</span>
          ) : (
            <button
              type="button"
              className={ui.secondary}
              disabled={isBusy}
              onClick={() => onAdd(icon.slug)}
            >
              Add
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}

function SearchToolbar({
  query,
  onQuery,
  onImport,
}: {
  readonly query: string;
  readonly onQuery: (query: string) => void;
  readonly onImport: () => void;
}) {
  return (
    <div className={ui.toolbar}>
      <input
        className={ui.searchInput}
        aria-label="Search simple-icons"
        placeholder="Search 3,400+ brand icons, e.g. kotlin"
        value={query}
        onChange={(e) => onQuery(e.target.value)}
      />
      <button type="button" className={ui.secondary} onClick={onImport}>
        Import SVG
      </button>
    </div>
  );
}

export default function IconLibrary() {
  const icons = useIconImport();
  const usage = useIconUsage();
  const remove = useIconRemoval();
  const [query, setQuery] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const results = useCatalogSearch(query);
  return (
    <div className={ui.tool}>
      <SearchToolbar
        query={query}
        onQuery={setQuery}
        onImport={() => setIsImporting(true)}
      />
      <CatalogResults
        results={results}
        isBusy={icons.isBusy}
        onAdd={(slug) => void icons.addFromCatalog(slug, null)}
      />
      <h2 className={ui.panelTitle}>Library ({Object.keys(ICONS).length})</h2>
      <LibraryGrid usage={usage} onRemove={(key) => void remove(key)} />
      {isImporting && (
        <ImportSvgDialog
          isBusy={icons.isBusy}
          onClose={() => setIsImporting(false)}
          onImport={(input) => void icons.importSvg(input, null)}
        />
      )}
    </div>
  );
}
