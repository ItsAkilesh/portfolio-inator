/**
 * File: plugin.ts
 * Purpose: Dev-only Vite plugin behind the /admin console. `apply: "serve"` means `vite build` never
 *          loads it, so no build contains the API. It serves /__admin/api/* (see handler.ts) and hands
 *          the per-start token to the page in a meta tag.
 * Author: Akilesh
 * Date: 2026-10-21 (updated 2026-10-22)
 */
import type { Plugin } from "vite";
import { logger } from "../../../src/lib/logger";
import { projectPaths } from "../paths";
import { devSchema } from "../schemaSource";
import { createAdminHandler } from "./handler";
import { createToken } from "./security";
import { createServices } from "./services";

export const API_PREFIX = "/__admin/api";
export const TOKEN_META = "portfolio-admin-token";

export function adminPlugin(): Plugin {
  const token = createToken();
  return {
    name: "portfolio-admin",
    apply: "serve",
    configureServer(server) {
      const services = createServices(
        projectPaths(server.config.root),
        devSchema(server),
      );
      server.middlewares.use(API_PREFIX, createAdminHandler(token, services));
      logger.info("admin.ready", "admin console at /admin (dev server only)");
    },
    transformIndexHtml() {
      return [
        {
          tag: "meta",
          attrs: { name: TOKEN_META, content: token },
          injectTo: "head",
        },
      ];
    },
  };
}
