import { BlogSubscribe } from '@/components/ui/blog-subscribe';

export function BlogPostSubscribeBanner() {
  return (
    <div className="mt-16 rounded-2xl border border-blue-500/20 bg-linear-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 dark:from-blue-500/10 dark:via-purple-500/10 dark:to-pink-500/10 px-8 py-10 text-center">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
        Enjoyed this post?
      </h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 max-w-sm mx-auto">
        Get the latest insights and announcements from Journium delivered straight to your inbox.
      </p>
      <BlogSubscribe />
    </div>
  );
}
