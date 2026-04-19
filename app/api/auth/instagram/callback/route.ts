import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { encryptAccountPassword } from "@/lib/accountCrypto";
import {
  attachRequestUserCookie,
  getOrCreateRequestUserId,
} from "@/lib/requestUser";
import {
  exchangeCodeForShortLivedToken,
  exchangeForLongLivedToken,
  fetchInstagramProfile,
} from "@/lib/instagramGraphPublish";

const LOCALHOST_ACCOUNTS_URL = "http://localhost:3000/accounts";

export async function GET(request: Request) {
  const { userId, created } = await getOrCreateRequestUserId();
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  console.log("Code recebido:", code);
  const err = url.searchParams.get("error");
  const errDesc =
    url.searchParams.get("error_description") ||
    url.searchParams.get("error_reason");

  if (err) {
    console.error("[Instagram OAuth]", err, errDesc);
    const q = new URLSearchParams({
      error: "oauth_failed",
      detail: errDesc || err,
    });
    const response = NextResponse.redirect(`${LOCALHOST_ACCOUNTS_URL}?${q.toString()}`);
    if (created) attachRequestUserCookie(response, userId);
    return response;
  }

  if (!code) {
    const response = NextResponse.redirect(`${LOCALHOST_ACCOUNTS_URL}?error=no_code`);
    if (created) attachRequestUserCookie(response, userId);
    return response;
  }

  try {
    const short = await exchangeCodeForShortLivedToken(code);

    let accessToken = short.access_token;
    console.log("Token obtido:", accessToken);
    let tokenExpiresAt: Date | null = null;

    try {
      const long = await exchangeForLongLivedToken(short.access_token);
      accessToken = long.access_token;
      if (long.expires_in > 0) {
        tokenExpiresAt = new Date(Date.now() + long.expires_in * 1000);
      }
    } catch (e) {
      console.warn("[Instagram OAuth] Long-lived falhou; usando token curto.", e);
      tokenExpiresAt = new Date(Date.now() + 50 * 60 * 1000);
    }

    const profile = await fetchInstagramProfile(accessToken);
    if (!profile.id || !profile.username) {
      throw new Error("Perfil Instagram incompleto (id/username).");
    }
    console.log("Conta:", profile.username);

    let accessTokenEnc: string;
    try {
      accessTokenEnc = encryptAccountPassword(accessToken);
    } catch {
      throw new Error(
        "Defina INSTAGRAM_ACCOUNTS_SECRET (mín. 16 caracteres) no .env.local para guardar o token.",
      );
    }

    await prisma.instagramOAuthAccount.upsert({
      where: {
        userId_instagramUserId: {
          userId,
          instagramUserId: profile.id,
        },
      },
      create: {
        userId,
        instagramUserId: profile.id,
        username: profile.username,
        profilePictureUrl: profile.profile_picture_url ?? null,
        accessTokenEnc,
        tokenExpiresAt,
        lastError: null,
      },
      update: {
        username: profile.username,
        profilePictureUrl: profile.profile_picture_url ?? null,
        accessTokenEnc,
        tokenExpiresAt,
        lastError: null,
      },
    });

    const response = NextResponse.redirect("http://localhost:3000/accounts");
    if (created) attachRequestUserCookie(response, userId);
    return response;
  } catch (e: unknown) {
    console.error("[Instagram OAuth callback]", e);
    const msg = e instanceof Error ? e.message : "server_error";
    const q = new URLSearchParams({ error: "token_failed", detail: msg });
    const response = NextResponse.redirect(`${LOCALHOST_ACCOUNTS_URL}?${q.toString()}`);
    if (created) attachRequestUserCookie(response, userId);
    return response;
  }
}
