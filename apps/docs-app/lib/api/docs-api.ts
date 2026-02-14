/**
 * Docs API Client
 * Handles all documentation-related API calls
 */

import type { PageFeedback, BlockFeedback, ActionResponse } from '@/components/feedback/schema';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';

/**
 * Submit page-level feedback
 */
export async function submitPageFeedback(
  feedback: PageFeedback
): Promise<ActionResponse> {
  const response = await fetch(`${API_URL}/api/v1/docs/feedback/page`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(feedback),
  });

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ error: 'Failed to submit feedback' }));
    throw new Error(errorData.error || 'Failed to submit feedback');
  }

  return response.json();
}

/**
 * Submit block-level feedback.
 * NOTE: This is not implemented yet.
 */
export async function submitBlockFeedback(
  feedback: BlockFeedback
): Promise<ActionResponse> {
  const response = await fetch(`${API_URL}/api/v1/docs/feedback/block`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(feedback),
  });

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ error: 'Failed to submit feedback' }));
    throw new Error(errorData.error || 'Failed to submit feedback');
  }

  return response.json();
}
