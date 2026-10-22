/**
 * File: SmartLink.tsx
 * Purpose: One link component for config URLs: internal routes use the router, external URLs open safely.
 * Author: Akilesh
 * Date: 2026-10-20
 */
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { Link } from "react-router-dom";

const SAFE_EXTERNAL = /^(https?:|mailto:|tel:)/i;

export const isInternalPath = (href: string): boolean =>
  href.startsWith("/") && !href.startsWith("//");

/** Allows only http(s), mailto and tel links from config; anything else (e.g. javascript:) becomes inert. */
export const safeHref = (href: string): string | undefined =>
  isInternalPath(href) || SAFE_EXTERNAL.test(href) ? href : undefined;

interface SmartLinkProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  readonly href: string;
  readonly children: ReactNode;
}

export function SmartLink({ href, children, ...rest }: SmartLinkProps) {
  if (isInternalPath(href)) {
    return (
      <Link to={href} {...rest}>
        {children}
      </Link>
    );
  }
  const isWeb = /^https?:/i.test(href);
  return (
    <a
      href={safeHref(href)}
      {...(isWeb ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      {...rest}
    >
      {children}
    </a>
  );
}
