/**
 * Custom image loader for Next.js Image component
 * Ensures absolute URLs when NEXT_PUBLIC_ASSET_PREFIX is set
 * This fixes the issue where images accessed via journium.app/docs
 * try to use journium.app/_next/image instead of docs.journium.app/_next/image
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
  const baseUrl = process.env.NEXT_PUBLIC_ASSET_PREFIX || '';
  
  if (baseUrl) {
    // Use absolute URL when assetPrefix is set
    const params = new URLSearchParams({
      url: src.startsWith('/') ? src : `/${src}`,
      w: width.toString(),
      q: (quality || 75).toString(),
    });
    return `${baseUrl}/_next/image?${params.toString()}`;
  }
  
  // Default Next.js image optimization URL (relative)
  const params = new URLSearchParams({
    url: src.startsWith('/') ? src : `/${src}`,
    w: width.toString(),
    q: (quality || 75).toString(),
  });
  return `/_next/image?${params.toString()}`;
}
