import { BlogSubscribe } from '@/components/ui/blog-subscribe';

export function BlogPostSubscribeBannerSlim() {
  return (
    <div className="not-prose my-8 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 rounded-xl border border-blue-500/20 bg-blue-500/5 dark:bg-blue-500/10 px-5 py-4">
      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 sm:whitespace-nowrap sm:flex-shrink-0">
        Get posts like this in your inbox.
      </p>
      <div className="w-full sm:flex-1 sm:min-w-0">
        <BlogSubscribe compact showPrivacyNote={false} buttonLabel="Subscribe" />
      </div>
    </div>
  );
}
