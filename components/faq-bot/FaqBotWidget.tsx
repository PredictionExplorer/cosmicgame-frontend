'use client';

import { useCallback, useEffect, useState } from 'react';
import { MessageCircle, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { FaqBotPanel } from './FaqBotPanel';
import { useFaqBotSession } from './useFaqBotSession';

function isFaqBotEnabled(): boolean {
  const raw = process.env.NEXT_PUBLIC_ENABLE_FAQ_BOT?.trim().toLowerCase();
  if (!raw) return true;
  return raw !== 'false' && raw !== '0' && raw !== 'no' && raw !== 'off';
}

export function FaqBotWidget() {
  const [open, setOpen] = useState(false);
  const session = useFaqBotSession(isFaqBotEnabled());

  const close = useCallback(() => setOpen(false), []);
  const toggle = useCallback(() => setOpen((value) => !value), []);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        close();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [close, open]);

  if (!isFaqBotEnabled()) {
    return null;
  }

  return (
    <>
      <FaqBotPanel open={open} onClose={close} session={session} />

      {!open ? (
        <Button
          type="button"
          aria-expanded={open}
          aria-controls="faq-bot-panel"
          aria-label="Open AI assistant"
          onClick={toggle}
          className={cn(
            'fixed bottom-4 right-4 z-[60] h-11 gap-2 rounded-full px-4 shadow-[0_14px_40px_-18px_rgb(var(--aurora-cyan-rgb)/0.95)]',
            'md:bottom-6 md:right-6',
          )}
        >
          <MessageCircle className="size-4" aria-hidden />
          <span className="hidden sm:inline">AI Help</span>
        </Button>
      ) : (
        <Button
          type="button"
          variant="secondary"
          size="icon"
          aria-label="Close AI assistant"
          onClick={close}
          className="fixed bottom-4 right-4 z-[60] rounded-full md:bottom-6 md:right-6"
        >
          <X className="size-4" />
        </Button>
      )}
    </>
  );
}
