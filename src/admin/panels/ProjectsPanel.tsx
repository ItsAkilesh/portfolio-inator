/**
 * File: ProjectsPanel.tsx
 * Purpose: Projects section panel: fetch repositories from GitHub (runs git_data_fetcher.mjs, which
 *          reads its token from .env) and choose which ones the site shows, in which order. With
 *          none chosen the site shows the pinned repositories.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import { useCallback, useEffect, useState } from "react";
import type { Project } from "../../types/portfolio";
import { useAdmin } from "../AdminContext";
import { fetchProjects, listProjects } from "../api/tools";
import { useNotify } from "../notices";
import { getIn, moveItem } from "../paths";
import ui from "../ui.module.css";
import pages from "../tools/toolPages.module.css";

const FEATURED_PATH = ["site", "projects", "featured"] as const;

function useRepositories() {
  const notify = useNotify();
  const [projects, setProjects] = useState<readonly Project[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [log, setLog] = useState<readonly string[]>([]);
  useEffect(() => {
    void listProjects().then((r) => r.ok && setProjects(r.data.projects));
  }, []);
  const fetchNow = useCallback(async () => {
    setIsFetching(true);
    const result = await fetchProjects();
    setIsFetching(false);
    if (result.ok) {
      setProjects(result.data.projects);
      setLog(result.data.lines);
      notify(`Fetched ${result.data.projects.length} repositories`);
    } else {
      setLog(result.issues);
      notify("Fetching from GitHub failed; see the log", "error");
    }
  }, [notify]);
  return { projects, isFetching, log, fetchNow };
}

function RepoRow({
  project,
  isChosen,
  onToggle,
}: {
  readonly project: Project;
  readonly isChosen: boolean;
  readonly onToggle: () => void;
}) {
  return (
    <li className={pages.repoRow}>
      <label className={ui.checkLabel}>
        <input type="checkbox" checked={isChosen} onChange={onToggle} />
        {project.name}
      </label>
      {project.isPinned && <span className={ui.tag}>Pinned</span>}
      <span className={ui.muted}>★ {project.stars}</span>
      <span className={ui.muted}>{project.description}</span>
    </li>
  );
}

/** The chosen repository names from the draft, with setters that record an edit. */
function useFeatured() {
  const { content } = useAdmin();
  const featured =
    (getIn(content.state.draft, [...FEATURED_PATH]) as string[] | undefined) ??
    [];
  const setFeatured = (next: string[]) =>
    content.edit([...FEATURED_PATH], next);
  const toggle = (name: string) =>
    setFeatured(
      featured.includes(name)
        ? featured.filter((n) => n !== name)
        : [...featured, name],
    );
  return { featured, setFeatured, toggle };
}

function FetchBar({
  isFetching,
  chosenCount,
  onFetch,
}: {
  readonly isFetching: boolean;
  readonly chosenCount: number;
  readonly onFetch: () => void;
}) {
  return (
    <div className={ui.actions}>
      <button
        type="button"
        className={ui.primary}
        disabled={isFetching}
        onClick={onFetch}
      >
        {isFetching ? "Fetching…" : "Fetch from GitHub"}
      </button>
      <span className={ui.muted}>
        {chosenCount === 0
          ? "None chosen: the site shows your pinned repositories."
          : `${chosenCount} chosen, shown in this order:`}
      </span>
    </div>
  );
}

function OrderRow({
  name,
  index,
  featured,
  onChange,
}: {
  readonly name: string;
  readonly index: number;
  readonly featured: readonly string[];
  readonly onChange: (next: string[]) => void;
}) {
  return (
    <li>
      {name}
      <button
        type="button"
        className={ui.iconButton}
        aria-label={`Move ${name} up`}
        disabled={index === 0}
        onClick={() => onChange(moveItem(featured, index, index - 1))}
      >
        ↑
      </button>
      <button
        type="button"
        className={ui.iconButton}
        aria-label={`Move ${name} down`}
        disabled={index === featured.length - 1}
        onClick={() => onChange(moveItem(featured, index, index + 1))}
      >
        ↓
      </button>
    </li>
  );
}

function OrderList({
  featured,
  onChange,
}: {
  readonly featured: readonly string[];
  readonly onChange: (next: string[]) => void;
}) {
  if (featured.length === 0) return null;
  return (
    <ol className={pages.orderList} aria-label="Chosen repositories in order">
      {featured.map((name, i) => (
        <OrderRow
          key={name}
          name={name}
          index={i}
          featured={featured}
          onChange={onChange}
        />
      ))}
    </ol>
  );
}

function FetchedList({
  projects,
  featured,
  onToggle,
}: {
  readonly projects: readonly Project[];
  readonly featured: readonly string[];
  readonly onToggle: (name: string) => void;
}) {
  return (
    <ul className={pages.repoList} aria-label="Fetched repositories">
      {projects.length === 0 && (
        <li className={ui.muted}>
          No repositories yet. Add GITHUB_TOKEN and GITHUB_USERNAME to .env,
          then fetch.
        </li>
      )}
      {projects.map((project) => (
        <RepoRow
          key={project.id}
          project={project}
          isChosen={featured.includes(project.name)}
          onToggle={() => onToggle(project.name)}
        />
      ))}
    </ul>
  );
}

export default function ProjectsPanel() {
  const repos = useRepositories();
  const { featured, setFeatured, toggle } = useFeatured();
  const missing = featured.filter(
    (name) => !repos.projects.some((p) => p.name === name),
  );
  return (
    <section className={ui.panel} aria-label="GitHub repositories">
      <h2 className={ui.panelTitle}>Repositories</h2>
      <FetchBar
        isFetching={repos.isFetching}
        chosenCount={featured.length}
        onFetch={() => void repos.fetchNow()}
      />
      <OrderList featured={featured} onChange={setFeatured} />
      {missing.length > 0 && (
        <p className={ui.warning}>
          Not in the fetched data: {missing.join(", ")}. Fetch again or remove
          them.
        </p>
      )}
      <FetchedList
        projects={repos.projects}
        featured={featured}
        onToggle={toggle}
      />
      {repos.log.length > 0 && (
        <pre className={ui.log}>{repos.log.join("\n")}</pre>
      )}
    </section>
  );
}
