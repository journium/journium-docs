import { Button } from './ui/button';
import { ExternalLink } from 'lucide-react';

interface CTAProps {
  title?: string;
  description?: string;
  buttonText?: string;
  buttonLink?: string;
}

export function CTA({
  title = '',
  description = '',
  buttonText = 'Sign up for free',
  buttonLink = 'https://journium.app/signup',
}: CTAProps) {
  return (
    <div className="not-prose @container/main rounded-2xl border bg-fd-card p-4 shadow-sm">
      <div className="flex flex-col gap-4 @[640px]/main:flex-row @[640px]/main:items-center @[640px]/main:justify-between">

        <div className="flex flex-col gap-2">
        {title && (
        <span className="text-base font-semibold text-fd-foreground">
          {title}
        </span>
        )}
        {description && (
        <span className="text-sm text-fd-foreground">
          <p className="text-base text-fd-foreground">
            {description}
          </p>
        </span>
        )}
        </div>
        <Button
          href={buttonLink}
          target="_blank"
          rel="noopener noreferrer"
          variant="primary"
          size="md"
          className="whitespace-nowrap"
        >
          <span>{buttonText}</span>
          <ExternalLink className="ml-2 size-4" />
        </Button>
      </div>
    </div>
  );
}
