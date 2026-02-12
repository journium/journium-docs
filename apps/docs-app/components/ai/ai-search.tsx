'use client';
import {
  type ComponentProps,
  createContext,
  type ReactNode,
  type SyntheticEvent,
  use,
  useContext,
  useEffect,
  useEffectEvent,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Loader2, RefreshCw, Send, User, X } from 'lucide-react';
import { cn } from '../../lib/cn';
import { buttonVariants } from '../ui/button';
import Link from 'fumadocs-core/link';
import { type UIMessage, useChat, type UseChatHelpers } from '@ai-sdk/react';
import type { ProvideLinksToolSchema } from '../../lib/inkeep-qa-schema';
import type { z } from 'zod';
import { DefaultChatTransport } from 'ai';
import { Markdown } from '../markdown';
import { Presence } from '@radix-ui/react-presence';
import Image from 'next/image';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '../ui/sheet';
import { JrSparkles } from '../icons/jr-sparkles';

const Context = createContext<{
  open: boolean;
  setOpen: (open: boolean) => void;
  chat: UseChatHelpers<UIMessage>;
  lockMessage: string | null;
} | null>(null);

function useChatContext() {
  return use(Context)!.chat;
}

function Header({ showClose = true }: { showClose?: boolean }) {
  const { setOpen } = use(Context)!;

  return (
    <div className="sticky top-0 z-10 -mx-2 -mt-2 xl:-mx-4 xl:-mt-4 backdrop-blur-lg bg-fd-background/80 border-b border-fd-border/50">
      <div className="flex items-center justify-between px-4 xl:px-6 py-4">
        <div className="flex-1">
          <p className="text-base font-semibold mb-1">Ask AI</p>
          <p className="text-xs text-fd-muted-foreground">
            Ask questions about Journium documentation
          </p>
        </div>
        {showClose && (
          <button
            aria-label="Close"
            className={cn(
              buttonVariants({
                size: 'icon-sm',
                color: 'ghost',
                className: 'rounded-full hover:bg-fd-accent',
              }),
              'cursor-pointer',
            )}
            onClick={() => setOpen(false)}
          >
            <X className="size-4" />
          </button>
        )}
      </div>
    </div>
  );
}

function SearchAIActions() {
  const { messages, status, setMessages, regenerate } = useChatContext();
  const isLoading = status === 'streaming';

  if (messages.length === 0) return null;

  return (
    <>
      {!isLoading && messages.at(-1)?.role === 'assistant' && (
        <button
          type="button"
          className={cn(
            buttonVariants({
              color: 'secondary',
              size: 'sm',
              className: 'rounded-full gap-1.5',
            }), 'cursor-pointer',
          )}
          onClick={() => regenerate()}
        >
          <RefreshCw className="size-4 cursor-pointer" />
          Retry
        </button>
      )}
      <button
        type="button"
        className={cn(
          buttonVariants({
            color: 'secondary',
            size: 'sm',
            className: 'rounded-full',
          }), 'cursor-pointer',
        )}
        onClick={() => setMessages([])}
      >
        Clear Chat
      </button>
    </>
  );
}

const StorageKeyInput = '__ai_search_input';
function SearchAIInput(props: ComponentProps<'form'>) {
  const { status, sendMessage, stop } = useChatContext();
  const [input, setInput] = useState(() => localStorage.getItem(StorageKeyInput) ?? '');
  const isLoading = status === 'streaming' || status === 'submitted';
  const onStart = (e?: SyntheticEvent) => {
    e?.preventDefault();
    void sendMessage({ text: input });
    setInput('');
  };

  localStorage.setItem(StorageKeyInput, input);

  useEffect(() => {
    if (isLoading) document.getElementById('nd-ai-input')?.focus();
  }, [isLoading]);

  return (
    <form {...props} className={cn('flex items-start pe-2', props.className)} onSubmit={onStart}>
      <Input
        value={input}
        placeholder={isLoading ? 'AI is answering...' : 'Ask a question'}
        autoFocus
        className="p-3"
        disabled={status === 'streaming' || status === 'submitted'}
        onChange={(e) => {
          setInput(e.target.value);
        }}
        onKeyDown={(event) => {
          if (!event.shiftKey && event.key === 'Enter') {
            onStart(event);
          }
        }}
      />
      {isLoading ? (
        <button
          key="bn"
          type="button"
          className={cn(
            buttonVariants({
              color: 'secondary',
              className: 'transition-all rounded-full mt-2 gap-2',
            }), 'cursor-pointer',
          )}
          onClick={stop}
        >
          <Loader2 className="size-4 animate-spin text-fd-muted-foreground" />
          Abort Answer
        </button>
      ) : (
        <button
          key="bn"
          type="submit"
          className={cn(
            buttonVariants({
              color: 'secondary',
              className: 'transition-all rounded-full mt-2',
            }), 'cursor-pointer',
          )}
          disabled={input.length === 0}
        >
          <Send className="size-4" />
        </button>
      )}
    </form>
  );
}

function List(props: Omit<ComponentProps<'div'>, 'dir'>) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    function callback() {
      const container = containerRef.current;
      if (!container) return;

      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'instant',
      });
    }

    const observer = new ResizeObserver(callback);
    callback();

    const element = containerRef.current?.firstElementChild;

    if (element) {
      observer.observe(element);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      {...props}
      className={cn('fd-scroll-container overflow-y-auto min-w-0 flex flex-col select-text [touch-action:pan-y]', props.className)}
      data-vaul-no-drag
    >
      {props.children}
    </div>
  );
}

function Input(props: ComponentProps<'textarea'>) {
  const ref = useRef<HTMLDivElement>(null);
  const shared = cn('col-start-1 row-start-1', props.className);

  return (
    <div className="grid flex-1">
      <textarea
        id="nd-ai-input"
        {...props}
        className={cn(
          'resize-none bg-transparent placeholder:text-fd-muted-foreground focus-visible:outline-none',
          shared,
        )}
      />
      <div ref={ref} className={cn(shared, 'break-all invisible')}>
        {`${props.value?.toString() ?? ''}\n`}
      </div>
    </div>
  );
}

const roleName: Record<string, string> = {
  user: 'You',
  assistant: 'Journium',
};

function Message({ message, ...props }: { message: UIMessage } & ComponentProps<'div'>) {
  let markdown = '';
  let links: z.infer<typeof ProvideLinksToolSchema>['links'] = [];

  for (const part of message.parts ?? []) {
    if (part.type === 'text') {
      markdown += part.text;
      continue;
    }

    if (part.type === 'tool-provideLinks' && part.input) {
      links = (part.input as z.infer<typeof ProvideLinksToolSchema>).links;
    }
  }

  // Show loading dots if this is an assistant message with no content yet
  const hasContent = markdown.trim().length > 0;

  return (
    <div {...props} data-vaul-no-drag className="select-text">
      <p
        className={cn(
          'mb-1 text-base font-medium text-fd-muted-foreground flex items-center gap-1.5',
          message.role === 'assistant' && 'text-fd-primary',
        )}
      >
        {message.role === 'user' && (
          <span className="flex items-center justify-center size-6 rounded-full bg-fd-muted text-fd-muted-foreground">
            <User className="size-4" />
          </span>
        )}
        {message.role === 'assistant' && (
          <span className="flex items-center justify-center size-6 rounded-full overflow-hidden">
            <Image
              src="/images/journium_logo_light_v1.svg"
              alt="Journium"
              width={24}
              height={24}
              className="w-full h-full object-cover dark:hidden"
            />
            <Image
              src="/images/journium_logo_dark_v1.svg"
              alt="Journium"
              width={24}
              height={24}
              className="hidden w-full h-full object-cover dark:block"
            />
          </span>
        )}
        {roleName[message.role] ?? 'unknown'}
      </p>
      {!hasContent && message.role === 'assistant' ? (
        <LoadingDots />
      ) : (
        <>
          <div className="prose text-sm">
            <Markdown text={markdown} />
          </div>
          {links && links.length > 0 && (
            <div className="mt-2 flex flex-row flex-wrap items-center gap-1">
              {links.map((item, i) => (
                <Link
                  key={i}
                  href={item.url}
                  className="block text-xs rounded-lg border p-3 hover:bg-fd-accent hover:text-fd-accent-foreground"
                >
                  <p className="font-medium">{item.title}</p>
                  <p className="text-fd-muted-foreground">Reference {item.label}</p>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function LoadingDots() {
  return (
    <div className="flex items-center gap-1 py-2">
      <span className="size-2 rounded-full bg-fd-muted-foreground/40 animate-[bounce_1s_ease-in-out_infinite]" />
      <span className="size-2 rounded-full bg-fd-muted-foreground/40 animate-[bounce_1s_ease-in-out_0.1s_infinite]" />
      <span className="size-2 rounded-full bg-fd-muted-foreground/40 animate-[bounce_1s_ease-in-out_0.2s_infinite]" />
    </div>
  );
}

function ChatContent() {
  const { chat, lockMessage } = use(Context)!;

  return (
    <>
      <List
        className="px-3 py-4 flex-1 overscroll-contain"
        style={{
          maskImage:
            'linear-gradient(to bottom, transparent, white 1rem, white calc(100% - 1rem), transparent 100%)',
        }}
      >
        <div className="flex flex-col gap-4">
          {chat.messages
            .filter((msg) => msg.role !== 'system')
            .map((item) => (
              <Message key={item.id} message={item} />
            ))}
          {(lockMessage || chat.error) && (
            <div className="rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950 p-4">
              <p className="text-sm text-red-800 dark:text-red-200 font-medium mb-1">
                Conversation Locked
              </p>
              <p className="text-sm text-red-700 dark:text-red-300">
                {lockMessage || 'This conversation has been locked due to repeated off-topic questions. Please refresh the page to start a new conversation.'}
              </p>
            </div>
          )}
        </div>
      </List>
      <div className="rounded-xl border bg-fd-card text-fd-card-foreground has-focus-visible:ring-2 has-focus-visible:ring-fd-ring">
        <SearchAIInput />
        <div className="flex items-center gap-1.5 p-1 empty:hidden">
          <SearchAIActions />
        </div>
      </div>
    </>
  );
}

export function AISearch({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [lockMessage, setLockMessage] = useState<string | null>(null);
  
  const chat = useChat({
    id: 'search',
    transport: new DefaultChatTransport({
      api: '/api/chat',
    }),
    onError: (error) => {
      // Suppress console logging for conversation lock errors
      if (error.message?.includes('conversation_locked') || error.message?.includes('repeated off-topic')) {
        // Set friendly message without logging
        setLockMessage('This conversation has been locked due to repeated off-topic questions. Please refresh the page to start a new conversation.');
        return; // Don't log to console
      }
      // Log other errors normally
      console.error('Chat error:', error);
    },
  });

  return (
    <Context value={useMemo(() => ({ chat, open, setOpen, lockMessage }), [chat, open, lockMessage])}>{children}</Context>
  );
}

export function AISearchTrigger({ 
  className,
  onClick,
  variant = 'default',
  ...props 
}: ComponentProps<'button'> & { variant?: 'default' | 'icon' }) {
  const context = useContext(Context);
  
  // If context is not available, return null (component is outside AISearch provider)
  if (!context) {
    return null;
  }

  const { open, setOpen } = context;

  const handleClick: ComponentProps<'button'>['onClick'] = (e) => {
    // Call the passed onClick handler first (e.g., to close search dialog)
    onClick?.(e);
    // Then open the AI search panel
    setOpen(true);
  };

  // Icon-only variant for mobile
  if (variant === 'icon') {
    return (
      <button
        {...props}
        className={cn(
          buttonVariants({
            variant: 'ghost',
            size: 'icon-sm',
          }),
          'cursor-pointer h-8 w-8',
          className,
        )}
        onClick={handleClick}
        title="Ask AI"
        aria-label="Ask AI"
      >
        <JrSparkles className="size-4" />
      </button>
    );
  }

  // Default variant with text
  return (
    <button
      {...props}
      className={cn(
        buttonVariants({
          variant: 'secondary',
        }),
        'h-8 gap-3 text-fd-muted-foreground rounded-2xl transition-[translate,opacity]',
        // Default fixed positioning styles (can be overridden with className)
        !className && 'fixed bottom-4 w-24 end-[calc(--spacing(4)+var(--removed-body-scroll-bar-size,0px))] shadow-lg z-20',
        open && !className && 'translate-y-10 opacity-0',
        className,
      )}
      onClick={handleClick}
    >
      <JrSparkles className="size-4" />
      Ask AI
    </button>
  );
}

export function AISearchPanel() {
  const { open, setOpen } = use(Context)!;
  const [isMobile, setIsMobile] = useState(false);
  const [viewportHeight, setViewportHeight] = useState<number | null>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle iOS keyboard positioning with Visual Viewport API
  useEffect(() => {
    if (!isMobile || !open) return;

    const handleViewportResize = () => {
      if (window.visualViewport) {
        // Use a small delay to ensure accurate height on iOS
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setViewportHeight(window.visualViewport!.height);
          });
        });
      }
    };

    if (window.visualViewport) {
      handleViewportResize(); // Set initial height
      window.visualViewport.addEventListener('resize', handleViewportResize);
      return () => {
        window.visualViewport?.removeEventListener('resize', handleViewportResize);
      };
    }
  }, [isMobile, open]);

  const onKeyPress = useEffectEvent((e: KeyboardEvent) => {
    if (e.key === 'Escape' && open) {
      setOpen(false);
      e.preventDefault();
    }

    if (e.key === '/' && (e.metaKey || e.ctrlKey) && !open) {
      setOpen(true);
      e.preventDefault();
    }
  });

  useEffect(() => {
    window.addEventListener('keydown', onKeyPress);
    return () => window.removeEventListener('keydown', onKeyPress);
  }, []);

  return (
    <>
      {/* Mobile: Sheet */}
      {isMobile && (
        <Sheet open={open} onOpenChange={setOpen} side="bottom">
          <SheetContent 
            side="bottom" 
            className="px-4 pb-6"
            style={viewportHeight ? {
              maxHeight: `${viewportHeight}px`,
              height: `${Math.min(viewportHeight * 0.85, viewportHeight)}px`,
            } : undefined}
          >
            <SheetHeader className="mb-4">
              <SheetTitle>Ask AI</SheetTitle>
              <SheetDescription>
                Ask questions about Journium documentation
              </SheetDescription>
            </SheetHeader>
            <div 
              className="flex flex-col"
              style={viewportHeight ? {
                height: `${viewportHeight * 0.85 - 160}px`, // Subtract header and padding
              } : {
                height: 'calc(85dvh - 10rem)',
              }}
            >
              <ChatContent />
            </div>
          </SheetContent>
        </Sheet>
      )}

      {/* Desktop: Sidebar */}
      {!isMobile && (
        <>
          <style>
            {`
            @keyframes ask-ai-open {
              from {
                width: 0px;
              }
              to {
                width: var(--ai-chat-width);
              }
            }
            @keyframes ask-ai-close {
              from {
                width: var(--ai-chat-width);
              }
              to {
                width: 0px;
              }
            }`}
          </style>
          <Presence present={open}>
            <div
              className={cn(
                'overflow-hidden z-30 bg-fd-popover text-fd-popover-foreground [--ai-chat-width:400px] xl:[--ai-chat-width:460px]',
                'sticky top-0 h-dvh border-s ms-auto in-[#nd-docs-layout]:[grid-area:toc] in-[#nd-notebook-layout]:row-span-full in-[#nd-notebook-layout]:col-start-5',
                open
                  ? 'animate-[ask-ai-open_200ms]'
                  : 'animate-[ask-ai-close_200ms]',
              )}
            >
              <div className="flex flex-col p-2 size-full w-(--ai-chat-width) xl:p-4">
                <Header showClose={true} />
                <ChatContent />
              </div>
            </div>
          </Presence>
        </>
      )}
    </>
  );
}
