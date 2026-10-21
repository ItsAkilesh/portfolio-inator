/**
 * File: App.tsx
 * Purpose: Route table generated from the pages in the content: the first page is also served at "/".
 * Author: Akilesh
 * Date: 2026-10-20 (updated 2026-10-21)
 */
import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { PageRenderer } from "./blocks/PageRenderer";
import { Layout } from "./components/layout/Layout";
import { homePage, pages } from "./portfolio";

const NotFound = lazy(() => import("./pages/NotFound"));

/** "/experience" to the relative route "experience". */
const routeOf = (path: string): string => path.replace(/^\//, "");

export default function App() {
  return (
    <Suspense fallback={null}>
      <Routes>
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
