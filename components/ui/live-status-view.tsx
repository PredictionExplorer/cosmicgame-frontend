'use client';

import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';
import { getFreshnessAge, type LiveFreshness } from '@/lib/liveFreshness';
import { stateTone } from '@/lib/stateTone';

/*
 * State colours from the palette-tuned state tokens (lib/stateTone). Colour
 * never carries the state alone — every variant has the state as text
 * (visible or sr-only).
 */
const DOT_CLASS: Record<LiveFreshness, string> = {
  live: cn(stateTone.liveDot, 'animate-live-dot'),
  connecting: 'bg-muted-foreground/60',
  reconnecting: stateTone.attentionDot,
  delayed: stateTone.attentionDot,
  offline: stateTone.criticalDot,
};

export type LiveStatusVariant = 'dot' | 'chip' | 'inline';

export interface LiveStatusViewProps {
  state: LiveFreshness;
  /** Milliseconds since the last update; drives "Updated 12s ago". */
  ageMs?: number;
  /**
   * `dot`: the dot alone, state as sr-only text (for tight chips).
   * `chip`: a pill with dot and label.
   * `inline`: dot plus "Updated 12s ago" caption, the freshness stamp.
   */
  variant?: LiveStatusVariant;
  /** Adds "The clock may have been extended since then." while delayed or offline. */
  clockCaveat?: boolean;
  className?: string;
}

function useAgeLabel(ageMs: number): string {
  const t = useTranslations('common');
  const { unit, count } = getFreshnessAge(ageMs);
  return t(`liveStatus.age.${unit}`, { count });
}

/**
 * Presentational freshness indicator, free of React Query and the wallet
 * stack. Use `LiveStatus` (components/ui/live-status) on the app host, which
 * reads the query cache; the landing computes the state with
 * `getLiveFreshness` and renders this view directly.
 *
 * Screen readers hear state changes once (a polite status region with the
 * state word), never the ticking age.
 */
export function LiveStatusView({
  state,
  ageMs = 0,
  variant = 'chip',
  clockCaveat = false,
  className,
}: LiveStatusViewProps) {
  const t = useTranslations('common');
  const age = useAgeLabel(ageMs);

  const stateLabel: Record<LiveFreshness, string> = {
    connecting: t('liveStatus.connecting'),
    live: t('liveStatus.live'),
    reconnecting: t('liveStatus.reconnecting'),
    delayed: t('liveStatus.delayed', { age }),
    offline: t('liveStatus.offline'),
  };
  // The clock caveat is part of one message per state, so every locale
  // joins the two sentences with its own punctuation.
  const caveatLabel =
    clockCaveat && state === 'delayed'
      ? t('liveStatus.delayedCaveat', { age })
      : clockCaveat && state === 'offline'
        ? t('liveStatus.offlineCaveat', { age })
        : null;
  const visibleLabel =
    caveatLabel ??
    (variant === 'inline'
      ? state === 'live'
        ? t('liveStatus.updated', { age })
        : state === 'offline'
          ? t('liveStatus.offlineDetail', { age })
          : stateLabel[state]
      : stateLabel[state]);

  const dot = (
    <span
      aria-hidden
      className={cn('relative inline-flex h-1.5 w-1.5 shrink-0 rounded-full', DOT_CLASS[state])}
    />
  );

  return (
    <span
      data-live-state={state}
      className={cn(
        'inline-flex max-w-full items-center gap-2',
        variant === 'chip' &&
          'rounded-full border border-border bg-card/60 px-2.5 py-1 type-eyebrow font-semibold text-muted-foreground',
        variant === 'inline' && 'text-xs text-muted-foreground',
        className,
      )}
    >
      {dot}
      <span role="status" aria-live="polite" className="sr-only">
        {state === 'delayed' ? t('liveStatus.delayedShort') : t(`liveStatus.${state}`)}
      </span>
      {variant !== 'dot' && (
        <span aria-hidden className="min-w-0 truncate">
          {visibleLabel}
        </span>
      )}
    </span>
  );
}
