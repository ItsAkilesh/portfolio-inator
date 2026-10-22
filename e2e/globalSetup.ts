/**
 * File: globalSetup.ts
 * Purpose: Backs up the files end-to-end tests may change, before any test runs.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import { backupProject } from "./project";

export default async function globalSetup(): Promise<void> {
  await backupProject();
}
