/**
 * Instagram Login (api.instagram.com) — variáveis esperadas no .env.local
 */
export function getMetaOAuthConfig(): {
  appId: string | undefined;
  appSecret: string | undefined;
  redirectUri: string;
  publicBaseUrl: string;
} {
  const appId = process.env.META_APP_ID?.trim();
  const appSecret =
    process.env.META_APP_SECRET?.trim() ||
    process.env.INSTAGRAM_APP_SECRET?.trim();

  const publicBaseUrl = (
    process.env.NEXT_PUBLIC_APP_URL ?? ""
  ).replace(/\/$/, "");

  const redirectUri = process.env.META_REDIRECT_URI?.trim().replace(/\/$/, "") || "";

  return { appId, appSecret, redirectUri, publicBaseUrl };
}
