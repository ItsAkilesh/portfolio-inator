/**
 * File: check-build.mjs
 * Purpose: Fails the build if any admin console code or API reference reached the output. Runs after
 *          `vite build` so "the admin exists only in dev" is checked on every build, not assumed.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const OUTPUT_DIR = "build";
const MARKERS = [
  "__admin/api",
  "portfolio-admin-token",
  "Portfolio admin",
  "Admin sections",
];
const TEXT_FILE = /\.(html|js|css|json|txt|xml)$/;

async function* files(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* files(path);
    else if (TEXT_FILE.test(entry.name)) yield path;
  }
}

async function main() {
  const leaks = [];
  for await (const file of files(OUTPUT_DIR)) {
    const text = await readFile(file, "utf8");
    for (const marker of MARKERS)
      if (text.includes(marker)) leaks.push(`${file}: "${marker}"`);
  }
  if (leaks.length > 0) {
    process.stderr.write(
      `Admin code found in the build:\n${leaks.join("\n")}\n`,
    );
    process.exit(1);
  }
  process.stdout.write(
    `[${new Date().toISOString()}] INFO check-build: no admin code in ${OUTPUT_DIR}/\n`,
  );
}

main().catch((error) => {
  process.stderr.write(
    `check-build failed: ${error instanceof Error ? error.message : String(error)}\n`,
  );
  process.exit(1);
});
