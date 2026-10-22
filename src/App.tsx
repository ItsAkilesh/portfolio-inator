/**
 * File: App.tsx
 * Purpose: Route table generated from the pages in the content: the first page is also served at "/".
 *          /admin exists only in the dev server.
 * Author: Akilesh
 * Date: 2026-10-20 (updated 2026-10-21)
 */
import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { PageRenderer } from "./blocks/PageRenderer";
import { Layout } from "./components/layout/Layout";
import { homePage, pages } from "./portfolio";

const NotFound = lazy(() => import("./pages/NotFound"));
/* Dev only: import.meta.env.DEV is replaced with false in builds, removing the route and its code. */
const AdminApp = import.meta.env.DEV
  ? lazy(() => import("./admin/AdminApp"))
  : null;

/** "/experience" to the relative route "experience". */
const routeOf = (path: string): string => path.replace(/^\//, "");

export default function App() {
  return (
    <Suspense fallback={null}>
      <Routes>
        {AdminApp && <Route path="admin/*" element={<AdminApp />} />}
        <Route element={<Layout />}>
          <Route index element={<PageRenderer page={homePage} />} />
          {pages.map((page) => (
            <Route
              key={page.id}
              path={routeOf(page.path)}
              element={<PageRenderer page={page} />}
            />
          ))}
          <Route path="splash" element={<Navigate to="/" replace />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
