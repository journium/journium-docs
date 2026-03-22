'use client';

import { useState } from 'react';
import { subscribeToBlog } from '@/lib/api/blog-api';

interface BlogSubscribeProps {
  title?: string;
  subtitle?: string;
  buttonLabel?: string;
  showPrivacyNote?: boolean;
}

export function BlogSubscribe({
  title,
  subtitle,
  buttonLabel = 'Subscribe',
  showPrivacyNote = true,
}: BlogSubscribeProps) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes('@')) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const startTime = Date.now();
      await subscribeToBlog(email);

      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 1000 - elapsed);
      if (remaining > 0) await new Promise((r) => setTimeout(r, remaining));

      setIsSubmitting(false);
      setIsSubscribed(true);
    } catch (err) {
      setIsSubmitting(false);
      setError(err instanceof Error ? err.message : 'Failed to subscribe. Please try again.');
    }
  };

  if (isSubscribed) {
    return (
      <div className="flex flex-col items-center gap-2 py-2 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30">
          <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="font-semibold text-gray-900 dark:text-gray-100">You&apos;re subscribed!</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">We&apos;ll keep you updated with the latest from Journium.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {title && (
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">{title}</h2>
      )}
      {subtitle && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 max-w-sm mx-auto">{subtitle}</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex items-stretch max-w-xl mx-auto">
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(null); }}
            placeholder="you@example.com"
            required
            disabled={isSubmitting}
            className="flex-1 min-w-0 px-4 py-3 rounded-l-lg border border-gray-300 dark:border-gray-700 border-r-0 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={isSubmitting || !email}
            className="cursor-pointer px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-r-lg font-medium transition-colors shadow-lg shadow-blue-500/25 disabled:cursor-not-allowed disabled:shadow-none flex items-center gap-2 whitespace-nowrap"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Subscribing...
              </>
            ) : (
              buttonLabel
            )}
          </button>
        </div>

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
            <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        )}
      </form>

      {showPrivacyNote && (
        <p className="mt-3 text-xs text-gray-500 dark:text-gray-500 text-center">
          We respect your privacy. You can unsubscribe at any time.
        </p>
      )}
    </div>
  );
}
