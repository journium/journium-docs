import { blog } from '@/lib/source';
import { PathUtils } from 'fumadocs-core/source';
import BannerImage from './banner.png';
import Image from 'next/image';
import type { Metadata } from 'next';
import { BlogIndexCard } from '@/components/ui/blog-index-card';

export const metadata: Metadata = {
  title: 'Journium Blog',
  description: 'Latest announcements and insights from Journium.',
};

function getName(path: string) {
  return PathUtils.basename(path, PathUtils.extname(path));
}

export default function Page() {
  const posts = [...blog.getPages()].sort(
    (a, b) =>
      new Date(b.data.date ?? getName(b.path)).getTime() -
      new Date(a.data.date ?? getName(a.path)).getTime(),
  );

  return (
    <main className="mx-auto w-full max-w-page px-4 pb-12 md:py-12">
      <div className="relative dark mb-4 aspect-[3.2] p-8 z-2 md:p-12">
        <Image
          src={BannerImage}
          priority
          alt="banner"
          className="absolute inset-0 size-full -z-1 object-cover"
        />
        <h1 className="mb-4 text-3xl text-landing-foreground font-medium">
          Journium Blog
        </h1>
        <p className="text-sm text-landing-foreground-200">
          Latest announcements from Journium.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-3 xl:grid-cols-4">
        {posts.map((post) => (
          <BlogIndexCard
            key={post.url}
            url={post.url}
            title={post.data.title}
            description={post.data.description}
            author={post.data.author}
            date={post.data.date ?? getName(post.path)}
          />
        ))}
      </div>
    </main>
  );
}
