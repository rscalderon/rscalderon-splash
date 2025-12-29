import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configure cache headers for static generation
  async headers() {
    return [
      {
        // Apply to all routes
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400', // 1 day TTL
          },
        ],
      },
      {
        // Aggressive caching for static assets
        source: '/:all*(svg|jpg|jpeg|png|gif|ico|webp|avif|woff|woff2|ttf|otf)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, immutable', // 1 day TTL for static assets
          },
        ],
      },
    ];
  },
};

export default nextConfig;
