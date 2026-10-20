/**
 * File: projects.ts
 * Purpose: Projects page header and the language-to-icon map. The project list itself comes from
 *          src/shared/opensource/projects.json, which `pnpm fetch-data` regenerates from GitHub.
 * Author: Akilesh
 * Date: 2026-10-20
 */
import type { IconKey } from "../icons/registry";
import type { PageHeader } from "../types/portfolio";

export const projectsHeader: PageHeader & { readonly moreLink: string } = {
  title: "Projects",
  subtitle: "From GitHub",
  description: "Repositories from my GitHub, newest first.",
  moreLink: "https://github.com/itsakilesh",
};

/** GitHub language name to icon key. Languages missing here use the generic code icon. */
export const languageIcons: Readonly<Record<string, IconKey>> = {
  "C#": "csharp",
  CSS: "css",
  HTML: "html5",
  Java: "java",
  JavaScript: "javascript",
  "Jupyter Notebook": "jupyter",
  Python: "python",
  Rust: "rust",
  Shell: "shell",
  Swift: "swift",
  TypeScript: "typescript",
};
