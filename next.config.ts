import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['apify-client', 'ffmpeg-static'],
};

export default nextConfig;
