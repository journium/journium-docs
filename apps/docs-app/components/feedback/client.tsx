'use client';
import { cn } from '../../lib/cn';
import { buttonVariants } from '../ui/button';
import { CornerDownRightIcon, MessageSquare, ThumbsDown, ThumbsUp } from 'lucide-react';
import {
  ReactNode,
  type SyntheticEvent,
  useState,
  useTransition,
} from 'react';
import { Collapsible, CollapsibleContent } from '../ui/collapsible';
import { cva } from 'class-variance-authority';
import { usePathname } from 'next/navigation';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import type { FeedbackBlockProps } from 'fumadocs-core/mdx-plugins/remark-feedback-block';
import {
  actionResponse,
  blockFeedback,
  type ActionResponse,
  type BlockFeedback,
  type PageFeedback,
} from './schema';
import { z } from 'zod/mini';

const rateButtonVariants = cva(
  'inline-flex items-center gap-2 px-3 py-1.5 rounded-full font-medium border text-sm [&_svg]:size-4 disabled:cursor-not-allowed cursor-pointer',
  {
    variants: {
      active: {
        true: 'bg-fd-accent text-fd-accent-foreground [&_svg]:fill-current',
        false: 'text-fd-muted-foreground',
      },
    },
  },
);

const blockFeedbackResult = z.extend(blockFeedback, {
  response: actionResponse,
});

/**
 * A feedback component to be attached at the end of page
 */
export function Feedback({
  onSendAction,
}: {
  onSendAction: (feedback: PageFeedback) => Promise<ActionResponse>;
}) {
  const url = usePathname();
  const [opinion, setOpinion] = useState<'good' | 'bad' | null>(null);
  const [message, setMessage] = useState('');
  const [isPending, startTransition] = useTransition();
  const [showTextArea, setShowTextArea] = useState(false);

  function submitOpinion(selectedOpinion: 'good' | 'bad') {
    setOpinion(selectedOpinion);
    
    startTransition(async () => {
      const feedback: PageFeedback = {
        url,
        opinion: selectedOpinion,
        message: '',
      };

      try {
        await onSendAction(feedback);
      } catch (error) {
        // Fail gracefully
        console.warn('Failed to submit feedback:', error);
      }
    });
  }

  function submitMessage(e?: SyntheticEvent) {
    if (opinion == null) return;

    startTransition(async () => {
      const feedback: PageFeedback = {
        url,
        opinion,
        message,
      };

      try {
        await onSendAction(feedback);
      } catch (error) {
        // Fail gracefully
        console.warn('Failed to submit feedback:', error);
      }
      
      setMessage('');
      setShowTextArea(false);
    });

    e?.preventDefault();
  }

  function toggleTextArea() {
    setShowTextArea(!showTextArea);
    if (showTextArea) {
      setMessage('');
    }
  }

  return (
    <Collapsible
      open={opinion !== null}
      onOpenChange={(v) => {
        if (!v) {
          setOpinion(null);
          setShowTextArea(false);
          setMessage('');
        }
      }}
      className="border-y py-3"
    >
      <div className="flex flex-row items-center gap-2">
        <p className="text-sm font-medium pe-2">How is this guide?</p>
        <button
          disabled={opinion !== null || isPending}
          className={cn(
            rateButtonVariants({
              active: opinion === 'good',
            }),
          )}
          onClick={() => submitOpinion('good')}
        >
          <ThumbsUp />
          Good
        </button>
        <button
          disabled={opinion !== null || isPending}
          className={cn(
            rateButtonVariants({
              active: opinion === 'bad',
            }),
          )}
          onClick={() => submitOpinion('bad')}
        >
          <ThumbsDown />
          Bad
        </button>
      </div>
      <CollapsibleContent className="mt-3">
        <div className="space-y-3">
          <div className="px-3 py-3 flex flex-col items-center gap-2 bg-fd-card text-fd-muted-foreground text-sm text-center rounded-xl">
            <p>Thank you for your feedback!</p>
            <button
              type="button"
              className={cn(
                buttonVariants({ color: 'secondary', size: 'sm' }),
                'cursor-pointer text-xs'
              )}
              onClick={toggleTextArea}
              disabled={isPending}
            >
              {showTextArea ? 'Hide details' : 'Add more details'}
            </button>
          </div>

          {showTextArea && (
            <form className="flex flex-col gap-3" onSubmit={submitMessage}>
              <textarea
                autoFocus
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="border rounded-lg bg-fd-secondary text-fd-secondary-foreground p-3 resize-none focus-visible:outline-none placeholder:text-fd-muted-foreground"
                placeholder="Leave your feedback..."
                rows={3}
                onKeyDown={(e) => {
                  if (!e.shiftKey && e.key === 'Enter') {
                    submitMessage(e);
                  }
                }}
              />
              <button
                type="submit"
                className={cn(buttonVariants({ color: 'secondary' }), 'w-fit px-3 cursor-pointer py-1.5')}
                disabled={isPending || !message.trim()}
              >
                Submit
              </button>
            </form>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

/**
 * A feedback component for each content block in page, should be used with `remark-feedback-block`.
 *
 * See https://fumadocs.dev/docs/integrations/feedback.
 */
export function FeedbackBlock({
  id,
  body,
  onSendAction,
  children,
}: FeedbackBlockProps & {
  onSendAction: (feedback: BlockFeedback) => Promise<ActionResponse>;
  children: ReactNode;
}) {
  const url = usePathname();
  const blockId = `${url}-${id}`;
  const { previous, setPrevious } = useSubmissionStorage(blockId, (v) => {
    const result = blockFeedbackResult.safeParse(v);
    if (result.success) return result.data;
    return null;
  });
  const [message, setMessage] = useState('');
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  function submit(e?: SyntheticEvent) {
    startTransition(async () => {
      const feedback: BlockFeedback = {
        blockId,
        blockBody: body,
        url,
        message,
      };

      const response = await onSendAction(feedback);
      setPrevious({
        response,
        ...feedback,
      });
      setMessage('');
    });

    e?.preventDefault();
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className="relative group/feedback">
        <div
          className={cn(
            'absolute -inset-1 rounded-sm pointer-events-none transition-colors duration-100 z-[-1]',
            open
              ? 'bg-fd-accent'
              : 'group-hover/feedback:bg-fd-accent group-hover/feedback:delay-100',
          )}
        />
        <PopoverTrigger
          className={cn(
            buttonVariants({ variant: 'secondary', size: 'sm' }),
            'absolute -top-7 end-0 backdrop-blur-sm text-fd-muted-foreground gap-1.5 transition-all duration-100 data-[state=open]:bg-fd-accent data-[state=open]:text-fd-accent-foreground',
            !open &&
              'opacity-0 pointer-events-none group-hover/feedback:pointer-events-auto group-hover/feedback:opacity-100 group-hover/feedback:delay-100 hover:pointer-events-auto hover:opacity-100 hover:delay-100',
          )}
          onClick={(e) => {
            setOpen((prev) => !prev);
            e.stopPropagation();
            e.preventDefault();
          }}
        >
          <MessageSquare className="size-3.5" />
          Feedback
        </PopoverTrigger>

        <div className="in-[.prose-no-margin]:prose-no-margin">{children}</div>
      </div>

      <PopoverContent className="min-w-[300px] bg-fd-card text-fd-card-foreground">
        {previous ? (
          <div className="flex flex-col items-center py-2 gap-2 text-fd-muted-foreground text-sm text-center rounded-xl">
            <p>Thank you for your feedback!</p>
            <div className="flex flex-row items-center gap-2">
              <a
                href={previous.response?.githubUrl}
                rel="noreferrer noopener"
                target="_blank"
                className={cn(
                  buttonVariants({
                    color: 'primary',
                  }),
                  'text-xs',
                )}
              >
                View on GitHub
              </a>

              <button
                className={cn(
                  buttonVariants({
                    color: 'secondary',
                  }),
                  'text-xs',
                )}
                onClick={() => {
                  setPrevious(null);
                }}
              >
                Submit Again
              </button>
            </div>
          </div>
        ) : (
          <form className="flex flex-col gap-2" onSubmit={submit}>
            <textarea
              autoFocus
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="border rounded-lg bg-fd-secondary text-fd-secondary-foreground p-3 resize-none focus-visible:outline-none placeholder:text-fd-muted-foreground"
              placeholder="Leave your feedback..."
              onKeyDown={(e) => {
                if (!e.shiftKey && e.key === 'Enter') {
                  submit(e);
                }
              }}
            />
            <button
              type="submit"
              className={cn(buttonVariants({ variant: 'secondary', size: 'sm' }), 'gap-1.5')}
              disabled={isPending}
            >
              <CornerDownRightIcon className="text-fd-muted-foreground size-4" />
              Submit
            </button>
          </form>
        )}
      </PopoverContent>
    </Popover>
  );
}

function useSubmissionStorage<Result>(blockId: string, validate: (v: unknown) => Result | null) {
  const storageKey = `docs-feedback-${blockId}`;
  const [value, setValue] = useState<Result | null>(() => {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') return null;
    
    const item = localStorage.getItem(storageKey);
    if (item === null) return null;
    try {
      return validate(JSON.parse(item));
    } catch {
      return null;
    }
  });

  return {
    previous: value,
    setPrevious(result: Result | null) {
      // Only access localStorage in browser
      if (typeof window === 'undefined') return;
      
      if (result) localStorage.setItem(storageKey, JSON.stringify(result));
      else localStorage.removeItem(storageKey);

      setValue(result);
    },
  };
}
