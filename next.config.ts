import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      { hostname: 'lh3.googleusercontent.com' },
      // Bilder av personer, lastet opp til Vercel Blob.
      { hostname: '*.public.blob.vercel-storage.com' },
    ],
  },
};

export default nextConfig;
