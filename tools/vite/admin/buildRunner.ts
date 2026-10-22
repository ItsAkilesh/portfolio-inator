/**
 * File: buildRunner.ts
 * Purpose: Runs `pnpm build` for the admin console's Publish page, one build at a time, and keeps
 *          its state and output so the page can poll it.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import { describeError, logger } from "../../../src/lib/logger";
import {
  MAX_LOG_LINES,
  packageScript,
  runProcess,
  type RunResult,
} from "./processRunner";

const BUILD_TIMEOUT_MS = 5 * 60 * 1000;

export type BuildState = "idle" | "running" | "passed" | "failed";

export interface BuildStatus {
  readonly state: BuildState;
  readonly lines: readonly string[];
  readonly startedAt: string | null;
  readonly durationMs: number | null;
}

type Runner = (onLine: (line: string) => void) => Promise<RunResult>;

export class BuildRunner {
  private status: BuildStatus = {
    state: "idle",
    lines: [],
    startedAt: null,
    durationMs: null,
  };
  private readonly live: string[] = [];

  constructor(private readonly run: Runner) {}

  static forProject(root: string): BuildRunner {
    const script = packageScript("build");
    return new BuildRunner((onLine) =>
      runProcess(script.command, script.args, {
        cwd: root,
        timeoutMs: BUILD_TIMEOUT_MS,
        useShell: script.useShell,
        onLine,
      }),
    );
  }

  current(): BuildStatus {
    return this.status.state === "running"
      ? { ...this.status, lines: [...this.live] }
      : this.status;
  }

  /** Starts a build unless one is running; returns false when it was already running. */
  start(): boolean {
    if (this.status.state === "running") return false;
    const started = Date.now();
    this.live.length = 0;
    this.status = {
      state: "running",
      lines: [],
      startedAt: new Date(started).toISOString(),
      durationMs: null,
    };
    this.run((line) => {
      this.live.push(line);
      if (this.live.length > MAX_LOG_LINES) this.live.shift();
    })
      .then((result) =>
        this.finish(
          started,
          result.code === 0 && !result.isTimedOut,
          result.lines,
        ),
      )
      .catch((error: unknown) =>
        this.finish(started, false, [describeError(error)]),
      );
    return true;
  }

  private finish(
    started: number,
    isPassed: boolean,
    lines: readonly string[],
  ): void {
    this.status = {
      state: isPassed ? "passed" : "failed",
      lines,
      startedAt: this.status.startedAt,
      durationMs: Date.now() - started,
    };
    logger.info(
      "admin.build",
      `build ${this.status.state} in ${this.status.durationMs} ms`,
    );
  }
}
