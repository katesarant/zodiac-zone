import { Link } from "@tanstack/react-router";
import type { ComponentType, ReactNode } from "react";

/**
 * Thin wrapper so horoscope pages can build clean paths as strings
 * (/el/zodia/krios/simera) without repeating the typed-route generics.
 */
const AnyLink = Link as unknown as ComponentType<{
  to: string;
  className?: string;
  children: ReactNode;
}>;

export function PathLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <AnyLink to={href} className={className ?? ""}>
      {children}
    </AnyLink>
  );
}
