import { Button } from '@/components/ui/button';
import { BookOpen, Play, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-fd-background px-4">
      <div className="flex max-w-md flex-col items-center gap-6 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="rounded-full bg-fd-muted p-4">
            <Search className="size-8 text-fd-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-fd-foreground">404</h1>
            <h2 className="text-xl font-semibold text-fd-foreground">
              Page Not Found
            </h2>
            <p className="text-fd-muted-foreground">
            Sorry, we can&apos;t find the page you&apos;re looking for.
            </p>
          </div>
        </div>
        
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            href="/docs"
            variant="primary"
            size="sm"
            className="gap-2"
          >
            <BookOpen className="size-4" />
            Docs Home
          </Button>
          <Button
            href="https://journium.app"
            variant="outline"
            size="sm"
            className="gap-2"
          >
            
            Go to homepage
            <Play className="size-2 fill-current" />
          </Button>
        </div>
      </div>
    </div>
  );
}

