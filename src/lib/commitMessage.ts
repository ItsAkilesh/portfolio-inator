/**
 * File: commitMessage.ts
 * Purpose: The Conventional Commits rule for commit messages written in the admin console, shared by
 *          the page (immediate feedback) and the dev server (the check that counts).
 * Author: Akilesh
 * Date: 2026-10-21
 */
const COMMIT_MESSAGE =
  /^(feat|fix|chore|docs|refactor|test|perf|ci|style|build)(\([a-z0-9-]+\))?!?: \S.{0,99}$/;

export const DEFAULT_COMMIT_MESSAGE = "docs(content): update portfolio content";

export const isValidCommitMessage = (message: string): boolean =>
  COMMIT_MESSAGE.test(message);
