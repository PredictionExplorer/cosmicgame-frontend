'use client';

import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';
import { getFreshnessAge, type LiveFreshness } from '@/lib/liveFreshness';
import { useLiveFreshness, type UseLiveFreshnessOptions } from '@/hooks/useLiveFreshness';

/*
 * State colours: `--live` / `--attention` are the palette-tuned state tokens;
 * the fallbacks match their shared defaults. Colour never carries the state
 * alone — every variant has the state as text (visible or sr-only).
 */
const DOT_CLASS: Record<LiveFreshness, string> = {
  live: 'bg-[hsl(var(--live,var(--positive,var(--success))))] animate-live-dot',
  connecting: 'bg-muted-foreground/60',
  reconnecting: 'bg-[hsl(var(--attention,40_90%_68%))]',
  delayed: 'bg-[hsl(var(--attention,40_90%_68%))]',
  offline: 'bg-[hsl(var(--critical,0_80%_72%))]',
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
 * Presentational freshness indicator. Use `LiveStatus` on the app host (it
 * reads React Query); the landing computes the state with `getLiveFreshness`
 * and renders this view directly.
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
  const visibleLabel =
    variant === 'inline'
      ? state === 'live'
        ? t('liveStatus.updated', { age })
        : state === 'offline'
          ? t('liveStatus.offlineDetail', { age })
          : stateLabel[state]
      : stateLabel[state];
  const showCaveat = clockCaveat && (state === 'delayed' || state === 'offline');

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
          'rounded-full border border-border bg-card/60 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground',
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
          {showCaveat && ` ${t('liveStatus.clockCaveat')}`}
        </span>
      )}
    </span>
  );
}

export type LiveStatusProps = Omit<LiveStatusViewProps, 'state' | 'ageMs'> &
  UseLiveFreshnessOptions;

/**
 * Honest "live" indicator for app surfaces: pulses only while the latest
 * poll succeeded, turns amber and ages ("Updates delayed · last update 2m
 * ago") when polls fail, and says Offline when the browser is. Defaults to
 * the dashboard query that drives the Cycle.
 *
 *   <LiveStatus variant="dot" />                       // in a cycle chip
 *   <LiveStatus variant="inline" clockCaveat />        // under a countdown
 *   <LiveStatus queryKeys={[['statistics']]} />        // another surface
 */
export function LiveStatus({ queryKeys, pollIntervalMs, ...viewProps }: LiveStatusProps) {
  const freshness = useLiveFreshness({ queryKeys, pollIntervalMs });
  return <LiveStatusView state={freshness.state} ageMs={freshness.ageMs} {...viewProps} />;
}
