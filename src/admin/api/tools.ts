/**
 * File: tools.ts
 * Purpose: Admin API calls for GitHub projects, build, git and link checks.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import type { Project } from "../../types/portfolio";
import { postJson, request } from "./client";

export interface BuildStatus {
  readonly state: "idle" | "running" | "passed" | "failed";
  readonly lines: readonly string[];
  readonly startedAt: string | null;
  readonly durationMs: number | null;
}

export interface GitStatus {
  readonly branch: string;
  readonly upstream: string | null;
  readonly ahead: number;
  readonly behind: number;
  readonly files: readonly { readonly path: string; readonly status: string }[];
  readonly otherChanges: number;
  readonly repoUrl: string | null;
}

export interface LinkResult {
  readonly url: string;
  readonly ok: boolean;
  readonly status: number | null;
  readonly reason?: string;
}

export const listProjects = () => request<{ projects: Project[] }>("/projects");
export const fetchProjects = () =>
  request<{ ok: boolean; lines: string[]; projects: Project[] }>(
    "/projects/fetch",
    postJson({}),
  );

export const buildStatus = () => request<BuildStatus>("/build");
export const startBuild = () => request<BuildStatus>("/build", postJson({}));

export const gitStatus = () => request<GitStatus>("/git");
export const gitCommit = (message: string) =>
  request<{ output: string[] }>("/git/commit", postJson({ message }));
export const gitPush = () =>
  request<{ output: string[] }>("/git/push", postJson({}));

export const checkLinks = (urls: readonly string[]) =>
  request<{ results: LinkResult[] }>("/health/links", postJson({ urls }));
