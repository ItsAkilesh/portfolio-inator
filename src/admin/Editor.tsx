/**
 * File: Editor.tsx
 * Purpose: The main area of the admin console: a generated form for form sections (with an optional
 *          panel above it, such as the SEO preview), or a tool page. Jumps to focused fields.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import { Suspense, useState } from "react";
import { Link } from "react-router-dom";
import { portfolioSchema } from "../content/schema";
import { schemaAt } from "../content/introspect";
import { useAdmin } from "./AdminContext";
import { useRevealFocus } from "./focus";
import { FormContext } from "./form/FormContext";
import { SchemaField } from "./form/SchemaField";
import { useDraftForm } from "./form/useDraftForm";
import type { AdminSection, FormSection } from "./sections";
import { PANELS, TOOLS } from "./views";
import styles from "./admin.module.css";
import ui from "./ui.module.css";

function SectionForm({ section }: { readonly section: FormSection }) {
  const { content } = useAdmin();
  const { draft } = content.state;
  const schema = draft
    ? schemaAt(portfolioSchema, section.path, draft)
    : undefined;
  const Panel = section.panel ? PANELS[section.panel] : null;
  const form = useDraftForm();
  return (
    <>
      {Panel && draft !== null && <Panel />}
      {schema && (
        <FormContext.Provider value={form}>
          <SchemaField
            schema={schema}
            path={section.path}
            label={section.label}
            isBare
          />
        </FormContext.Provider>
      )}
    </>
  );
}

export function Editor({ section }: { readonly section: AdminSection }) {
  const [container, setContainer] = useState<HTMLElement | null>(null);
  useRevealFocus(container);
  const Tool = section.kind === "tool" ? TOOLS[section.tool] : null;
  return (
    <main className={styles.editor} ref={setContainer}>
      <div className={styles.headingRow}>
        <h1 className={styles.heading}>{section.label}</h1>
        {section.doc && (
          <Link
            className={styles.helpLink}
            to={`/admin/docs?doc=${section.doc}`}
          >
            Guide
          </Link>
        )}
      </div>
      <Suspense fallback={<p className={ui.muted}>Loading…</p>}>
        {Tool ? (
          <Tool />
        ) : (
          section.kind === "form" && <SectionForm section={section} />
        )}
      </Suspense>
    </main>
  );
}
