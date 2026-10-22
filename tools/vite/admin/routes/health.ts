/**
 * File: health.ts
 * Purpose: Admin API route for the health page's external link check. URLs come from the page but
 *          are re-validated and restricted by the link checker's network policy.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import { z } from "zod";
import { logger } from "../../../../src/lib/logger";
import { sendJson } from "../http";
import { MAX_LINKS } from "../linkChecker";
import { body, type Handler, type RouteTable } from "./shared";

const LINK_BODY_LIMIT = 256 * 1024;
const linksBody = z.object({
  urls: z.array(z.string().min(1).max(2048)).max(MAX_LINKS),
});

const checkLinks: Handler = async (ctx) => {
  const { urls } = await body(ctx, linksBody, LINK_BODY_LIMIT);
  const results = await ctx.services.links.checkAll(urls);
  const broken = results.filter((r) => !r.ok).length;
  logger.info(
    "admin.health.links",
    `req=${ctx.requestId} checked ${results.length}, ${broken} failing`,
  );
  sendJson(ctx.res, 200, { results });
};

export const HEALTH_ROUTES: RouteTable = { "POST /health/links": checkLinks };
