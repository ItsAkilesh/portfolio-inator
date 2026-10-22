/**
 * File: images.ts
 * Purpose: Admin API routes for public/images: list (with sizes and how often the saved content uses
 *          each), upload, rename (references in the content follow) and remove (only when unused).
 * Author: Akilesh
 * Date: 2026-10-21
 */
import { z } from "zod";
import { usageCounts, replaceWidgetValue } from "../../../../src/content/walk";
import { logger } from "../../../../src/lib/logger";
import { HttpError, sendJson } from "../http";
import { MAX_IMAGE_BYTES } from "../imageStore";
import {
  body,
  type Handler,
  type RouteContext,
  type RouteTable,
} from "./shared";

/* base64 grows data by 4/3, plus room for the JSON wrapper. */
const UPLOAD_LIMIT = Math.ceil((MAX_IMAGE_BYTES * 4) / 3) + 4096;
const IMAGE_WIDGET = "image";

const uploadBody = z.object({
  fileName: z.string().min(1).max(200),
  dataBase64: z.string().min(1),
});
const renameBody = z.object({
  from: z.string().min(1).max(200),
  to: z.string().min(1).max(200),
  baseVersion: z.string().min(1).max(64),
});
const removeBody = z.object({ name: z.string().min(1).max(200) });

async function savedUsage(ctx: RouteContext): Promise<Map<string, number>> {
  const { content } = await ctx.services.content.read();
  return usageCounts(await ctx.services.loadSchema(), content, IMAGE_WIDGET);
}

const getImages: Handler = async ({ res, services }) => {
  sendJson(res, 200, { images: await services.images.list() });
};

const getDetails: Handler = async (ctx) => {
  const usage = await savedUsage(ctx);
  const images = await ctx.services.images.details();
  sendJson(ctx.res, 200, {
    images: images.map((image) => ({
      ...image,
      uses: usage.get(image.name) ?? 0,
    })),
  });
};

const postImage: Handler = async (ctx) => {
  const { fileName, dataBase64 } = await body(ctx, uploadBody, UPLOAD_LIMIT);
  const result = await ctx.services.images.save(fileName, dataBase64);
  logger.info(
    "admin.image.upload",
    `req=${ctx.requestId} ${result.ok ? `stored ${result.fileName}` : "refused"}`,
  );
  if (result.ok) sendJson(ctx.res, 201, { fileName: result.fileName });
  else sendJson(ctx.res, 422, { issues: [result.reason] });
};

/** Renames the file, then the references; if the content cannot be saved the file is renamed back. */
const renameImage: Handler = async (ctx) => {
  const { from, to, baseVersion } = await body(ctx, renameBody);
  const { images, content, loadSchema } = ctx.services;
  if ((await content.read()).version !== baseVersion)
    throw new HttpError(
      409,
      "portfolio.json changed since it was loaded; reload first",
    );
  const renamed = await images.rename(from, to);
  if (!renamed.ok) throw new HttpError(422, renamed.reason);
  const schema = await loadSchema();
  const saved = await content.update(baseVersion, (current) =>
    replaceWidgetValue(schema, current, IMAGE_WIDGET, from, renamed.fileName),
  );
  if (!saved.ok) {
    await images.rename(renamed.fileName, from);
    sendJson(ctx.res, saved.status, { issues: saved.issues });
    return;
  }
  logger.info("admin.image.rename", `req=${ctx.requestId} renamed`);
  sendJson(ctx.res, 200, {
    fileName: renamed.fileName,
    version: saved.version,
  });
};

const removeImage: Handler = async (ctx) => {
  const { name } = await body(ctx, removeBody);
  const uses = (await savedUsage(ctx)).get(name) ?? 0;
  if (uses > 0)
    throw new HttpError(
      409,
      `${name} is used ${uses} time(s); change those fields first`,
    );
  const result = await ctx.services.images.remove(name);
  if (!result.ok) throw new HttpError(422, result.reason);
  logger.info(
    "admin.image.remove",
    `req=${ctx.requestId} moved to history trash`,
  );
  sendJson(ctx.res, 200, { fileName: name });
};

export const IMAGE_ROUTES: RouteTable = {
  "GET /images": getImages,
  "GET /images/details": getDetails,
  "POST /images": postImage,
  "POST /images/rename": renameImage,
  "POST /images/remove": removeImage,
};
