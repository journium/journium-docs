/**
 * Custom image loader for Next.js Image component
 * Ensures absolute URLs when NEXT_PUBLIC_ASSET_PREFIX is set
 * This fixes the issue where images accessed via journium.app/docs
 * try to use journium.app/_next/image instead of docs.journium.app/_next/image
 * 
 * Note: assetPrefix doesn't affect Next.js Image optimization URLs,
 * so we need a custom loader to handle this.
 */
export default function customImageLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}): string {
  const assetPrefix = process.env.NEXT_PUBLIC_ASSET_PREFIX || '';
  
  // Ensure src starts with /
  const imageSrc = src.startsWith('/') ? src : `/${src}`;
  
  // Build query parameters
  const params = new URLSearchParams({
    url: imageSrc,
    w: width.toString(),
    q: (quality || 75).toString(),
  });
  
  // If assetPrefix is set, use absolute URL
  // Otherwise, use relative URL (default Next.js behavior)
  if (assetPrefix) {
    return `${assetPrefix}/_next/image?${params.toString()}`;
  }
  
  return `/_next/image?${params.toString()}`;
}
