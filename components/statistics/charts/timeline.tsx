'use client';

import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';

import { formatAddress } from '@/utils/format';
import { Link } from '@/i18n/navigation';
import { useMediaQuery } from '@/hooks/useMediaQuery';

/**
 * Shared behaviour of the lane timelines (the Endurance Gantt, the active
 * periods): which mark the readout under the plot describes, and how a
 * chart links an address (in its summary sentence, in its table), in place
 * or, inside an embed, in a new window.
 */

/**
 * The readout's subject. A pointer resting on a mark shows it; a click, a
 * tap or keyboard focus pins it, so a touch reader (who has no hover) gets
 * the same details, and they stay after the pointer leaves the plot.
 */
export function useTimelineReadout<T>() {
  const [pinned, setPinned] = useState<T | null>(null);
  const [hovered, setHovered] = useState<T | null>(null);
  const active = hovered ?? pinned;

  const markHandlers = useCallback(
    (item: T, onFocus?: () => void) => ({
      onMouseEnter: () => setHovered(item),
      onFocus: () => {
        onFocus?.();
        setPinned(item);
      },
      onClick: () => {
        setHovered(null);
        setPinned(item);
      },
    }),
    [],
  );

  return {
    active,
    markHandlers,
    /** On the plot's group: leaving it drops the hover and falls back to the pinned mark. */
    onMouseLeave: () => setHovered(null),
  };
}

/** Whether the reader points with a finger, so hints say "tap" rather than "point at". */
export function useCoarsePointer(): boolean {
  return useMediaQuery('(pointer: coarse)');
}

const NewWindowLinksContext = createContext(false);

/**
 * Around a chart in an embed, whose window shows that chart and nothing
 * else: the chart's links to participants open a new window, as the embed's
 * own source link does, instead of turning the embed into the app.
 */
export function ChartLinksOpenNewWindow({ children }: { children: ReactNode }) {
  return <NewWindowLinksContext.Provider value>{children}</NewWindowLinksContext.Provider>;
}

/** Whether this chart's links open a new window (inside an embed). */
export function useChartLinksOpenNewWindow(): boolean {
  return useContext(NewWindowLinksContext);
}

/**
 * A chart's link to a participant, in the short form with the full address
 * on hover. Inside an embed it opens a new window and says so to assistive
 * technology.
 */
export function ChartAddressLink({ address, className }: { address: string; className?: string }) {
  const t = useTranslations('statistics');
  const newWindow = useChartLinksOpenNewWindow();
  return (
    <Link
      href={`/user/${address}`}
      title={address}
      className={className}
      {...(newWindow ? { target: '_blank', rel: 'noopener noreferrer' } : null)}
    >
      {formatAddress(address)}
      {newWindow ? <span className="sr-only"> {t('embed.opensNewWindow')}</span> : null}
    </Link>
  );
}

/**
 * An address inside a chart's summary sentence: the short form in the mono
 * identifier face, linked to the participant's page.
 */
export function SummaryAddress({ address }: { address: string }) {
  return <ChartAddressLink address={address} className="link type-mono" />;
}
