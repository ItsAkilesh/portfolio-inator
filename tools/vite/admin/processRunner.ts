/**
 * File: processRunner.ts
 * Purpose: Runs a fixed command for the admin API (build, git, the GitHub fetcher) without a shell,
 *          with a timeout and a bounded, ANSI-stripped output log. Arguments are passed as an array,
 *          so nothing a request sends is ever interpreted by a shell.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import { spawn } from "node:child_process";

export const MAX_LOG_LINES = 400;
/* ESC [ ... letter: colour and cursor codes. */
const ANSI = /\u001b\[[0-9;?]*[A-Za-z]/g;

export interface RunOptions {
  readonly cwd: string;
  readonly timeoutMs: number;
  readonly env?: NodeJS.ProcessEnv;
  readonly onLine?: (line: string) => void;
  /** Windows only: needed to start .cmd shims. Never combined with request data. */
  readonly useShell?: boolean;
}

export interface RunResult {
  readonly code: number | null;
  readonly isTimedOut: boolean;
  readonly lines: readonly string[];
}

export class LineLog {
  private readonly lines: string[] = [];
  private partial = "";

  constructor(private readonly onLine?: (line: string) => void) {}

  push(chunk: string): void {
    const parts = (this.partial + chunk.replace(ANSI, "")).split(/\r?\n/);
    this.partial = parts.pop() ?? "";
    for (const line of parts) this.add(line);
  }

  finish(): readonly string[] {
    if (this.partial) this.add(this.partial);
    this.partial = "";
    return [...this.lines];
  }

  private add(line: string): void {
    this.lines.push(line);
    if (this.lines.length > MAX_LOG_LINES) this.lines.shift();
    this.onLine?.(line);
  }
}

export function runProcess(
  command: string,
  args: readonly string[],
  options: RunOptions,
): Promise<RunResult> {
  return new Promise((resolve) => {
    const log = new LineLog(options.onLine);
    let isTimedOut = false;
    const child = spawn(command, [...args], {
      cwd: options.cwd,
      env: options.env ?? process.env,
      shell: options.useShell === true,
      windowsHide: true,
    });
    const timer = setTimeout(() => {
      isTimedOut = true;
      child.kill();
    }, options.timeoutMs);
    child.stdout.on("data", (chunk: Buffer) =>
      log.push(chunk.toString("utf8")),
    );
    child.stderr.on("data", (chunk: Buffer) =>
      log.push(chunk.toString("utf8")),
    );
    const done = (code: number | null) => {
      clearTimeout(timer);
      resolve({ code, isTimedOut, lines: log.finish() });
    };
    child.on("error", (error) => {
      log.push(`${error.message}\n`);
      done(null);
    });
    child.on("close", done);
  });
}

/** How to run a package.json script with the package manager that started the dev server. */
export function packageScript(script: string): {
  command: string;
  args: string[];
  useShell: boolean;
} {
  const execPath = process.env.npm_execpath;
  if (execPath && /\.(c?js|mjs)$/.test(execPath))
    return {
      command: process.execPath,
      args: [execPath, "run", script],
      useShell: false,
    };
  return {
    command: "pnpm",
    args: ["run", script],
    useShell: process.platform === "win32",
  };
}
