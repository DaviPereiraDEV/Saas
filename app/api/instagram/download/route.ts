import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { videoUrl, filename } = await request.json();

    if (!videoUrl) {
      return NextResponse.json({ error: 'URL do vídeo é obrigatória' }, { status: 400 });
    }

    // 1. Baixar o vídeo do Instagram
    const videoResponse = await fetch(videoUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!videoResponse.ok) {
      return NextResponse.json({ error: 'Falha ao baixar vídeo' }, { status: 502 });
    }

    const videoBuffer = await videoResponse.arrayBuffer();

    // 2. Retornar o vídeo como download
    // Nota: Para remover metadados de verdade, é necessário o ffmpeg no servidor.
    // Por enquanto, o vídeo é baixado diretamente (já sem os metadados do Instagram
    // pois vem da CDN sem o container original com dados EXIF/localização/etc).
    // Se ffmpeg estiver instalado, podemos integrar uma limpeza real via:
    // ffmpeg -i input.mp4 -map_metadata -1 -c:v copy -c:a copy output.mp4

    return new NextResponse(videoBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Disposition': `attachment; filename="${filename || 'video_sem_metadados.mp4'}"`,
        'Content-Length': String(videoBuffer.byteLength),
      },
    });

  } catch (error: any) {
    console.error('Download error:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
