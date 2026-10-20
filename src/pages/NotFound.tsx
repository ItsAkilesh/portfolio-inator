/**
 * File: NotFound.tsx
 * Purpose: 404 page with links back into the site.
 * Author: Akilesh
 * Date: 2026-10-20
 */
import { Link } from "react-router-dom";
import { PageBand } from "../components/layout/PageBand";
import { navigation, ui } from "../portfolio";

const LIST_STYLE = {
  display: "flex",
  flexWrap: "wrap",
  gap: "12px 24px",
  padding: "48px var(--gutter) 96px",
} as const;

export default function NotFound() {
  return (
    <div className="page">
      <PageBand title={ui.notFoundTitle} description={ui.notFoundText} />
      <nav aria-label="Pages" className="wrap" style={LIST_STYLE}>
        {navigation.map((item) => (
          <Link key={item.path} to={item.path}>
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
