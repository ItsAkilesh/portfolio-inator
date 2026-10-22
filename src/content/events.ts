/**
 * File: events.ts
 * Purpose: Name of the dev-server event sent when portfolio.json changes on disk (admin save or hand
 *          edit). The site reloads on it; the admin console refreshes its draft instead of reloading.
 * Author: Akilesh
 * Date: 2026-10-21
 */
export const CONTENT_CHANGED_EVENT = "portfolio:content-changed";

/** Path prefix of the admin console, which handles content changes itself. */
export const ADMIN_PATH = "/admin";
