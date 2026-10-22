/**
 * File: AdminApp.tsx
 * Purpose: The dev-only admin console at /admin. Every editor is generated from the content schema;
 *          saving writes src/content/portfolio.json through the dev server. App.tsx only mounts this
 *          when import.meta.env.DEV is true, so builds contain none of it. This file is the shell:
 *          navigation, the editor or tool, the live preview, the save bar, search and shortcuts.
 * Author: Akilesh
 * Date: 2026-10-21 (updated 2026-10-22)
 */
import { useDeferredValue, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import type { Palette } from "../types/theme";
import { AdminContext } from "./AdminContext";
import { AdminNav } from "./AdminNav";
import { Editor } from "./Editor";
import { useShortcuts } from "./effects";
import { NoticeProvider } from "./notices";
import { Preview } from "./preview/Preview";
import { PreviewContext } from "./preview/PreviewContext";
import { RestoreBanner } from "./RestoreBanner";
import { SaveBar } from "./SaveBar";
import { CommandPalette } from "./search/CommandPalette";
import { sectionById } from "./sections";
import { useAdminContent } from "./useAdminContent";
import { validateDraft } from "./validation";
import styles from "./admin.module.css";

function AdminShell() {
  const { "*": splat } = useParams();
  const section = sectionById(splat?.split("/")[0]);
  const content = useAdminContent();
  const deferred = useDeferredValue(content.state.draft);
  const issues = useMemo(() => validateDraft(deferred), [deferred]);
  const [isSearching, setIsSearching] = useState(false);
  const [palette, setPalette] = useState<Palette | null>(null);
  const shortcuts = useMemo(
    () => ({
      save: () => void content.save(),
      undo: content.undo,
      redo: content.redo,
      search: () => setIsSearching(true),
    }),
    [content.save, content.undo, content.redo],
  );
  useShortcuts(shortcuts);
  const admin = useMemo(() => ({ content, issues }), [content, issues]);
  const preview = useMemo(() => ({ palette, setPalette }), [palette]);
  return (
    <AdminContext.Provider value={admin}>
      <PreviewContext.Provider value={preview}>
        <AdminNav issues={issues} onSearch={() => setIsSearching(true)} />
        <div className={styles.main}>
          <RestoreBanner />
          <Editor section={section} />
        </div>
        <Preview />
        <SaveBar />
        {isSearching && (
          <CommandPalette onClose={() => setIsSearching(false)} />
        )}
      </PreviewContext.Provider>
    </AdminContext.Provider>
  );
}

export default function AdminApp() {
  return (
    <div className={styles.admin}>
      <NoticeProvider>
        <AdminShell />
      </NoticeProvider>
    </div>
  );
}
