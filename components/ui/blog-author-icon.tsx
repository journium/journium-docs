'use client';

import Image from 'next/image';
import { useState, useEffect, startTransition } from 'react';
import { useTheme } from 'next-themes';

interface BlogAuthorIconProps {
  name: string;
  size?: number;
  className?: string;
}

export function BlogAuthorIcon({ name, size = 40, className = '' }: BlogAuthorIconProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [currentAttempt, setCurrentAttempt] = useState<'themed-svg' | 'themed-png' | 'svg' | 'png' | 'fallback'>('themed-svg');

  // Track mount state to prevent hydration mismatches
  useEffect(() => {
    startTransition(() => {
      setMounted(true);
    });
  }, []);

  // Reset attempt when theme changes
  useEffect(() => {
    if (mounted) {
      startTransition(() => {
        setCurrentAttempt('themed-svg');
      });
    }
  }, [resolvedTheme, mounted]);

  // Convert "Arun Patra" to "arun-patra"
  const getImageFilename = (authorName: string): string => {
    return authorName.toLowerCase().replace(/\s+/g, '-');
  };

  const filename = getImageFilename(name);
  
  const getImagePath = (): string => {
    if (currentAttempt === 'fallback') {
      return '/blog/authors/journium-team.svg';
    }

    // Use light theme as default during SSR/initial render
    const theme = mounted && resolvedTheme ? resolvedTheme : 'light';
    
    switch (currentAttempt) {
      case 'themed-svg':
        return `/blog/authors/${filename}-${theme}.svg`;
      case 'themed-png':
        return `/blog/authors/${filename}-${theme}.png`;
      case 'svg':
        return `/blog/authors/${filename}.svg`;
      case 'png':
        return `/blog/authors/${filename}.png`;
      default:
        return '/blog/authors/journium-team.svg';
    }
  };

  const handleImageError = () => {
    // Fallback chain: themed-svg -> themed-png -> svg -> png -> fallback
    startTransition(() => {
      switch (currentAttempt) {
        case 'themed-svg':
          setCurrentAttempt('themed-png');
          break;
        case 'themed-png':
          setCurrentAttempt('svg');
          break;
        case 'svg':
          setCurrentAttempt('png');
          break;
        case 'png':
          setCurrentAttempt('fallback');
          break;
      }
    });
  };

  const currentTheme = mounted && resolvedTheme ? resolvedTheme : 'light';
  const imageKey = `${filename}-${currentTheme}-${currentAttempt}`;

  return (
    <div className={`relative rounded-full overflow-hidden bg-fd-muted border border-fd-muted-foreground/20 ${className}`} style={{ width: size, height: size }}>
      <Image
        key={imageKey}
        src={getImagePath()}
        alt={`${name}'s avatar`}
        width={size}
        height={size}
        className="object-cover"
        onError={handleImageError}
        suppressHydrationWarning
      />
    </div>
  );
}
