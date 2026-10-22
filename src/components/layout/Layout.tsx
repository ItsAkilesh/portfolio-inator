/**
 * File: Layout.tsx
 * Purpose: Page shell: splash, header, routed page, footer, plus per-route side effects.
 * Author: Akilesh
 * Date: 2026-10-20
 */
import { Outlet } from "react-router-dom";
import { useRouteEffects } from "../../hooks/useRouteEffects";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { Splash } from "./Splash";

export function Layout() {
  useRouteEffects();
  return (
    <>
      <Splash />
      <a className="visually-hidden" href="#main">
        Skip to content
      </a>
      <Header />
      <main id="main">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
