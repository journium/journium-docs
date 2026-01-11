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
  // Image configuration - ensure images can be optimized correctly
  images: {
    // Allow images from the same domain (docs.journium.app)
    // This ensures Next.js Image optimization works correctly
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'docs.journium.app',
      },
      {
        protocol: 'https',
        hostname: 'journium.app',
      },
    ],
    // Custom loader to ensure absolute URLs when assetPrefix is set
    // This fixes the issue where images accessed via journium.app/docs
    // try to use journium.app/_next/image instead of docs.journium.app/_next/image
    loader: 'custom',
    loaderFile: './lib/image-loader.ts',
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
