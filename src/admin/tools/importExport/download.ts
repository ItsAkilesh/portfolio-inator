/**
 * File: download.ts
 * Purpose: Saves text as a file from the browser (object URL released right after).
 * Author: Akilesh
 * Date: 2026-10-21
 */
export function downloadText(
  fileName: string,
  text: string,
  type = "application/json",
): void {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}
