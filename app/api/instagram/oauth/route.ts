import { NextResponse } from 'next/server';

// Meta OAuth Configuration
const APP_ID = process.env.INSTAGRAM_APP_ID;
const APP_SECRET = process.env.INSTAGRAM_APP_SECRET;
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/api/instagram/oauth/callback`;

// Scopes necessários para publicar conteúdo no Instagram
const SCOPES = [
  'instagram_basic',
  'instagram_content_publish',
  'instagram_manage_comments',
  'pages_show_list',
  'pages_read_engagement',
].join(',');

export async function GET() {
  // Gera a URL de autorização do Facebook/Instagram OAuth
  if (!APP_ID) {
    return NextResponse.json({
      error: 'Instagram App ID não configurado',
      setup_instructions: {
        step1: 'Acesse https://developers.facebook.com/ e crie uma conta de desenvolvedor',
        step2: 'Crie um novo App (tipo: Business)',
        step3: 'Adicione o produto "Facebook Login for Business"',
        step4: 'Nas configurações do App, copie o App ID e App Secret',
        step5: 'Cole no arquivo .env.local: INSTAGRAM_APP_ID=xxx e INSTAGRAM_APP_SECRET=xxx',
        step6: 'Adicione a URI de redirect nas configurações do OAuth: ' + REDIRECT_URI,
      }
    }, { status: 400 });
  }

  const authUrl = `https://www.facebook.com/v20.0/dialog/oauth?client_id=${APP_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${SCOPES}&response_type=code`;

  return NextResponse.json({ authUrl });
}
