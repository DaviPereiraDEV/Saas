import { NextResponse } from "next/server";

/** @deprecated Configure o redirect em Meta para /api/auth/instagram/callback */
export async function GET(request: Request) {
  const base =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    new URL(request.url).origin;
  return NextResponse.redirect(
    `${base}/accounts?error=deprecated_oauth_path`,
    307,
  );
}
