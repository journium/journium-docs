'use client';

import Image from 'next/image';
import { useState } from 'react';

interface BlogAuthorIconProps {
  name: string;
  size?: number;
  className?: string;
}

export function BlogAuthorIcon({ name, size = 40, className = '' }: BlogAuthorIconProps) {
  const [imageError, setImageError] = useState(false);
  const [imageFormat, setImageFormat] = useState<'svg' | 'png'>('svg');

  // Convert "Arun Patra" to "arun-patra"
  const getImageFilename = (authorName: string): string => {
    return authorName.toLowerCase().replace(/\s+/g, '-');
  };

  const filename = getImageFilename(name);
  const getImagePath = (): string => {
    if (imageError) {
      return '/blog/authors/journium-team.svg';
    }
    return `/blog/authors/${filename}.${imageFormat}`;
  };

  const handleImageError = () => {
    // Try PNG if SVG fails
    if (imageFormat === 'svg') {
      setImageFormat('png');
    } else {
      // If PNG also fails, show default
      setImageError(true);
    }
  };

  return (
    <div className={`relative rounded-full overflow-hidden bg-fd-muted border border-fd-muted-foreground/20 ${className}`} style={{ width: size, height: size }}>
      <Image
        src={getImagePath()}
        alt={`${name}'s avatar`}
        width={size}
        height={size}
        className="object-cover"
        onError={handleImageError}
      />
    </div>
  );
}
