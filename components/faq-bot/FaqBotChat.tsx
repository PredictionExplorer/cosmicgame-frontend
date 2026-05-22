'use client';

import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { FaqBotSources } from './FaqBotSources';
import { FaqMarkdown } from './FaqMarkdown';
import type { FaqMessage } from './types';
import type { UseFaqBotSessionResult } from './useFaqBotSession';

function FaqBotMessageBubble({ message }: { message: FaqMessage }) {
  if (message.role === 'error') {
    return (
      <div className="w-full rounded-xl border border-destructive/40 bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive-foreground">
        {message.text}
      </div>
    );
  }

  const isUser = message.role === 'user';

  return (
    <div
      className={cn(
        'max-w-[92%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed',
        isUser
          ? 'ml-auto border border-primary/30 bg-primary/15 text-foreground'
          : 'mr-auto border border-white/[0.08] bg-white/[0.04] text-foreground',
      )}
    >
      {isUser ? (
        <p className="whitespace-pre-wrap">{message.text}</p>
      ) : (
        <>
          <FaqMarkdown content={message.text} />
          {message.sources?.length ? <FaqBotSources sources={message.sources} /> : null}
        </>
      )}
    </div>
  );
}

export interface FaqBotChatProps {
  session: UseFaqBotSessionResult;
  active: boolean;
}

export function FaqBotChat({ session, active }: FaqBotChatProps) {
  const { messages, loading, contextExpired, sendMessage, resetSession } = session;
  const [draft, setDraft] = useState('');
  const chatRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = chatRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages, loading]);

  useEffect(() => {
    if (active && !loading && !contextExpired) {
      textareaRef.current?.focus();
    }
  }, [active, contextExpired, loading]);

  const handleSend = async () => {
    const value = draft.trim();
    if (!value) return;
    setDraft('');
    await sendMessage(value);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void handleSend();
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div
        ref={chatRef}
        className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 py-3"
        aria-live="polite"
        aria-relevant="additions"
      >
        {messages.map((message) => (
          <FaqBotMessageBubble key={message.id} message={message} />
        ))}
        {loading ? (
          <div className="mr-auto flex max-w-[92%] items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3.5 py-2.5 text-sm italic text-muted-foreground">
            <Loader2 className="size-4 animate-spin text-primary" aria-hidden />
            Thinking…
          </div>
        ) : null}
      </div>

      <div className="border-t border-white/[0.08] px-4 py-3">
        {contextExpired ? (
          <div className="mb-3 flex items-center justify-between gap-3 rounded-lg border border-[rgb(var(--solar-gold-rgb)/0.35)] bg-[rgb(var(--solar-gold-rgb)/0.08)] px-3 py-2 text-sm text-foreground">
            <span>Context expired. Start a new chat to continue.</span>
            <Button type="button" size="sm" variant="secondary" onClick={resetSession}>
              New chat
            </Button>
          </div>
        ) : null}

        <div className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a follow-up question…"
            rows={2}
            disabled={loading || contextExpired}
            className={cn(
              'min-h-[52px] max-h-36 flex-1 resize-y rounded-md border border-input bg-background px-3 py-2 text-sm',
              'placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              'disabled:cursor-not-allowed disabled:opacity-50',
            )}
          />
          <Button
            type="button"
            size="sm"
            disabled={loading || contextExpired || !draft.trim()}
            onClick={() => void handleSend()}
            className="shrink-0"
          >
            Send
          </Button>
        </div>
        <p className="mt-1.5 text-xs text-muted-foreground">Enter to send · Shift+Enter for newline</p>
      </div>
    </div>
  );
}
