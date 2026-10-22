/**
 * File: views.ts
 * Purpose: Code-split admin tool pages and form panels, by id. Each loads only when opened.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import { lazy, type ComponentType, type LazyExoticComponent } from "react";
import type { PanelId, ToolId } from "./sections";

type View = LazyExoticComponent<ComponentType>;

export const TOOLS: Readonly<Record<ToolId, View>> = {
  media: lazy(() => import("./tools/MediaLibrary")),
  icons: lazy(() => import("./tools/IconLibrary")),
  import: lazy(() => import("./tools/ImportExport")),
  history: lazy(() => import("./tools/HistoryTool")),
  health: lazy(() => import("./tools/HealthTool")),
  publish: lazy(() => import("./tools/PublishTool")),
  setup: lazy(() => import("./tools/SetupWizard")),
  docs: lazy(() => import("./tools/DocsTool")),
};

export const PANELS: Readonly<Record<PanelId, View>> = {
  seo: lazy(() => import("./panels/SeoPanel")),
  theme: lazy(() => import("./panels/ThemeStudio")),
  projects: lazy(() => import("./panels/ProjectsPanel")),
};
