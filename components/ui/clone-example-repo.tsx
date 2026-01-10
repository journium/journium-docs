import { Button } from './button';
import { ExternalLink } from 'lucide-react';

interface CloneExampleRepoProps {
  repoUrl: string;
  message?: string;
}

export function CloneExampleRepo({
  repoUrl,
  message = 'Clone the example repository to get started quickly',
}: CloneExampleRepoProps) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border bg-fd-card p-4 shadow-sm">
      <span className="text-sm font-medium text-fd-foreground">
        {message}
      </span>
      <Button
        href={repoUrl}
        target="_blank"
        rel="noopener noreferrer"
        variant="primary"
        size="sm"
        className="w-36 whitespace-nowrap"
      >
        <span>View Repository</span>
        <ExternalLink className="ml-2 size-4" />
      </Button>
    </div>
  );
}