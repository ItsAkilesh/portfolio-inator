/**
 * File: content.ts
 * Purpose: Admin API routes for the content: read it with its version, save it, and list the saved
 *          versions kept in the local history.
 * Author: Akilesh
 * Date: 2026-10-21 (updated 2026-10-22)
 */
import { z } from "zod";
import { logger } from "../../../../src/lib/logger";
import { HttpError, sendJson } from "../http";
import { body, type Handler, type RouteTable } from "./shared";

const CONTENT_LIMIT = 2 * 1024 * 1024;

const saveBody = z.object({
  content: z.unknown(),
  baseVersion: z.string().min(1).max(64),
});

const getContent: Handler = async ({ res, services }) => {
  sendJson(res, 200, await services.content.read());
};

const putContent: Handler = async (ctx) => {
  const { content, baseVersion } = await body(ctx, saveBody, CONTENT_LIMIT);
  const result = await ctx.services.content.save(content, baseVersion);
  logger.info(
    "admin.content.save",
    `req=${ctx.requestId} ${result.ok ? "saved" : `refused ${result.status}`}`,
  );
  if (result.ok) sendJson(ctx.res, 200, { version: result.version });
  else sendJson(ctx.res, result.status, { issues: result.issues });
};

const listHistory: Handler = async ({ res, services }) => {
  sendJson(res, 200, { versions: await services.history.list() });
};

const readHistory: Handler = async ({ res, query, requestId, services }) => {
  const content = await services.history.read(query.get("id") ?? "");
  if (content === null) throw new HttpError(404, "No such saved version");
  logger.info("admin.history.read", `req=${requestId} read`);
  sendJson(res, 200, { content });
};

export const CONTENT_ROUTES: RouteTable = {
  "GET /content": getContent,
  "PUT /content": putContent,
  "GET /history": listHistory,
  "GET /history/item": readHistory,
};
