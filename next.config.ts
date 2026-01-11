import { createMDX } from 'fumadocs-mdx/next'
import type { NextConfig } from "next";

const withMDX = createMDX({
  // customise the config file path
  // configPath: "source.config.ts"
});

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  serverExternalPackages: ['typescript', 'twoslash'],
  // Use assetPrefix to ensure assets load from the correct domain when accessed via rewrites
  // This is needed because when journium.app/docs rewrites to docs.journium.app/docs,
  // relative asset paths would otherwise resolve to the wrong domain
  // REQUIRED: Set NEXT_PUBLIC_ASSET_PREFIX=https://docs.journium.app in production
  assetPrefix: process.env.NEXT_PUBLIC_ASSET_PREFIX || undefined,
  // Image configuration - disable optimization to work with rewrites
  // When images are accessed via journium.app/docs (rewrite), Vercel's Image Optimization API
  // rejects proxied requests with INVALID_IMAGE_OPTIMIZE_REQUEST error.
  // Using unoptimized images allows them to load directly from the public folder,
  // which works correctly with rewrites via assetPrefix.
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/docs',
        permanent: true,
      },
      {
        source: '/docs/next',
        destination: '/docs',
        permanent: false,
      },
      {
        source: '/docs/next/:path*',
        destination: '/docs/:path*',
        permanent: false,
      },
    ];
  },
};

export default withMDX(nextConfig);
