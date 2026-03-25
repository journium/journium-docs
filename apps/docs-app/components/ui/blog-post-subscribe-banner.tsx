import { BlogSubscribe } from '@/components/ui/blog-subscribe';

export function BlogPostSubscribeBanner() {
  return (
    <div className="not-prose mt-12 rounded-2xl border border-blue-500/20 bg-linear-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 dark:from-blue-500/10 dark:via-purple-500/10 dark:to-pink-500/10 px-8 py-10 text-center">
      <BlogSubscribe
        title="Enjoyed this post?"
        subtitle="Get the latest insights and announcements from Journium delivered straight to your inbox."
        buttonLabel="Subscribe to Updates"
      />
    </div>
  );
}
