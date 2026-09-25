'use client';

import type { CSSProperties } from 'react';
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
 * Sonner draws a toast from these variables (its own stylesheet outranks a
 * utility class on the toast), so the palette reaches it here: every toast
 * sits on the raised surface with the float's hairline, its text in the
 * foreground tiers, and a state shows as a 40% edge in the palette's own
 * positive, critical, attention or primary colour (plus the icon below),
 * never as a tinted fill. Ember and Aurora tune those state colours, and a
 * toast follows them.
 */
const TOAST_COLORS = {
  '--border-radius': 'var(--radius-surface)',
  '--normal-bg': 'hsl(var(--popover))',
  '--normal-bg-hover': 'hsl(var(--muted))',
  '--normal-border': 'hsl(var(--rule))',
  '--normal-border-hover': 'hsl(var(--input))',
  '--normal-text': 'hsl(var(--foreground))',
  '--success-bg': 'hsl(var(--popover))',
  '--success-border': 'hsl(var(--positive) / 0.4)',
  '--success-text': 'hsl(var(--foreground))',
  '--error-bg': 'hsl(var(--popover))',
  '--error-border': 'hsl(var(--critical) / 0.4)',
  '--error-text': 'hsl(var(--foreground))',
  '--warning-bg': 'hsl(var(--popover))',
  '--warning-border': 'hsl(var(--attention) / 0.4)',
  '--warning-text': 'hsl(var(--foreground))',
  '--info-bg': 'hsl(var(--popover))',
  '--info-border': 'hsl(var(--primary) / 0.4)',
  '--info-text': 'hsl(var(--foreground))',
} as CSSProperties;

/**
 * The app host's single toast region. Transaction lifecycle toasts
 * (useTxFlow) update one toast by id; errors from that flow stay until
 * dismissed, everything else auto-hides after `NOTIFICATION_AUTO_HIDE_MS`.
 * Every toast has a close button. A floating layer: the raised surface and
 * the float shadow, as dialogs and menus.
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
      style={TOAST_COLORS}
      toastOptions={{
        duration: NOTIFICATION_AUTO_HIDE_MS,
        closeButtonAriaLabel: t('close'),
        className: 'shadow-float!',
        classNames: {
          toast: 'group',
          title: 'type-body-md text-foreground',
          description: 'type-body-sm text-muted-foreground!',
          actionButton: 'bg-primary text-primary-foreground',
          cancelButton: 'bg-muted text-muted-foreground',
          success: '[&_[data-icon]]:text-positive',
          error: '[&_[data-icon]]:text-critical',
          warning: '[&_[data-icon]]:text-attention',
          info: '[&_[data-icon]]:text-primary',
        },
      }}
    />
  );
}
