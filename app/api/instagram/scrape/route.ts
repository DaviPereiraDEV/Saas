import { NextResponse } from 'next/server';

const APIFY_TOKEN = process.env.APIFY_API_TOKEN;
// Actor: apify/instagram-scraper — busca posts de um perfil público
const ACTOR_ID = 'apify~instagram-scraper';

export async function POST(request: Request) {
  try {
    const { username } = await request.json();

    if (!username) {
      return NextResponse.json({ error: 'Username é obrigatório' }, { status: 400 });
    }

    if (!APIFY_TOKEN) {
      return NextResponse.json({ error: 'APIFY_API_TOKEN não configurada' }, { status: 500 });
    }

    const cleanUsername = username.replace('@', '').trim();

    // 1. Executar o actor do Apify de forma síncrona (aguarda resultado)
    // Usando run-sync-get-dataset-items para obter os dados diretamente
    const runUrl = `https://api.apify.com/v2/acts/${ACTOR_ID}/run-sync-get-dataset-items?token=${APIFY_TOKEN}`;

    const response = await fetch(runUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        directUrls: [`https://www.instagram.com/${cleanUsername}/`],
        resultsType: 'posts',
        resultsLimit: 30,
        // Pegar apenas vídeos/reels
        searchType: 'user',
        addParentData: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Apify error:', response.status, errorText);
      return NextResponse.json(
        { error: `Erro ao buscar dados do Instagram. Status: ${response.status}` },
        { status: 502 }
      );
    }

    const data = await response.json();

    // 2. Filtrar e formatar os resultados — pegar apenas posts com vídeo
    const videos = data
      .filter((post: any) => post.type === 'Video' || post.videoUrl)
      .map((post: any, index: number) => ({
        id: index + 1,
        shortCode: post.shortCode || '',
        caption: post.caption || '(sem legenda)',
        videoUrl: post.videoUrl || '',
        thumbnailUrl: post.displayUrl || post.previewUrl || '',
        likes: post.likesCount || 0,
        views: post.videoViewCount || post.videoPlayCount || 0,
        timestamp: post.timestamp || '',
        duration: '', // Instagram API não retorna duração diretamente
      }));

    // 3. Buscar dados do perfil (pegar do primeiro resultado se existir)
    const profileData = data.length > 0 ? {
      username: cleanUsername,
      fullName: data[0]?.ownerFullName || cleanUsername,
      profilePicUrl: data[0]?.ownerProfilePicUrl || '',
      followersCount: data[0]?.ownerId || 0,
    } : {
      username: cleanUsername,
      fullName: cleanUsername,
      profilePicUrl: '',
      followersCount: 0,
    };

    return NextResponse.json({
      success: true,
      profile: profileData,
      videos,
      totalPosts: data.length,
      totalVideos: videos.length,
    });

  } catch (error: any) {
    console.error('Scrape error:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
