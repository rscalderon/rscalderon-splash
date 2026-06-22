import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Match every path EXCEPT Next.js build output (/_next/*).
        //
        // Content-hashed assets under /_next/static/* are already served with
        // `public, max-age=31536000, immutable` by Next.js, so they need no rule here —
        // a new deploy produces new hashed filenames, so a long cache is always safe.
        //
        // Everything else — HTML documents and the non-hashed files in /public — lives at
        // a STABLE URL. Caching those for a day would mask a fresh deploy: returning
        // visitors keep the stale HTML (which references stale chunks) until the cache
        // expires. `no-store` forces a re-fetch, so deploys are picked up immediately.
        source: '/:path((?!_next/).*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
