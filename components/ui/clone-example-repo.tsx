import { buttonVariants } from './button';
import { ExternalLink, GitFork } from 'lucide-react';

interface CloneExampleRepoProps {
  repoUrl: string;
  repoName?: string;
  description?: string;
}

export function CloneExampleRepo({
  repoUrl,
  repoName = 'Example Repository',
  description = 'View the complete example code',
}: CloneExampleRepoProps) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border bg-fd-card p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="rounded-md bg-fd-primary/10 p-2">
          <GitFork className="size-5 text-fd-primary" />
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-fd-foreground">{repoName}</span>
          <span className="text-sm text-fd-muted-foreground">{description}</span>
        </div>
      </div>
      <a
        href={repoUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={buttonVariants({ variant: 'primary' })}
      >
        <span className="hidden sm:inline">View Repository</span>
        <span className="sm:hidden">View</span>
        <ExternalLink className="ml-2 size-4" />
      </a>
    </div>
  );
}