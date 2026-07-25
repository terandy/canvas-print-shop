import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";
import { isValidSlug } from "./lib/landing-pages";
import { getPost } from "./lib/blog";

const intlMiddleware = createMiddleware(routing);

/**
 * Detects a request for a dynamic route whose slug does not exist.
 *
 * `notFound()` inside these routes renders the 404 UI but leaves the HTTP
 * status at 200, because the shared locale layout reads `headers()`/`cookies()`
 * and the response has already begun streaming by the time the page component
 * rejects the slug. Google treats a 200 that looks like an error page as a soft
 * 404, so the status is corrected here instead — the page still renders its own
 * not-found UI.
 */
const isUnknownSlug = (pathname: string): boolean => {
  const segments = pathname.split("/").filter(Boolean);
  // [locale, section, slug]
  if (segments.length !== 3) return false;

  const [locale, section, slug] = segments;
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    return false;
  }

  if (section === "canvas-prints") return !isValidSlug(slug);
  if (section === "blog") return !getPost(slug);

  return false;
};

export default function middleware(request: NextRequest) {
  if (isUnknownSlug(request.nextUrl.pathname)) {
    const response = NextResponse.rewrite(request.nextUrl, { status: 404 });
    response.headers.set("x-pathname", request.nextUrl.pathname);
    return response;
  }

  const response = intlMiddleware(request);

  // Add pathname header for use in layouts
  response.headers.set("x-pathname", request.nextUrl.pathname);

  return response;
}

export const config = {
  // Match only internationalized pathnames
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
