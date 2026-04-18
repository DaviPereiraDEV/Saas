import { NextResponse } from 'next/server';
import { ApifyClient } from 'apify-client';

const APIFY_TOKEN = process.env.APIFY_TOKEN;

export async function POST(request: Request) {
  try {
    const { username } = await request.json();

    if (!username) {
      return NextResponse.json({ error: 'Username é obrigatório' }, { status: 400 });
    }

    if (!APIFY_TOKEN) {
      return NextResponse.json({ error: 'APIFY_TOKEN não configurada' }, { status: 500 });
    }

    const cleanUsername = username.replace('@', '').trim();

    // Initialize the ApifyClient with API token
    const client = new ApifyClient({
      token: APIFY_TOKEN,
    });

    const inputReels = {
      username: [cleanUsername],
      resultsLimit: 9999,
    };

    const inputProfile = {
      usernames: [cleanUsername],
    };

    // Run both actors in parallel to save time
    const [runReels, runProfile] = await Promise.all([
      client.actor("apify/instagram-reel-scraper").call(inputReels),
      client.actor("apify/instagram-profile-scraper").call(inputProfile),
    ]);

    // Fetch and format Actor results
    const [reelsDataset, profileDataset] = await Promise.all([
      client.dataset(runReels.defaultDatasetId).listItems(),
      client.dataset(runProfile.defaultDatasetId).listItems(),
    ]);

    const items = reelsDataset.items;
    const profileItem = profileDataset.items[0] || {};

    const videos = items.map((post: any, index: number) => ({
      id: index + 1,
      shortCode: post.shortCode || '',
      caption: post.caption || '(sem legenda)',
      videoUrl: post.videoUrl || '',
      thumbnailUrl: post.displayUrl || post.thumbnailUrl || '',
      likes: post.likesCount || 0,
      comments: post.commentsCount || 0,
      views: post.videoViewCount || post.viewCount || post.playCount || 0,
      timestamp: post.timestamp || '',
    }));

    const profileData = {
      username: cleanUsername,
      fullName: profileItem.fullName || items[0]?.ownerFullName || cleanUsername,
      profilePicUrl: profileItem.profilePicUrlHD || profileItem.profilePicUrl || '',
      followersCount: profileItem.followersCount || 0,
    };

    return NextResponse.json({
      success: true,
      profile: profileData,
      videos,
      totalPosts: items.length,
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
