import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import os from 'os';
import fs from 'fs';
import { spawn } from 'child_process';
import ffmpegPath from 'ffmpeg-static';

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
    
    // 2. Salvar buffer num arquivo temporário
    const tempDir = os.tmpdir();
    const tempId = uuidv4();
    const inputPath = path.join(tempDir, `input_${tempId}.mp4`);
    const outputPath = path.join(tempDir, `output_${tempId}.mp4`);
    
    fs.writeFileSync(inputPath, Buffer.from(videoBuffer));

    // 3. Rodar ffmpeg para remover metadados
    if (!ffmpegPath) {
      throw new Error("ffmpeg-static path not found");
    }

    await new Promise((resolve, reject) => {
      const ffmpeg = spawn(ffmpegPath, [
        '-i', inputPath,
        '-map_metadata', '-1', // Remove all metadata
        '-c:v', 'copy',        // Copy video stream without re-encoding
        '-c:a', 'copy',        // Copy audio stream without re-encoding
        outputPath
      ]);

      ffmpeg.on('close', (code) => {
        if (code === 0) resolve(null);
        else reject(new Error(`FFmpeg error exit code ${code}`));
      });
      
      ffmpeg.on('error', (err) => reject(err));
    });

    // 4. Ler o arquivo processado
    const processedVideo = fs.readFileSync(outputPath);

    // 5. Deletar os arquivos temporários após a leitura
    try {
      if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    } catch (e) {
      console.error("Cleanup error", e);
    }

    // 6. Retornar o vídeo sem metadados como stream de download
    return new NextResponse(processedVideo, {
      status: 200,
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Disposition': `attachment; filename="${filename || 'video_sem_metadados.mp4'}"`,
        'Content-Length': String(processedVideo.length),
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
