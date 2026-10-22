/**
 * File: publish.ts
 * Purpose: Admin API routes for publishing: run and watch `pnpm build`, see content changes in git,
 *          commit them with a Conventional Commits message, and push.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import { z } from "zod";
import { logger } from "../../../../src/lib/logger";
import { HttpError, sendJson } from "../http";
import { body, type Handler, type RouteTable } from "./shared";

const commitBody = z.object({ message: z.string().min(1).max(200) });

const buildStatus: Handler = async ({ res, services }) => {
  sendJson(res, 200, services.build.current());
};

const startBuild: Handler = async ({ res, requestId, services }) => {
  const isStarted = services.build.start();
  logger.info(
    "admin.build",
    `req=${requestId} ${isStarted ? "started" : "already running"}`,
  );
  sendJson(res, 202, services.build.current());
};

const gitStatus: Handler = async ({ res, services }) => {
  const status = await services.git.status();
  if (!status)
    throw new HttpError(
      503,
      "This folder is not a git repository, or git is not installed",
    );
  sendJson(res, 200, status);
};

const commit: Handler = async (ctx) => {
  const { message } = await body(ctx, commitBody);
  const result = await ctx.services.git.commit(message.trim());
  logger.info(
    "admin.git.commit",
    `req=${ctx.requestId} ${result.ok ? "committed" : "refused"}`,
  );
  sendJson(
    ctx.res,
    result.ok ? 200 : 422,
    result.ok
      ? { output: result.output }
      : { issues: [result.reason], output: result.output ?? [] },
  );
};

const push: Handler = async ({ res, requestId, services }) => {
  const result = await services.git.push();
  logger.info(
    "admin.git.push",
    `req=${requestId} ${result.ok ? "pushed" : "failed"}`,
  );
  sendJson(
    res,
    result.ok ? 200 : 502,
    result.ok
      ? { output: result.output }
      : { issues: [result.reason], output: result.output ?? [] },
  );
};

export const PUBLISH_ROUTES: RouteTable = {
  "GET /build": buildStatus,
  "POST /build": startBuild,
  "GET /git": gitStatus,
  "POST /git/commit": commit,
  "POST /git/push": push,
};
