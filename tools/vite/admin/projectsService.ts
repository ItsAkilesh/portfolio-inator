/**
 * File: projectsService.ts
 * Purpose: GitHub repositories for the admin console's Projects page: runs git_data_fetcher.mjs
 *          (which reads its token from .env itself; the token never passes through the API) and
 *          lists the repositories it wrote, validated by the same parser the site uses.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import { readFile } from "node:fs/promises";
import { parseProjects } from "../../../src/lib/projects";
import type { Project } from "../../../src/types/portfolio";
import { SerialQueue } from "../fsAtomic";
import { runProcess, type RunResult } from "./processRunner";

const FETCH_TIMEOUT_MS = 90_000;

export interface FetchOutcome {
  readonly ok: boolean;
  readonly lines: readonly string[];
}

type Fetcher = () => Promise<RunResult>;

export class ProjectsService {
  private readonly queue = new SerialQueue();

  constructor(
    private readonly projectsFile: string,
    private readonly fetcher: Fetcher,
  ) {}

  static forProject(
    root: string,
    projectsFile: string,
    script: string,
  ): ProjectsService {
    return new ProjectsService(projectsFile, () =>
      runProcess(process.execPath, [script], {
        cwd: root,
        timeoutMs: FETCH_TIMEOUT_MS,
      }),
    );
  }

  async list(): Promise<Project[]> {
    const text = await readFile(this.projectsFile, "utf8").catch(
      () => '{"data":[]}',
    );
    return parseProjects(JSON.parse(text) as unknown);
  }

  /** One fetch at a time; a second request waits for the first. */
  fetch(): Promise<FetchOutcome> {
    return this.queue.run(async () => {
      const result = await this.fetcher();
      return {
        ok: result.code === 0 && !result.isTimedOut,
        lines: result.lines,
      };
    });
  }
}
