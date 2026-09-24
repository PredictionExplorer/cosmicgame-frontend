'use client';

import { useTranslations } from 'next-intl';
import { Toaster } from 'sonner';

import { NOTIFICATION_AUTO_HIDE_MS } from '@/config/constants';

/**
 * Toasts sit below the fixed header instead of over it (the wallet pill and
 * the wrong-network chip live there), on phones as well as desktop, where
 * sonner switches to full-width toasts under 600px.
 */
const OFFSET = {
  top: 'calc(var(--header-height) + 0.75rem)',
  right: '1rem',
} as const;
const MOBILE_OFFSET = {
  top: 'calc(var(--header-height) + 0.5rem)',
  left: '1rem',
  right: '1rem',
} as const;

/**
 * The app host's single toast region. Transaction lifecycle toasts
 * (useTxFlow) update one toast by id; errors from that flow stay until
 * dismissed, everything else auto-hides after `NOTIFICATION_AUTO_HIDE_MS`.
 * Every toast has a close button.
 */
export function AppToaster() {
  const t = useTranslations('toasts');
  return (
    <Toaster
      position="top-right"
      offset={OFFSET}
      mobileOffset={MOBILE_OFFSET}
      theme="dark"
      richColors
      closeButton
      containerAriaLabel={t('regionLabel')}
      toastOptions={{
        duration: NOTIFICATION_AUTO_HIDE_MS,
        closeButtonAriaLabel: t('close'),
        className:
          'border border-border bg-popover/95 backdrop-blur-md shadow-[var(--elevation-3)]',
        classNames: {
          toast: 'group',
          title: 'type-body-md text-foreground',
          description: 'type-body-sm text-muted-foreground',
          actionButton: 'bg-primary text-primary-foreground',
          cancelButton: 'bg-muted text-muted-foreground',
          success: 'border-[rgb(var(--impact-green-rgb)/0.4)]',
          error: 'border-[rgb(var(--chrono-rose-rgb)/0.4)]',
          warning: 'border-[rgb(var(--solar-gold-rgb)/0.4)]',
          info: 'border-[rgb(var(--aurora-cyan-rgb)/0.4)]',
        },
      }}
    />
  );
}
