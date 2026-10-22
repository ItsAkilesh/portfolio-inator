/**
 * File: testHarness.ts
 * Purpose: Test-only: a real admin API server over a temporary copy of the project (content, icon
 *          library, images), with build, git, GitHub fetch and DNS replaced by fakes, so API tests
 *          exercise every route over HTTP without touching the real project or the network.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import { cp, mkdir, mkdtemp, rm } from "node:fs/promises";
import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { portfolioSchema } from "../../../src/content/schema";
import { projectPaths, type ProjectPaths } from "../paths";
import { fixedSchema } from "../schemaSource";
import { BuildRunner } from "./buildRunner";
import { ContentStore } from "./contentStore";
import { GitService } from "./gitService";
import { createAdminHandler } from "./handler";
import { HistoryStore } from "./historyStore";
import { IconStore } from "./iconStore";
import { ImageStore } from "./imageStore";
import { LinkChecker, type Resolver } from "./linkChecker";
import type { RunResult } from "./processRunner";
import { ProjectsService } from "./projectsService";
import { TOKEN_HEADER, createToken } from "./security";
import type { Services } from "./services";

const REPO = resolve(__dirname, "../../..");
const COPIED = [
  "src/content/portfolio.json",
  "src/icons/library.json",
  "src/icons/simpleIcons.generated.ts",
  "public/images",
];

export interface Fakes {
  build: (onLine: (line: string) => void) => Promise<RunResult>;
  git: (args: readonly string[]) => Promise<RunResult>;
  fetchProjects: () => Promise<RunResult>;
  resolveHost: Resolver;
  isAllowedAddress: (address: string) => boolean;
}

export const ran = (code: number, lines: string[] = []): RunResult => ({
  code,
  isTimedOut: false,
  lines,
});

export interface Harness {
  readonly base: string;
  readonly paths: ProjectPaths;
  readonly fakes: Fakes;
  readonly call: (
    path: string,
    init?: RequestInit,
    token?: string,
  ) => Promise<Response>;
  readonly json: <T>(path: string, init?: RequestInit) => Promise<T>;
  readonly close: () => Promise<void>;
}

async function copyProject(): Promise<ProjectPaths> {
  const root = await mkdtemp(join(tmpdir(), "admin-api-"));
  for (const item of COPIED) {
    await mkdir(join(root, item, ".."), { recursive: true });
    await cp(join(REPO, item), join(root, item), { recursive: true });
  }
  await mkdir(join(root, "src/shared/opensource"), { recursive: true });
  return projectPaths(root);
}

function servicesFor(paths: ProjectPaths, fakes: Fakes): Services {
  const loadSchema = fixedSchema(portfolioSchema);
  const history = new HistoryStore(paths.historyDir);
  return {
    loadSchema,
    history,
    content: new ContentStore(paths.contentFile, loadSchema, history),
    images: new ImageStore(paths.imagesDir, history),
    icons: new IconStore(paths.iconLibraryFile, paths.iconModuleFile),
    projects: new ProjectsService(paths.projectsFile, () =>
      fakes.fetchProjects(),
    ),
    build: new BuildRunner((onLine) => fakes.build(onLine)),
    git: new GitService((args) => fakes.git(args)),
    links: new LinkChecker({
      resolve: (host) => fakes.resolveHost(host),
      isAllowed: (address) => fakes.isAllowedAddress(address),
    }),
  };
}

export async function startHarness(): Promise<Harness> {
  const paths = await copyProject();
  const token = createToken();
  const fakes: Fakes = {
    build: async () => ran(0, ["built"]),
    git: async () => ran(0),
    fetchProjects: async () => ran(0),
    resolveHost: async () => [{ address: "93.184.216.34", family: 4 }],
    isAllowedAddress: () => true,
  };
  const server: Server = createServer(
    createAdminHandler(token, servicesFor(paths, fakes)),
  );
  await new Promise<void>((done) => server.listen(0, "127.0.0.1", done));
  const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  const call = (path: string, init: RequestInit = {}, useToken = token) =>
    fetch(`${base}${path}`, {
      ...init,
      headers: {
        "content-type": "application/json",
        origin: base,
        [TOKEN_HEADER]: useToken,
        ...init.headers,
      },
    });
  return {
    base,
    paths,
    fakes,
    call,
    json: async <T>(path: string, init?: RequestInit) =>
      (await (await call(path, init)).json()) as T,
    close: async () => {
      await new Promise((done) => server.close(done));
      await rm(paths.root, { recursive: true, force: true });
    },
  };
}

/** POST with a JSON body. */
export const post = (bodyValue: unknown): RequestInit => ({
  method: "POST",
  body: JSON.stringify(bodyValue),
});
