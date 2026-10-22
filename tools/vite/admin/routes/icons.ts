/**
 * File: icons.ts
 * Purpose: Admin API routes for the icon library: search all of simple-icons, add one, import an SVG
 *          as a custom icon, see which icons the saved content uses, and remove unused ones.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import { z } from "zod";
import { usageCounts } from "../../../../src/content/walk";
import { SITE_ICONS } from "../../../../src/icons/siteIcons";
import { logger } from "../../../../src/lib/logger";
import { HttpError, sendJson } from "../http";
import { iconCatalog, searchCatalog } from "../iconCatalog";
import type { IconChange } from "../iconStore";
import { MAX_SVG_BYTES } from "../svgIcon";
import {
  body,
  type Handler,
  type RouteContext,
  type RouteTable,
} from "./shared";

const ICON_WIDGET = "icon";
const SVG_BODY_LIMIT = MAX_SVG_BYTES + 4096;
const PROTECTED: ReadonlySet<string> = new Set(Object.values(SITE_ICONS));

const keyField = z.string().min(1).max(40);
const addBody = z.object({
  slug: z.string().min(1).max(80),
  key: keyField.optional(),
});
const importBody = z.object({
  key: keyField,
  title: z.string().min(1).max(80),
  hex: z.string().min(1).max(7),
  svg: z.string().min(1),
});
const removeBody = z.object({ key: keyField });

function reply(ctx: RouteContext, operation: string, result: IconChange): void {
  logger.info(
    operation,
    `req=${ctx.requestId} ${result.ok ? `ok ${result.key}` : "refused"}`,
  );
  if (!result.ok) throw new HttpError(422, result.reason);
  sendJson(ctx.res, 200, { key: result.key });
}

const search: Handler = async ({ res, query, services }) => {
  const library = await services.icons.read();
  const keyBySlug = new Map(
    Object.entries(library.simpleIcons).map(([key, slug]) => [slug, key]),
  );
  const limit = Number(query.get("limit") ?? "") || undefined;
  const results = searchCatalog(
    await iconCatalog(),
    query.get("q") ?? "",
    limit,
  );
  sendJson(res, 200, {
    results: results.map((icon) => ({
      ...icon,
      key: keyBySlug.get(icon.slug) ?? null,
    })),
  });
};

const usage: Handler = async ({ res, services }) => {
  const { content } = await services.content.read();
  const counts = usageCounts(await services.loadSchema(), content, ICON_WIDGET);
  const library = await services.icons.read();
  sendJson(res, 200, {
    usage: Object.fromEntries(counts),
    simpleIcons: library.simpleIcons,
    custom: Object.keys(library.custom),
    protected: [...PROTECTED],
  });
};

const add: Handler = async (ctx) => {
  const { slug, key } = await body(ctx, addBody);
  reply(ctx, "admin.icon.add", await ctx.services.icons.addSimple(slug, key));
};

const importSvg: Handler = async (ctx) => {
  const input = await body(ctx, importBody, SVG_BODY_LIMIT);
  reply(ctx, "admin.icon.import", await ctx.services.icons.addCustom(input));
};

const remove: Handler = async (ctx) => {
  const { key } = await body(ctx, removeBody);
  const { content } = await ctx.services.content.read();
  const uses =
    usageCounts(await ctx.services.loadSchema(), content, ICON_WIDGET).get(
      key,
    ) ?? 0;
  if (uses > 0)
    throw new HttpError(
      409,
      `"${key}" is used ${uses} time(s); change those fields first`,
    );
  reply(
    ctx,
    "admin.icon.remove",
    await ctx.services.icons.remove(key, PROTECTED),
  );
};

export const ICON_ROUTES: RouteTable = {
  "GET /icons/search": search,
  "GET /icons/usage": usage,
  "POST /icons/add": add,
  "POST /icons/import": importSvg,
  "POST /icons/remove": remove,
};
