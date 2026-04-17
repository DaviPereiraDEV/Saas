import { NextResponse } from 'next/server';
import { redirect } from 'next/navigation';

const APP_ID = process.env.INSTAGRAM_APP_ID;
const APP_SECRET = process.env.INSTAGRAM_APP_SECRET;
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/api/instagram/oauth/callback`;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');

  if (error) {
    // Usuário recusou a autorização
    return redirect('/accounts?error=auth_denied');
  }

  if (!code) {
    return redirect('/accounts?error=no_code');
  }

  try {
    // 1. Trocar o code por um Short-Lived Access Token
    const tokenUrl = `https://graph.facebook.com/v20.0/oauth/access_token?client_id=${APP_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&client_secret=${APP_SECRET}&code=${code}`;

    const tokenRes = await fetch(tokenUrl);
    const tokenData = await tokenRes.json();

    if (tokenData.error) {
      console.error('OAuth token error:', tokenData.error);
      return redirect('/accounts?error=token_failed');
    }

    const shortLivedToken = tokenData.access_token;

    // 2. Trocar por Long-Lived Token (60 dias)
    const longLivedUrl = `https://graph.facebook.com/v20.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${APP_ID}&client_secret=${APP_SECRET}&fb_exchange_token=${shortLivedToken}`;

    const longRes = await fetch(longLivedUrl);
    const longData = await longRes.json();
    const longLivedToken = longData.access_token || shortLivedToken;

    // 3. Buscar as Pages do usuário
    const pagesRes = await fetch(`https://graph.facebook.com/v20.0/me/accounts?access_token=${longLivedToken}`);
    const pagesData = await pagesRes.json();

    // 4. Para cada Page, buscar o Instagram Business Account vinculado
    const accounts = [];
    for (const page of (pagesData.data || [])) {
      const igRes = await fetch(`https://graph.facebook.com/v20.0/${page.id}?fields=instagram_business_account{id,username,profile_picture_url,followers_count}&access_token=${page.access_token}`);
      const igData = await igRes.json();

      if (igData.instagram_business_account) {
        accounts.push({
          igAccountId: igData.instagram_business_account.id,
          username: igData.instagram_business_account.username,
          profilePicUrl: igData.instagram_business_account.profile_picture_url,
          followersCount: igData.instagram_business_account.followers_count,
          pageId: page.id,
          pageName: page.name,
          pageAccessToken: page.access_token,
        });
      }
    }

    // 5. Salvar na sessão/cookie (por enquanto, passa via query params encodados)
    // Em produção, salvar no banco de dados
    const encodedAccounts = encodeURIComponent(JSON.stringify(accounts));
    return redirect(`/accounts?success=true&accounts=${encodedAccounts}`);

  } catch (err: any) {
    console.error('OAuth callback error:', err);
    return redirect('/accounts?error=server_error');
  }
}
