/**
 * File: logger.ts
 * Purpose: Project logger. Leveled, timestamped, silent below WARN in production builds.
 * Author: Akilesh
 * Date: 2026-10-20
 */
export type LogLevel = "DEBUG" | "INFO" | "WARN" | "ERROR";

const LEVEL_RANK: Record<LogLevel, number> = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};
const MIN_LEVEL: LogLevel = import.meta.env.PROD ? "WARN" : "DEBUG";

export interface LogEntry {
  readonly timestamp: string;
  readonly level: LogLevel;
  readonly operation: string;
  readonly outcome: string;
}

type Sink = (entry: LogEntry) => void;

/* The browser console is this client-only site's only sink; entries never contain secrets or PII. */
const consoleSink: Sink = (entry) => {
  const line = `[${entry.timestamp}] ${entry.level} ${entry.operation}: ${entry.outcome}`;
  if (entry.level === "ERROR") console.error(line);
  else if (entry.level === "WARN") console.warn(line);
  else console.info(line);
};

let activeSink: Sink = consoleSink;

/** Replaces the sink; used by tests. */
export function setLogSink(sink: Sink): void {
  activeSink = sink;
}

export function log(level: LogLevel, operation: string, outcome: string): void {
  if (LEVEL_RANK[level] < LEVEL_RANK[MIN_LEVEL]) return;
  activeSink({
    timestamp: new Date().toISOString(),
    level,
    operation,
    outcome,
  });
}

export const logger = {
  debug: (operation: string, outcome: string) =>
    log("DEBUG", operation, outcome),
  info: (operation: string, outcome: string) => log("INFO", operation, outcome),
  warn: (operation: string, outcome: string) => log("WARN", operation, outcome),
  error: (operation: string, outcome: string) =>
    log("ERROR", operation, outcome),
};

/** Safe, short description of an unknown thrown value (no stack traces). */
export function describeError(error: unknown): string {
  if (error instanceof Error) return error.message;
  return typeof error === "string" ? error : "unknown error";
}
