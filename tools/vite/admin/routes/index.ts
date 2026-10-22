/**
 * File: index.ts
 * Purpose: The admin API's route table: "METHOD /path" (relative to /__admin/api) to handler.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import { CONTENT_ROUTES } from "./content";
import { HEALTH_ROUTES } from "./health";
import { ICON_ROUTES } from "./icons";
import { IMAGE_ROUTES } from "./images";
import { PROJECT_ROUTES } from "./projects";
import { PUBLISH_ROUTES } from "./publish";
import type { RouteTable } from "./shared";

export const ROUTES: RouteTable = {
  ...CONTENT_ROUTES,
  ...IMAGE_ROUTES,
  ...ICON_ROUTES,
  ...PROJECT_ROUTES,
  ...PUBLISH_ROUTES,
  ...HEALTH_ROUTES,
};
