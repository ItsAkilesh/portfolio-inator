/**
 * File: shared.ts
 * Purpose: Types and helpers shared by the admin API route modules: the request context, body
 *          parsing with a schema and a size limit, and query parameters.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import type { IncomingMessage, ServerResponse } from "node:http";
import type { z } from "zod";
import { HttpError, readJsonBody } from "../http";
import type { Services } from "../services";

export interface RouteContext {
  readonly req: IncomingMessage;
  readonly res: ServerResponse;
  readonly requestId: string;
  readonly query: URLSearchParams;
  readonly services: Services;
}

export type Handler = (ctx: RouteContext) => Promise<void>;
export type RouteTable = Readonly<Record<string, Handler>>;

/** Small JSON bodies (names, keys, messages). */
export const SMALL_BODY = 16 * 1024;

/** Reads and validates a JSON body; a wrong shape is a 400 with no internals. */
export async function body<T>(
  ctx: RouteContext,
  schema: z.ZodType<T>,
  limitBytes = SMALL_BODY,
): Promise<T> {
  const result = schema.safeParse(await readJsonBody(ctx.req, limitBytes));
  if (!result.success)
    throw new HttpError(400, "Request body has the wrong shape");
  return result.data;
}
