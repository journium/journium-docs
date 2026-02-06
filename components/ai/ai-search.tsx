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
import { Loader2, MessageCircleIcon, RefreshCw, Send, User, X } from 'lucide-react';
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

const Context = createContext<{
  open: boolean;
  setOpen: (open: boolean) => void;
  chat: UseChatHelpers<UIMessage>;
} | null>(null);

function useChatContext() {
  return use(Context)!.chat;
}

function Header() {
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
      className={cn('fd-scroll-container overflow-y-auto min-w-0 flex flex-col', props.className)}
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

  return (
    <div {...props}>
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
    </div>
  );
}

export function AISearch({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const chat = useChat({
    id: 'search',
    transport: new DefaultChatTransport({
      api: '/api/chat',
    }),
  });

  return (
    <Context value={useMemo(() => ({ chat, open, setOpen }), [chat, open])}>{children}</Context>
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
          'cursor-pointer',
          className,
        )}
        onClick={handleClick}
        title="Ask AI"
        aria-label="Ask AI"
      >
        <MessageCircleIcon className="size-4" />
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
        'gap-3 text-fd-muted-foreground rounded-2xl transition-[translate,opacity]',
        // Default fixed positioning styles (can be overridden with className)
        !className && 'fixed bottom-4 w-24 end-[calc(--spacing(4)+var(--removed-body-scroll-bar-size,0px))] shadow-lg z-20',
        open && !className && 'translate-y-10 opacity-0',
        className,
      )}
      onClick={handleClick}
    >
      <MessageCircleIcon className="size-4.5" />
      Ask AI
    </button>
  );
}

export function AISearchPanel() {
  const { open, setOpen } = use(Context)!;
  const chat = useChatContext();

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
          data-state={open ? 'open' : 'closed'}
          className="fixed inset-0 z-30 backdrop-blur-xs bg-fd-overlay data-[state=open]:animate-fd-fade-in data-[state=closed]:animate-fd-fade-out lg:hidden"
          onClick={() => setOpen(false)}
        />
      </Presence>
      <Presence present={open}>
        <div
          className={cn(
            'overflow-hidden z-30 bg-fd-popover text-fd-popover-foreground [--ai-chat-width:400px] xl:[--ai-chat-width:460px]',
            'max-lg:fixed max-lg:inset-x-2 max-lg:top-4 max-lg:border max-lg:rounded-2xl max-lg:shadow-xl',
            'lg:sticky lg:top-0 lg:h-dvh lg:border-s  lg:ms-auto lg:in-[#nd-docs-layout]:[grid-area:toc] lg:in-[#nd-notebook-layout]:row-span-full lg:in-[#nd-notebook-layout]:col-start-5',
            open
              ? 'animate-fd-dialog-in lg:animate-[ask-ai-open_200ms]'
              : 'animate-fd-dialog-out lg:animate-[ask-ai-close_200ms]',
          )}
        >
          <div className="flex flex-col p-2 size-full max-lg:max-h-[80dvh] lg:w-(--ai-chat-width) xl:p-4">
            <Header />
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
              </div>
            </List>
            <div className="rounded-xl border bg-fd-card text-fd-card-foreground has-focus-visible:ring-2 has-focus-visible:ring-fd-ring">
              <SearchAIInput />
              <div className="flex items-center gap-1.5 p-1 empty:hidden">
                <SearchAIActions />
              </div>
            </div>
          </div>
        </div>
      </Presence>
    </>
  );
}
