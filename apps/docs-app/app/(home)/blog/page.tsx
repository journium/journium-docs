import { blog } from '@/lib/source';
import { PathUtils } from 'fumadocs-core/source';
import type { Metadata } from 'next';
import { BlogIndexCard } from '@/components/ui/blog-index-card';
import { BlogSubscribe } from '@/components/ui/blog-subscribe';
import { JourniumIcon } from '@/components/ui/journium-icon';

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
    <>
      {/* Bleeding Edge Hero Section */}
      <div className="relative w-full overflow-hidden bg-linear-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 dark:from-blue-500/20 dark:via-purple-500/20 dark:to-pink-500/20 backdrop-blur-sm">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -right-1/4 w-96 h-96 bg-blue-500/20 dark:bg-blue-400/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-1/2 -left-1/4 w-96 h-96 bg-purple-500/20 dark:bg-purple-400/30 rounded-full blur-3xl animate-pulse [animation-delay:2s]" />
        </div>

        {/* Journium Icon - Top Right Corner */}
        <div className="absolute top-4 right-4 md:top-8 md:right-8 z-20 opacity-40 dark:opacity-30 hover:opacity-60 dark:hover:opacity-50 transition-opacity duration-300">
          <JourniumIcon 
            size="lg" 
            className="md:h-24 md:w-24 lg:h-32 lg:w-32" 
            variant="default"
          />
        </div>

        {/* Content - Constrained */}
        <div className="relative z-10 mx-auto w-full max-w-page px-8 py-16 md:px-12 md:py-20">
          <div className="max-w-3xl">
            {/* Badge or tag */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-blue-500/10 dark:bg-blue-400/10 px-4 py-1.5 text-sm font-medium text-blue-700 dark:text-blue-300 border border-blue-500/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              Latest Updates
            </div>

            <h1 className="mb-4 text-4xl md:text-5xl lg:text-6xl font-bold bg-linear-to-br from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">
              Journium Blog
            </h1>
            
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
              Latest announcements, insights, and stories from Journium. 
              Discover how we&apos;re transforming telemetry into proactive intelligence.
            </p>

            {/* Optional: Add search or CTA */}
            <div className="mt-8 flex flex-wrap gap-4">
              <BlogSubscribe />
              {/* <button className="px-6 py-2.5 bg-white/50 dark:bg-gray-800/50 hover:bg-white/80 dark:hover:bg-gray-800/80 backdrop-blur-sm text-gray-900 dark:text-gray-100 rounded-lg font-medium transition-colors border border-gray-200 dark:border-gray-700">
                View All Posts
              </button> */}
            </div>
          </div>
        </div>

        {/* Decorative grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.05)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-size-[4rem_4rem] mask-[radial-gradient(ellipse_80%_50%_at_50%_50%,#000,transparent)]" />
      </div>

      {/* Blog posts grid */}
      <main className="mx-auto w-full max-w-page px-4 py-12">
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
    </>
  );
}
