import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "apify-client",
    "ffmpeg-static",
    "ffprobe-static",
    "instagram-private-api",
    "@prisma/client",
  ],
};

export default nextConfig;
