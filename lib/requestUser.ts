import { randomUUID } from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const USER_COOKIE = "saas_user_id";
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

export async function getOrCreateRequestUserId(): Promise<{
  userId: string;
  created: boolean;
}> {
  const store = await cookies();
  const existing = store.get(USER_COOKIE)?.value?.trim();
  if (existing) {
    return { userId: existing, created: false };
  }
  return { userId: randomUUID(), created: true };
}

export function attachRequestUserCookie(
  response: NextResponse,
  userId: string,
): void {
  response.cookies.set({
    name: USER_COOKIE,
    value: userId,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ONE_YEAR_SECONDS,
  });
}
