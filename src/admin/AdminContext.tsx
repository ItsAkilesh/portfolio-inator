/**
 * File: AdminContext.tsx
 * Purpose: Gives every admin page, panel and tool the content state and its validation problems,
 *          so tools need no props threaded through the shell.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import { createContext, useContext } from "react";
import type { AdminContent } from "./useAdminContent";
import type { DraftIssues } from "./validation";

export interface AdminContextValue {
  readonly content: AdminContent;
  readonly issues: DraftIssues;
}

export const AdminContext = createContext<AdminContextValue | null>(null);

export function useAdmin(): AdminContextValue {
  const value = useContext(AdminContext);
  if (!value)
    throw new Error("Admin pages must be rendered inside <AdminContext>");
  return value;
}
