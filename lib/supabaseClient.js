/**
 * Supabase client — Healthyram
 * © 2026 Aseem Mohan. All rights reserved.
 *
 * INSTALL AT: lib/supabaseClient.js
 *
 * Two entry points, because the App Router needs different clients on
 * the browser vs. the server (server needs to read/write cookies for
 * the auth session).
 *
 * REQUIRES:
 *   npm install @supabase/supabase-js @supabase/ssr
 *
 * ENV VARS (Vercel → Settings → Environment Variables, and a local
 * .env.local for dev):
 *   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
 * Both come from Supabase dashboard → Project Settings → API.
 */

import { createBrowserClient, createServerClient } from "@supabase/ssr";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** Use in any "use client" component. */
export function supabaseBrowser() {
  return createBrowserClient(URL, ANON_KEY);
}

/** Use in Server Components, Route Handlers, and middleware.
 *  Pass the cookies() object from next/headers (or the request/response
 *  pair in middleware) so the session can be read and refreshed. */
export function supabaseServer(cookieStore) {
  return createServerClient(URL, ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Called from a Server Component that can't set cookies —
          // safe to ignore, middleware handles the refresh instead.
        }
      },
    },
  });
}
