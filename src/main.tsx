/**
 * File: main.tsx
 * Purpose: Application entry: theme, router, analytics and global styles.
 * Author: Akilesh
 * Date: 2026-10-20
 */
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { initAnalytics } from "./lib/analytics";
import { analytics, theme } from "./portfolio";
import { ThemeProvider } from "./theme/ThemeProvider";
import "./styles/global.css";

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error('index.html is missing <div id="root">');

if (import.meta.env.PROD) initAnalytics(analytics);

createRoot(rootElement).render(
  <StrictMode>
    <ThemeProvider config={theme}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
);
