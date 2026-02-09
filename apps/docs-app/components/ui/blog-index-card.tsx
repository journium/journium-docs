import Link from 'next/link';
import { BlogAuthor } from './blog-author';

interface BlogIndexCardProps {
  url: string;
  title: string;
  description?: string;
  author: string;
  date: string | Date;
}

const MAX_DESCRIPTION_LENGTH = 200;

function truncateDescription(text: string | undefined, maxLength: number): React.ReactNode {
  if (!text) return null;
  
  if (text.length <= maxLength) {
    return text;
  }
  
  const truncated = text.slice(0, maxLength).trim();
  return (
    <>
      {truncated}
      <span className="underline">…</span>
    </>
  );
}

export function BlogIndexCard({
  url,
  title,
  description,
  author,
  date,
}: BlogIndexCardProps) {
  return (
    <Link
      href={url}
      className="flex flex-col bg-fd-card rounded-2xl border shadow-sm p-4 transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground"
    >
      <p className="font-medium mb-2">{title}</p>
      <p className="text-sm text-fd-muted-foreground mb-4">
        {truncateDescription(description, MAX_DESCRIPTION_LENGTH)}
      </p>

      <div className="mt-auto pt-4 border-t">
        <BlogAuthor author={author} date={date} compact />
      </div>
    </Link>
  );
}
