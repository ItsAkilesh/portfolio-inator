/**
 * File: globalTeardown.ts
 * Purpose: Restores the files end-to-end tests may have changed, after all tests.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import { restoreProject } from "./project";

export default async function globalTeardown(): Promise<void> {
  await restoreProject();
}
