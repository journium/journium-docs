'use client';

import { useTheme } from 'next-themes';
import { Moon, Sun, Monitor } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export function ThemeSwitcher({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setTimeout(() => {
      setMounted(true);
    }, 0);
  }, []);

  if (!mounted) {
    return (
      <div
        className={cn(
          'flex items-center gap-0.5 rounded-full border border-fd-border bg-fd-background p-0.5',
          className
        )}
        {...props}
      >
        <div className="h-6 w-6 rounded-full" />
      </div>
    );
  }

  const currentTheme = theme === 'system' ? 'system' : resolvedTheme || 'light';

  return (
    <div
      className={cn(
        'flex items-center gap-0.5 rounded-full border border-fd-border bg-fd-background p-0.5',
        className
      )}
      {...props}
    >
      <button
        onClick={() => setTheme('light')}
        className={`flex h-6 w-6 items-center justify-center rounded-full transition-colors ${
          currentTheme === 'light' && theme !== 'system'
            ? 'bg-fd-accent text-fd-accent-foreground'
            : 'text-fd-muted-foreground hover:bg-fd-accent hover:text-fd-accent-foreground'
        }`}
        aria-label="Light theme"
        title="Light theme"
      >
        <Sun className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={() => setTheme('dark')}
        className={`flex h-6 w-6 items-center justify-center rounded-full transition-colors ${
          currentTheme === 'dark' && theme !== 'system'
            ? 'bg-fd-accent text-fd-accent-foreground'
            : 'text-fd-muted-foreground hover:bg-fd-accent hover:text-fd-accent-foreground'
        }`}
        aria-label="Dark theme"
        title="Dark theme"
      >
        <Moon className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={() => setTheme('system')}
        className={`flex h-6 w-6 items-center justify-center rounded-full transition-colors ${
          theme === 'system'
            ? 'bg-fd-accent text-fd-accent-foreground'
            : 'text-fd-muted-foreground hover:bg-fd-accent hover:text-fd-accent-foreground'
        }`}
        aria-label="System theme"
        title="System theme"
      >
        <Monitor className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

