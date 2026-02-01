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

  // Convert "Arun Patra" to "arun-patra"
  const getImageFilename = (authorName: string): string => {
    return authorName.toLowerCase().replace(/\s+/g, '-');
  };

  const filename = getImageFilename(name);
  const imagePath = imageError 
    ? '/blog/authors/default-avatar.svg' 
    : `/blog/authors/${filename}.png`;

  return (
    <div className={`relative rounded-full overflow-hidden bg-fd-muted border border-fd-muted-foreground/20 ${className}`} style={{ width: size, height: size }}>
      <Image
        src={imagePath}
        alt={`${name}'s avatar`}
        width={size}
        height={size}
        className="object-cover"
        onError={() => setImageError(true)}
      />
    </div>
  );
}
