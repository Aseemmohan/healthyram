/**
 * Middleware — Healthyram
 * © 2026 Aseem Mohan. All rights reserved.
 *
 * INSTALL AT: middleware.js  (project root, next to package.json — NOT in app/)
 *
 * Two jobs:
 *   1. Keep the Supabase auth session cookie fresh on every request.
 *   2. Gate /plan and /account behind login. Everything else — the
 *      dish teardowns, the homepage — stays open, deliberately.
 */

import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

const PROTECTED = ["/plan", "/account"];

export async function middleware(request) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const needsAuth = PROTECTED.some(p => request.nextUrl.pathname.startsWith(p));
  if (needsAuth && !user) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: ["/plan/:path*", "/account/:path*"],
};
