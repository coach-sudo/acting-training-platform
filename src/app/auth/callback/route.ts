import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
export async function GET(request: NextRequest) {
  const url = new URL(request.url),
    code = url.searchParams.get("code"),
    requestedNext = url.searchParams.get("next") ?? "/app",
    next =
      requestedNext.startsWith("/") && !requestedNext.startsWith("//")
        ? requestedNext
        : "/app";
  if (code) {
    const s = await createClient();
    const { error } = await s.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(next, url.origin));
  }
  return NextResponse.redirect(
    new URL(
      "/login?error=Authentication+link+is+invalid+or+expired",
      url.origin,
    ),
  );
}
