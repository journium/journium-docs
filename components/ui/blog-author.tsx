import { BlogAuthorIcon } from './blog-author-icon';

interface BlogAuthorProps {
  author: string;
  date: string | Date;
}

export function BlogAuthor({ author, date }: BlogAuthorProps) {
  const formattedDate = new Date(date).toDateString();

  return (
    <div className="flex flex-row gap-4 items-center text-sm mb-8">
      <BlogAuthorIcon name={author} size={40} />
      <div className="flex flex-row gap-4">
        <div>
          <p className="font-medium">{author}</p>
          <p className=" text-sm text-fd-muted-foreground">{formattedDate}</p>
        </div>
      </div>
    </div>
  );
}
