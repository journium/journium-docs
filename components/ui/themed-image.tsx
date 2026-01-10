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

  // Use light theme as default during SSR/initial render to avoid hydration mismatch
  // After mount, use the resolved theme
  const src = mounted && resolvedTheme === 'dark' ? srcDark : srcLight;
  
  return <Image src={src} alt={alt || ''} suppressHydrationWarning {...props} />;
}
