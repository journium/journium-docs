'use client';

import { Search } from 'lucide-react';
import { cn } from '../../lib/cn';
import { AISearchTrigger } from '../ai/search';
import { useSearchContext } from 'fumadocs-ui/contexts/search';
import { useI18n } from 'fumadocs-ui/contexts/i18n';
import { buttonVariants } from '../ui/button';

/**
 * Custom search bar for desktop that includes both regular search and AI search
 */
export function CustomSearchWithAI() {
  const { enabled, hotKey, setOpenSearch } = useSearchContext();
  const { text } = useI18n();

  if (!enabled) return null;

  return (
    <div className="flex items-center gap-2 w-full">
      {/* Regular Search Bar */}
      <button
        type="button"
        data-search-full=""
        className={cn(
          'h-8 cursor-pointer inline-flex items-center gap-2 rounded-lg border bg-fd-secondary/50 p-1.5 ps-2 text-sm text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground flex-1 min-w-0',
        )}
        onClick={() => setOpenSearch(true)}
      >
        <Search className="size-4 shrink-0" />
        <span className="truncate">{text.search}</span>
        <div className="ms-auto inline-flex gap-0.5 shrink-0">
          {hotKey.map((k, i) => (
            <kbd key={i} className="rounded-md border bg-fd-background px-1.5">
              {k.display}
            </kbd>
          ))}
        </div>
      </button>

      {/* AI Search Trigger - styled to match and closes regular search if open */}
      <AISearchTrigger 
        onClick={() => {
          // Close regular search if it's open
          setOpenSearch(false);
        }}
        className={cn(
          buttonVariants({ variant: 'secondary', size: 'sm' }),
          'cursor-pointer gap-1.5 rounded-lg whitespace-nowrap shrink-0'
        )}
      />
    </div>
  );
}

/**
 * Custom search toggle for mobile - includes both regular search and AI trigger
 * Note: Returns a fragment with both buttons side-by-side
 */
export function CustomSearchToggleSm({ className, ...props }: { className?: string; hideIfDisabled?: boolean }) {
  const { setOpenSearch, enabled } = useSearchContext();
  
  if (!enabled) return null;

  return (
    <div className="flex items-center gap-2">
      {/* Regular Search Toggle */}
      <button
        type="button"
        {...props}
        className={cn(buttonVariants({ size: 'icon-sm', color: 'ghost' }), 'cursor-pointer', className)}
        data-search=""
        aria-label="Open Search"
        onClick={() => setOpenSearch(true)}
      >
        <Search />
      </button>
      
      {/* AI Search Trigger */}
      <AISearchTrigger 
        onClick={() => {
          // Close regular search if it's open
          setOpenSearch(false);
        }}
        className={cn(
          buttonVariants({ variant: 'ghost', size: 'icon-sm' }),
          'cursor-pointer',
          className
        )}
      />
    </div>
  );
}
