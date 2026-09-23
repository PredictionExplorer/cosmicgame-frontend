'use client';

import { useLiveFreshness, type UseLiveFreshnessOptions } from '@/hooks/useLiveFreshness';

import { LiveStatusView, type LiveStatusViewProps } from './live-status-view';

export {
  LiveStatusView,
  type LiveStatusVariant,
  type LiveStatusViewProps,
} from './live-status-view';

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
