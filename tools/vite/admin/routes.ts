/**
 * File: routes.ts
 * Purpose: Admin API request handlers: read and save the content, list and upload images. Request
 *          bodies are validated before use; every outcome is logged without content or file data.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import type { IncomingMessage, ServerResponse } from "node:http";
import { z } from "zod";
import { logger } from "../../../src/lib/logger";
import type { ContentStore } from "./contentStore";
import { HttpError, readJsonBody, sendJson } from "./http";
import { MAX_IMAGE_BYTES, type ImageStore } from "./imageStore";

const CONTENT_LIMIT = 2 * 1024 * 1024;
/* base64 grows data by 4/3, plus room for the JSON wrapper. */
const UPLOAD_LIMIT = Math.ceil((MAX_IMAGE_BYTES * 4) / 3) + 4096;

const saveBody = z.object({
  content: z.unknown(),
  baseVersion: z.string().min(1),
});
const uploadBody = z.object({
  fileName: z.string().min(1).max(200),
  dataBase64: z.string().min(1),
});

export interface RouteContext {
  readonly req: IncomingMessage;
  readonly res: ServerResponse;
  readonly requestId: string;
  readonly content: ContentStore;
  readonly images: ImageStore;
}

type Handler = (ctx: RouteContext) => Promise<void>;

function parse<T>(schema: z.ZodType<T>, value: unknown): T {
  const result = schema.safeParse(value);
  if (!result.success)
    throw new HttpError(400, "Request body has the wrong shape");
  return result.data;
}

const getContent: Handler = async ({ res, content }) => {
  sendJson(res, 200, await content.read());
};

const putContent: Handler = async ({ req, res, requestId, content }) => {
  const body = parse(saveBody, await readJsonBody(req, CONTENT_LIMIT));
  const result = await content.save(body.content, body.baseVersion);
  logger.info(
    "admin.content.save",
    `req=${requestId} ${result.ok ? "saved" : `refused ${result.status}`}`,
  );
  if (result.ok) sendJson(res, 200, { version: result.version });
  else sendJson(res, result.status, { issues: result.issues });
};

const getImages: Handler = async ({ res, images }) => {
  sendJson(res, 200, { images: await images.list() });
};

const postImage: Handler = async ({ req, res, requestId, images }) => {
  const body = parse(uploadBody, await readJsonBody(req, UPLOAD_LIMIT));
  const result = await images.save(body.fileName, body.dataBase64);
  logger.info(
    "admin.image.upload",
    `req=${requestId} ${result.ok ? `stored ${result.fileName}` : "refused"}`,
  );
  if (result.ok) sendJson(res, 201, { fileName: result.fileName });
  else sendJson(res, 422, { issues: [result.reason] });
};

/** "METHOD /path" to handler; paths are relative to the API prefix. */
export const ROUTES: Readonly<Record<string, Handler>> = {
  "GET /content": getContent,
  "PUT /content": putContent,
  "GET /images": getImages,
  "POST /images": postImage,
};
