/**
 * File: PublishTool.tsx
 * Purpose: Build and publish tool: run `pnpm build` and watch its output, then see the content files
 *          git reports as changed, commit them with a Conventional Commits message and push. Pushing
 *          to main runs the deploy workflow, linked from here.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import { useCallback, useEffect, useState } from "react";
import {
  buildStatus,
  gitCommit,
  gitPush,
  gitStatus,
  startBuild,
  type BuildStatus,
  type GitStatus,
} from "../api/tools";
import {
  DEFAULT_COMMIT_MESSAGE as DEFAULT_MESSAGE,
  isValidCommitMessage,
} from "../../lib/commitMessage";
import { useNotify } from "../notices";
import styles from "../admin.module.css";
import ui from "../ui.module.css";
import pages from "./toolPages.module.css";

const POLL_MS = 1000;
const MS_PER_SECOND = 1000;

function useBuild() {
  const [status, setStatus] = useState<BuildStatus | null>(null);
  const isRunning = status?.state === "running";
  useEffect(() => {
    void buildStatus().then((r) => r.ok && setStatus(r.data));
  }, []);
  useEffect(() => {
    if (!isRunning) return undefined;
    const timer = setInterval(
      () => void buildStatus().then((r) => r.ok && setStatus(r.data)),
      POLL_MS,
    );
    return () => clearInterval(timer);
  }, [isRunning]);
  const start = async () => {
    const result = await startBuild();
    if (result.ok) setStatus(result.data);
  };
  return { status, isRunning, start };
}

function BuildPanel() {
  const build = useBuild();
  const s = build.status;
  return (
    <section className={ui.panel} aria-label="Build">
      <h2 className={ui.panelTitle}>Build</h2>
      <div className={ui.actions}>
        <button
          type="button"
          className={ui.primary}
          disabled={build.isRunning}
          onClick={() => void build.start()}
        >
          {build.isRunning ? "Building…" : "Run pnpm build"}
        </button>
        {s && s.state !== "idle" && (
          <span
            className={styles.status}
            data-status={s.state === "failed" ? "error" : undefined}
          >
            {s.state}
            {s.durationMs !== null &&
              ` in ${(s.durationMs / MS_PER_SECOND).toFixed(1)} s`}
          </span>
        )}
      </div>
      {s && s.lines.length > 0 && (
        <pre className={ui.log} aria-label="Build output">
          {s.lines.join("\n")}
        </pre>
      )}
    </section>
  );
}

function useGit() {
  const notify = useNotify();
  const [status, setStatus] = useState<GitStatus | null>(null);
  const [problem, setProblem] = useState("");
  const [output, setOutput] = useState<readonly string[]>([]);
  const refresh = useCallback(async () => {
    const result = await gitStatus();
    setStatus(result.ok ? result.data : null);
    setProblem(result.ok ? "" : result.issues.join("; "));
  }, []);
  useEffect(() => {
    void refresh();
  }, [refresh]);
  const act = async (label: string, call: () => ReturnType<typeof gitPush>) => {
    const result = await call();
    setOutput(result.ok ? result.data.output : result.issues);
    notify(
      result.ok ? `${label} done` : `${label} failed`,
      result.ok ? "info" : "error",
    );
    await refresh();
  };
  return { status, problem, output, refresh, act };
}

type Git = ReturnType<typeof useGit>;

function StatusSummary({ status: s }: { readonly status: GitStatus }) {
  return (
    <>
      <p className={ui.muted}>
        Branch {s.branch}
        {s.upstream && ` · ${s.ahead} to push, ${s.behind} to pull`}
        {s.otherChanges > 0 &&
          ` · ${s.otherChanges} other changed file(s) are left out`}
      </p>
      <ul className={pages.fileList} aria-label="Changed content files">
        {s.files.length === 0 && (
          <li className={ui.muted}>No content changes to commit.</li>
        )}
        {s.files.map((f) => (
          <li key={f.path}>
            <code>{f.status}</code> {f.path}
          </li>
        ))}
      </ul>
    </>
  );
}

function MessageField({
  message,
  onChange,
  isValid,
}: {
  readonly message: string;
  readonly onChange: (message: string) => void;
  readonly isValid: boolean;
}) {
  return (
    <>
      <label className={ui.pickRow}>
        Message
        <input
          className={ui.textInput}
          value={message}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={!isValid}
        />
      </label>
      {!isValid && (
        <p className={ui.warning}>
          Use type(scope): description, e.g. {DEFAULT_MESSAGE}
        </p>
      )}
    </>
  );
}

function GitActions({
  git,
  status: s,
  message,
  isValid,
}: {
  readonly git: Git;
  readonly status: GitStatus;
  readonly message: string;
  readonly isValid: boolean;
}) {
  return (
    <div className={ui.actions}>
      <button
        type="button"
        className={ui.primary}
        disabled={!isValid || s.files.length === 0}
        onClick={() => void git.act("Commit", () => gitCommit(message.trim()))}
      >
        Commit content
      </button>
      <button
        type="button"
        className={ui.secondary}
        disabled={s.ahead === 0 && s.upstream !== null}
        onClick={() => void git.act("Push", gitPush)}
      >
        Push
      </button>
      {s.repoUrl && (
        <a
          className={ui.secondary}
          href={`${s.repoUrl}/actions`}
          target="_blank"
          rel="noreferrer noopener"
        >
          Deploy runs
        </a>
      )}
    </div>
  );
}

function CommitForm({
  git,
  status,
  message,
  setMessage,
}: {
  readonly git: Git;
  readonly status: GitStatus;
  readonly message: string;
  readonly setMessage: (message: string) => void;
}) {
  const isValid = isValidCommitMessage(message.trim());
  return (
    <>
      <StatusSummary status={status} />
      <MessageField message={message} onChange={setMessage} isValid={isValid} />
      <GitActions
        git={git}
        status={status}
        message={message}
        isValid={isValid}
      />
    </>
  );
}

export default function PublishTool() {
  const git = useGit();
  const [message, setMessage] = useState(DEFAULT_MESSAGE);
  return (
    <div className={ui.tool}>
      <BuildPanel />
      <section className={ui.panel} aria-label="Git">
        <h2 className={ui.panelTitle}>Commit and push</h2>
        {git.problem && <p className={ui.warning}>{git.problem}</p>}
        {git.status && (
          <CommitForm
            git={git}
            status={git.status}
            message={message}
            setMessage={setMessage}
          />
        )}
        {git.output.length > 0 && (
          <pre className={ui.log}>{git.output.join("\n")}</pre>
        )}
      </section>
    </div>
  );
}
