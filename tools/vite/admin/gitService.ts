/**
 * File: gitService.ts
 * Purpose: Git for the admin console's Publish page: which content files changed, committing only
 *          those files with a Conventional Commits message, and pushing the current branch. Commands
 *          run without a shell, with fixed arguments; the message is validated before it is passed.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import { isValidCommitMessage } from "../../../src/lib/commitMessage";
import { runProcess, type RunResult } from "./processRunner";

/** Files the console writes; commits from the console include only these. */
export const CONTENT_PATHS = [
  "src/content/portfolio.json",
  "src/content/portfolio.schema.json",
  "src/icons/library.json",
  "src/icons/simpleIcons.generated.ts",
  "public/images",
] as const;

const GIT_TIMEOUT_MS = 60_000;
const BRANCH_LINE = /^## (.+?)(?:\.\.\.(\S+?))?(?: \[(.*)\])?$/;

export interface GitFile {
  readonly path: string;
  readonly status: string;
}

export interface GitStatus {
  readonly branch: string;
  readonly upstream: string | null;
  readonly ahead: number;
  readonly behind: number;
  readonly files: readonly GitFile[];
  readonly otherChanges: number;
  readonly repoUrl: string | null;
}

export type GitResult =
  | { readonly ok: true; readonly output: readonly string[] }
  | {
      readonly ok: false;
      readonly reason: string;
      readonly output?: readonly string[];
    };

const isContentPath = (path: string): boolean =>
  CONTENT_PATHS.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  );

/** Parses `git status --porcelain=v1 -b` output. */
export function parseStatus(
  lines: readonly string[],
): Omit<GitStatus, "repoUrl"> {
  const branch = BRANCH_LINE.exec(lines[0] ?? "");
  const counts = branch?.[3] ?? "";
  const files = lines
    .slice(1)
    .filter((line) => line.length > 3)
    .map((line) => ({
      status: line.slice(0, 2).trim(),
      path: line.slice(3).replace(/^"|"$/g, ""),
    }));
  return {
    branch: branch?.[1] ?? "HEAD",
    upstream: branch?.[2] ?? null,
    ahead: Number(/ahead (\d+)/.exec(counts)?.[1] ?? 0),
    behind: Number(/behind (\d+)/.exec(counts)?.[1] ?? 0),
    files: files.filter((file) => isContentPath(file.path)),
    otherChanges: files.filter((file) => !isContentPath(file.path)).length,
  };
}

/** Browser URL of the repository without credentials: SSH and HTTPS remotes become https://host/owner/repo. */
export function repoUrlOf(remote: string): string | null {
  const ssh = /^git@([^:]+):(.+?)(\.git)?$/.exec(remote.trim());
  if (ssh) return `https://${ssh[1]}/${ssh[2]}`;
  try {
    const url = new URL(remote.trim());
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    return `https://${url.host}${url.pathname.replace(/\.git$/, "")}`;
  } catch {
    return null;
  }
}

type Git = (args: readonly string[]) => Promise<RunResult>;

export class GitService {
  constructor(private readonly git: Git) {}

  static forProject(root: string): GitService {
    const env = { ...process.env, GIT_TERMINAL_PROMPT: "0" };
    return new GitService((args) =>
      runProcess("git", args, { cwd: root, timeoutMs: GIT_TIMEOUT_MS, env }),
    );
  }

  async status(): Promise<GitStatus | null> {
    const result = await this.git([
      "status",
      "--porcelain=v1",
      "-b",
      "--untracked-files=all",
    ]);
    if (result.code !== 0) return null;
    const remote = await this.git(["remote", "get-url", "origin"]);
    const url = remote.code === 0 ? repoUrlOf(remote.lines[0] ?? "") : null;
    return { ...parseStatus(result.lines), repoUrl: url };
  }

  async commit(message: string): Promise<GitResult> {
    if (!isValidCommitMessage(message))
      return {
        ok: false,
        reason:
          'Use a Conventional Commits message, e.g. "docs(content): update experience"',
      };
    const add = await this.git(["add", "-A", "--", ...CONTENT_PATHS]);
    if (add.code !== 0)
      return { ok: false, reason: "git add failed", output: add.lines };
    const commit = await this.git([
      "commit",
      "-m",
      message,
      "--",
      ...CONTENT_PATHS,
    ]);
    return commit.code === 0
      ? { ok: true, output: commit.lines }
      : {
          ok: false,
          reason: "Nothing to commit, or git refused the commit",
          output: commit.lines,
        };
  }

  async push(): Promise<GitResult> {
    const push = await this.git(["push", "origin", "HEAD"]);
    return push.code === 0
      ? { ok: true, output: push.lines }
      : {
          ok: false,
          reason: push.isTimedOut ? "git push timed out" : "git push failed",
          output: push.lines,
        };
  }
}
