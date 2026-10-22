/**
 * File: main.tsx
 * Purpose: Application entry: theme, router, analytics and global styles.
 * Author: Akilesh
 * Date: 2026-10-20 (updated 2026-10-21)
 */
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { ADMIN_PATH, CONTENT_CHANGED_EVENT } from "./content/events";
import { initAnalytics } from "./lib/analytics";
import { analytics, theme } from "./portfolio";
import { ThemeProvider } from "./theme/ThemeProvider";
import "./styles/global.css";

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error('index.html is missing <div id="root">');

if (import.meta.env.PROD) initAnalytics(analytics);

/* Dev only (import.meta.hot is undefined in builds): reload site pages when portfolio.json changes. */
if (import.meta.hot)
  import.meta.hot.on(CONTENT_CHANGED_EVENT, () => {
    if (!window.location.pathname.startsWith(ADMIN_PATH))
      window.location.reload();
  });

createRoot(rootElement).render(
  <StrictMode>
    <ThemeProvider config={theme}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
);
