/**
 * File: AdminApp.tsx
 * Purpose: The dev-only admin console at /admin. Every editor is generated from the content schema;
 *          saving writes src/content/portfolio.json through the dev server. App.tsx only mounts this
 *          when import.meta.env.DEV is true, so builds contain none of it.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import { useDeferredValue, useMemo } from "react";
import { useParams } from "react-router-dom";
import { portfolioSchema } from "../content/schema";
import { AdminNav } from "./AdminNav";
import { isDirty } from "./draft";
import { FormContext, type FormContextValue } from "./form/FormContext";
import { schemaAt } from "./form/introspect";
import { SchemaField } from "./form/SchemaField";
import { getIn } from "./paths";
import { Preview } from "./Preview";
import { SaveBar } from "./SaveBar";
import { sectionById, type AdminSection } from "./sections";
import { useAdminContent, type AdminContent } from "./useAdminContent";
import { validateDraft, type DraftIssues } from "./validation";
import styles from "./admin.module.css";

const previewPages = (saved: unknown) =>
  (
    (getIn(saved, ["pages"]) as
      | { path: string; label: string }[]
      | undefined) ?? []
  ).map((p) => ({ path: p.path, label: p.label }));

interface EditorProps {
  readonly section: AdminSection;
  readonly content: AdminContent;
  readonly issues: DraftIssues;
}

function Editor({ section, content, issues }: EditorProps) {
  const { draft } = content.state;
  const schema = draft
    ? schemaAt(portfolioSchema, section.path, draft)
    : undefined;
  const form: FormContextValue = {
    root: draft,
    onChange: content.edit,
    issues: issues.byPath,
    images: content.images,
    uploadImage: content.upload,
    Field: SchemaField,
  };
  return (
    <main className={styles.editor}>
      <h1 className={styles.heading}>{section.label}</h1>
      {schema && (
        <FormContext.Provider value={form}>
          <SchemaField
            schema={schema}
            path={section.path}
            label={section.label}
          />
        </FormContext.Provider>
      )}
    </main>
  );
}

export default function AdminApp() {
  const { "*": splat } = useParams();
  const section = sectionById(splat?.split("/")[0]);
  const content = useAdminContent();
  const { state } = content;
  const deferred = useDeferredValue(state.draft);
  const issues = useMemo(() => validateDraft(deferred), [deferred]);
  return (
    <div className={styles.admin}>
      <AdminNav issues={issues} />
      <Editor section={section} content={content} issues={issues} />
      <Preview pages={previewPages(state.saved)} />
      <SaveBar
        status={state.status}
        isDirty={isDirty(state)}
        problems={issues.all}
        serverIssues={state.serverIssues}
        onSave={() => void content.save()}
        onRevert={content.revert}
        onReload={() => void content.reload()}
      />
    </div>
  );
}
