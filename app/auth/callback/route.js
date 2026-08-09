/**
 * OAuth callback — Healthyram
 * © 2026 Aseem Mohan. All rights reserved.
 *
 * INSTALL AT: app/auth/callback/route.js
 *
 * Google redirects here after the user approves sign-in. We exchange
 * the code for a session, then send them wherever they were headed
 * (the "next" param set in app/login/page.jsx).
 */

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseServer } from "../../../lib/supabaseClient";

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") || "/plan";

  if (code) {
    const cookieStore = await cookies();
    const supabase = supabaseServer(cookieStore);
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
