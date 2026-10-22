/**
 * File: http.ts
 * Purpose: Minimal JSON request/response helpers for the admin API, with a hard body size limit.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import type { IncomingMessage, ServerResponse } from "node:http";

export class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

const JSON_TYPE = /^application\/json\b/i;

/** Parses a JSON body, rejecting other content types and bodies over `limitBytes`. */
export function readJsonBody(
  req: IncomingMessage,
  limitBytes: number,
): Promise<unknown> {
  if (!JSON_TYPE.test(req.headers["content-type"] ?? ""))
    return Promise.reject(new HttpError(415, "Send application/json"));
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let size = 0;
    req.on("data", (chunk: Buffer) => {
      size += chunk.length;
      if (size > limitBytes) {
        reject(new HttpError(413, "Request body too large"));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString("utf8")));
      } catch {
        reject(new HttpError(400, "Body is not valid JSON"));
      }
    });
    req.on("error", reject);
  });
}

export function sendJson(
  res: ServerResponse,
  status: number,
  body: unknown,
): void {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.end(JSON.stringify(body));
}
