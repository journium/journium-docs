import { Button } from './button';
import { ExternalLink } from 'lucide-react';

interface SignUpForFreeProps {
  message?: string;
}

export function SignUpForFree({
  message = 'Sign up now for free access to Journium',
}: SignUpForFreeProps) {
  return (
    <div className="not-prose @container/main rounded-2xl border bg-fd-card p-4 shadow-sm">
      <div className="flex flex-col gap-4 @[640px]/main:flex-row @[640px]/main:items-center @[640px]/main:justify-between">
        <span className="text-sm font-medium text-fd-foreground">
          {message}
        </span>
        <Button
          href="https://journium.app/signup"
          target="_blank"
          rel="noopener noreferrer"
          variant="primary"
          size="md"
          className="w-42 whitespace-nowrap"
        >
          <span>Sign Up for Free</span>
          <ExternalLink className="ml-2 size-4" />
        </Button>
      </div>
    </div>
  );
}
