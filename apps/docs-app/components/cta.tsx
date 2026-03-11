import { Button } from './ui/button';
import { Download, ExternalLink } from 'lucide-react';

interface CTAProps {
  title?: string;
  description?: string;
  link?: string;
  buttonText?: string;
  buttonLink?: string;
  download?: boolean;
}

export function CTA({
  title = '',
  description = '',
  link,
  buttonText = 'Sign up for free',
  buttonLink = 'https://journium.app/signup',
  download = false,
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
            {link ? (
              <a href={link} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:opacity-80 transition-opacity">
                {description}
              </a>
            ) : (
              description
            )}
          </p>
        </span>
        )}
        </div>
        {download ? (
          <a
            href={buttonLink} target="_blank" rel="noopener noreferrer" download
            className="inline-flex items-center whitespace-nowrap rounded-lg bg-fd-primary px-4 py-2 text-sm font-medium text-fd-primary-foreground shadow-sm hover:opacity-90 transition-opacity"
          >
            <span>{buttonText}</span>
            <Download className="ml-2 size-4" />
          </a>
        ) : (
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
        )}
      </div>
    </div>
  );
}
