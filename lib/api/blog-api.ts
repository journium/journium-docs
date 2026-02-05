/**
 * Blog API Client
 * Handles all blog-related API calls
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';

export interface BlogSubscriptionRequest {
  email: string;
}

export interface BlogSubscriptionResponse {
  success: boolean;
  message?: string;
}

export interface ApiError {
  error: string;
}

/**
 * Subscribe to blog updates
 */
export async function subscribeToBlog(
  email: string
): Promise<BlogSubscriptionResponse> {
  const response = await fetch(`${API_URL}/api/v1/blog/subscribe`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ error: 'Failed to subscribe' }));
    throw new Error(errorData.error || 'Failed to subscribe');
  }

  return response.json();
}

/**
 * Unsubscribe from blog updates
 */
export async function unsubscribeFromBlog(
  email: string
): Promise<BlogSubscriptionResponse> {
  const response = await fetch(`${API_URL}/api/v1/blog/unsubscribe`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ error: 'Failed to unsubscribe' }));
    throw new Error(errorData.error || 'Failed to unsubscribe');
  }

  return response.json();
}

/**
 * Check subscription status for an email
 */
export async function getSubscriptionStatus(email: string): Promise<{
  subscribed: boolean;
  email: string;
}> {
  const response = await fetch(
    `${API_URL}/api/v1/blog/subscription-status/${encodeURIComponent(email)}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ error: 'Failed to check subscription status' }));
    throw new Error(errorData.error || 'Failed to check subscription status');
  }

  return response.json();
}
