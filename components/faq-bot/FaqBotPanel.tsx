'use client';

import { useCallback, useState } from 'react';
import { Check, Copy, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { FaqBotChat } from './FaqBotChat';
import { formatFaqConversation, hasCopyableConversation } from './formatConversation';
import type { UseFaqBotSessionResult } from './useFaqBotSession';

export interface FaqBotPanelProps {
  open: boolean;
  onClose: () => void;
  session: UseFaqBotSessionResult;
}

export function FaqBotPanel({ open, onClose, session }: FaqBotPanelProps) {
  const { healthStatus, healthLabel, messages, sessionId } = session;
  const [copied, setCopied] = useState(false);
  const canCopy = hasCopyableConversation(messages);

  const handleCopy = useCallback(async () => {
    if (!canCopy) return;
    try {
      await navigator.clipboard.writeText(formatFaqConversation(messages, sessionId));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard failures are rare; avoid noisy UI for a secondary action.
    }
  }, [canCopy, messages, sessionId]);

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            aria-label="Close AI assistant"
            className="fixed inset-0 z-[65] bg-black/40 backdrop-blur-[2px] md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.section
            id="faq-bot-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="faq-bot-title"
            className={cn(
              'fixed z-[70] flex flex-col overflow-hidden',
              'border border-white/[0.08] bg-card/95 shadow-[var(--elevation-3)] backdrop-blur-md',
              'inset-x-0 bottom-0 h-[50vh] rounded-t-2xl',
              'md:inset-x-auto md:bottom-6 md:right-6 md:h-[min(70vh,640px)] md:w-[min(50vw,640px)] md:min-w-[360px] md:rounded-xl',
            )}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            <header className="flex shrink-0 items-start justify-between gap-3 border-b border-white/[0.08] px-4 py-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    aria-hidden
                    className={cn(
                      'size-2 shrink-0 rounded-full',
                      healthStatus === 'healthy' && 'bg-[rgb(var(--impact-green-rgb))]',
                      healthStatus === 'degraded' && 'bg-[rgb(var(--solar-gold-rgb))]',
                      healthStatus === 'unknown' && 'bg-muted-foreground',
                    )}
                  />
                  <h2
                    id="faq-bot-title"
                    className="bg-gradient-to-r from-[#06AEEC] via-[#35C9FF] to-[#9C37FD] bg-clip-text text-base font-semibold tracking-tight text-transparent"
                  >
                    Cosmic AI
                  </h2>
                </div>
                <p className="mt-0.5 truncate text-xs text-muted-foreground" title={healthLabel}>
                  {healthLabel}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-0.5">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className={cn(
                    'size-8 text-muted-foreground opacity-35 transition-opacity hover:opacity-100',
                    !canCopy && 'pointer-events-none opacity-20',
                    copied && 'opacity-70 text-primary',
                  )}
                  aria-label={copied ? 'Conversation copied' : 'Copy conversation'}
                  title={canCopy ? 'Copy conversation' : 'Send a message to copy'}
                  disabled={!canCopy}
                  onClick={() => void handleCopy()}
                >
                  {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8 shrink-0 text-muted-foreground hover:text-foreground"
                  aria-label="Close"
                  onClick={onClose}
                >
                  <X className="size-4" />
                </Button>
              </div>
            </header>

            <FaqBotChat session={session} active={open} />
          </motion.section>
        </>
      ) : null}
    </AnimatePresence>
  );
}
