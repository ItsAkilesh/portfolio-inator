/**
 * File: plugin.ts
 * Purpose: Dev-only Vite plugin behind the /admin console. `apply: "serve"` means `vite build` never
 *          loads it, so no build contains the API. It serves /__admin/api/* (access-checked, see
 *          security.ts) and hands the per-start token to the page in a meta tag.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import { randomUUID } from "node:crypto";
import type { IncomingMessage, ServerResponse } from "node:http";
import type { Plugin } from "vite";
import { describeError, logger } from "../../../src/lib/logger";
import { projectPaths } from "../paths";
import { ContentStore } from "./contentStore";
import { HttpError, sendJson } from "./http";
import { ImageStore } from "./imageStore";
import { ROUTES } from "./routes";
import { TOKEN_HEADER, checkAccess, createToken } from "./security";

export const API_PREFIX = "/__admin/api";
export const TOKEN_META = "portfolio-admin-token";

const header = (req: IncomingMessage, name: string): string | undefined => {
  const value = req.headers[name];
  return Array.isArray(value) ? value[0] : value;
};

interface Stores {
  readonly content: ContentStore;
  readonly images: ImageStore;
}

interface RequestLine {
  readonly requestId: string;
  readonly method: string;
  readonly path: string;
}

const requestLine = (req: IncomingMessage): RequestLine => ({
  requestId: randomUUID().slice(0, 8),
  method: req.method ?? "GET",
  path: (req.url ?? "/").split("?")[0] ?? "/",
});

function isAllowed(
  req: IncomingMessage,
  line: RequestLine,
  token: string,
): boolean {
  const facts = {
    host: header(req, "host"),
    origin: header(req, "origin"),
    token: header(req, TOKEN_HEADER),
    method: line.method,
  };
  const access = checkAccess(facts, token);
  if (!access.ok)
    logger.warn(
      "admin.access",
      `req=${line.requestId} ${line.method} ${line.path} denied: ${access.reason}`,
    );
  return access.ok;
}

function sendFailure(
  res: ServerResponse,
  line: RequestLine,
  error: unknown,
): void {
  const status = error instanceof HttpError ? error.status : 500;
  logger.error(
    "admin.request",
    `req=${line.requestId} ${line.method} ${line.path} failed: ${describeError(error)}`,
  );
  /* Internal errors stay in the dev server log; the page gets a generic message. */
  const message =
    status === 500
      ? "Internal error, see the dev server log"
      : describeError(error);
  sendJson(res, status, { issues: [message] });
}

async function handle(
  req: IncomingMessage,
  res: ServerResponse,
  token: string,
  stores: Stores,
) {
  const line = requestLine(req);
  if (!isAllowed(req, line, token)) {
    sendJson(res, 403, { issues: ["Forbidden"] });
    return;
  }
  const route = ROUTES[`${line.method} ${line.path}`];
  if (!route) {
    sendJson(res, 404, { issues: ["Not found"] });
    return;
  }
  try {
    await route({ req, res, requestId: line.requestId, ...stores });
  } catch (error) {
    sendFailure(res, line, error);
  }
}

/** Connect-style handler for requests under API_PREFIX (req.url is relative to the prefix). */
export const createAdminHandler =
  (token: string, stores: Stores) =>
  (req: IncomingMessage, res: ServerResponse) => {
    handle(req, res, token, stores).catch((error: unknown) =>
      logger.error("admin.request", describeError(error)),
    );
  };

export function adminPlugin(): Plugin {
  const token = createToken();
  return {
    name: "portfolio-admin",
    apply: "serve",
    configureServer(server) {
      const paths = projectPaths(server.config.root);
      const stores = {
        content: new ContentStore(paths.contentFile),
        images: new ImageStore(paths.imagesDir),
      };
      server.middlewares.use(API_PREFIX, createAdminHandler(token, stores));
      logger.info("admin.ready", "admin console at /admin (dev server only)");
    },
    transformIndexHtml() {
      return [
        {
          tag: "meta",
          attrs: { name: TOKEN_META, content: token },
          injectTo: "head",
        },
      ];
    },
  };
}
