import { BlogAuthorIcon } from './blog-author-icon';

interface BlogAuthorProps {
  author: string;
  date: string | Date;
  compact?: boolean;
}

export function BlogAuthor({ author, date, compact = false }: BlogAuthorProps) {
  const formattedDate = new Date(date).toDateString();

  if (compact) {
    return (
      <div className="flex flex-row gap-2 items-center text-xs">
        <BlogAuthorIcon name={author} size={32} />
        <div>
          <p className="font-medium text-fd-foreground">{author}</p>
          <p className="text-fd-muted-foreground">{formattedDate}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-row gap-4 items-center text-sm mb-8">
      <BlogAuthorIcon name={author} size={40} />
      <div className="flex flex-row gap-4">
      <div>
          <p className="font-medium text-fd-foreground">{author}</p>
          <p className="text-fd-muted-foreground">{formattedDate}</p>
        </div>
      </div>
    </div>
  );
}
