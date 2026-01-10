"use client";

import Image from 'next/image';
import { useTheme } from 'next-themes';
import { startTransition, useLayoutEffect, useState } from 'react';
import type { ComponentProps } from 'react';

interface ThemedImageProps extends Omit<ComponentProps<typeof Image>, 'src'> {
  srcLight: string;
  srcDark: string;
}

export function ThemedImage({ srcLight, srcDark, alt, ...props }: ThemedImageProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Track mount state to prevent hydration mismatches
  // Using startTransition to avoid linter warning about setState in effects
  useLayoutEffect(() => {
    startTransition(() => {
      setMounted(true);
    });
  }, []);

  // During SSR and initial hydration, show placeholder to avoid hydration mismatches
  if (!mounted || !resolvedTheme) {
    const width = typeof props.width === 'number' ? `${props.width}px` : props.width || 'auto';
    const height = typeof props.height === 'number' ? `${props.height}px` : props.height || 'auto';
    
    return (
      <div
        style={{
          width,
          height,
          backgroundColor: 'transparent',
          display: 'inline-block',
          position: 'relative',
          overflow: 'hidden',
        }}
        aria-label={alt}
        aria-hidden="true"
      />
    );
  }

  const src = resolvedTheme === 'dark' ? srcDark : srcLight;
  return <Image src={src} alt={alt || ''} suppressHydrationWarning {...props} />;
}
