/**
 * File: projects.ts
 * Purpose: Admin API routes for GitHub repositories: list what the fetcher saved, and run it.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import { logger } from "../../../../src/lib/logger";
import { sendJson } from "../http";
import type { Handler, RouteTable } from "./shared";

const list: Handler = async ({ res, services }) => {
  sendJson(res, 200, { projects: await services.projects.list() });
};

const fetchProjects: Handler = async ({ res, requestId, services }) => {
  const outcome = await services.projects.fetch();
  logger.info(
    "admin.projects.fetch",
    `req=${requestId} ${outcome.ok ? "fetched" : "failed"}`,
  );
  sendJson(res, outcome.ok ? 200 : 502, {
    ok: outcome.ok,
    lines: outcome.lines,
    projects: await services.projects.list(),
  });
};

export const PROJECT_ROUTES: RouteTable = {
  "GET /projects": list,
  "POST /projects/fetch": fetchProjects,
};
