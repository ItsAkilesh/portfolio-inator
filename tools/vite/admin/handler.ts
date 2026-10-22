/**
 * File: handler.ts
 * Purpose: Request handling for the dev-only admin API: access checks on every request (see
 *          security.ts), routing, and failure responses that never leak internals to the page.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import { randomUUID } from "node:crypto";
import type { IncomingMessage, ServerResponse } from "node:http";
import { describeError, logger } from "../../../src/lib/logger";
import { HttpError, sendJson } from "./http";
import { ROUTES } from "./routes";
import { TOKEN_HEADER, checkAccess } from "./security";
import type { Services } from "./services";

const header = (req: IncomingMessage, name: string): string | undefined => {
  const value = req.headers[name];
  return Array.isArray(value) ? value[0] : value;
};

interface RequestLine {
  readonly requestId: string;
  readonly method: string;
  readonly path: string;
  readonly query: URLSearchParams;
}

function requestLine(req: IncomingMessage): RequestLine {
  const [path = "/", search = ""] = (req.url ?? "/").split("?");
  return {
    requestId: randomUUID().slice(0, 8),
    method: req.method ?? "GET",
    path,
    query: new URLSearchParams(search),
  };
}

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
  services: Services,
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
    await route({
      req,
      res,
      requestId: line.requestId,
      query: line.query,
      services,
    });
  } catch (error) {
    sendFailure(res, line, error);
  }
}

/** Connect-style handler for requests under API_PREFIX (req.url is relative to the prefix). */
export const createAdminHandler =
  (token: string, services: Services) =>
  (req: IncomingMessage, res: ServerResponse) => {
    handle(req, res, token, services).catch((error: unknown) =>
      logger.error("admin.request", describeError(error)),
    );
  };
