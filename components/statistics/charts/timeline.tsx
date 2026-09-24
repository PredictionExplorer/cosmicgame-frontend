'use client';

import { useCallback, useState } from 'react';

import { formatAddress } from '@/utils/format';
import { Link } from '@/i18n/navigation';
import { useMediaQuery } from '@/hooks/useMediaQuery';

/**
 * Shared behaviour of the lane timelines (the Endurance Gantt, the active
 * periods): which mark the readout under the plot describes, and how an
 * address sits inside a chart's summary sentence.
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

/**
 * An address inside a chart's summary sentence: the short form in the mono
 * identifier face, linked to the participant's page.
 */
export function SummaryAddress({ address }: { address: string }) {
  return (
    <Link href={`/user/${address}`} className="link type-mono">
      {formatAddress(address)}
    </Link>
  );
}
