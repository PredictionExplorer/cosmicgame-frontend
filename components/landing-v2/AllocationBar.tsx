import type { CSSProperties } from 'react';

import type { LandingEthTrack } from '@/content/landing';

import type { AllocationTrackId } from '@/config/allocationTracks';
import { cn } from '@/lib/utils';

import styles from './Landing.module.css';

/**
 * Each track's fill, from the palette-independent track tokens
 * (styles/themes.css). The remainder that compounds into the next cycle is
 * drawn hatched: it is carried forward, not paid out.
 */
export const TRACK_FILL: Readonly<Record<AllocationTrackId, string>> = {
  signature: 'bg-track-signature',
  chrono: 'bg-track-chrono',
  stellar: 'bg-track-stellar-eth',
  anchor: 'bg-track-anchoring',
  publicGoods: 'bg-track-public-goods',
  nextCycle: styles.hatched ?? '',
};

interface AllocationBarProps {
  /** The ETH tracks with their shares, e.g. `getLandingContent(locale).tracks.eth`. */
  tracks: readonly LandingEthTrack[];
  className?: string;
}

/**
 * The ETH split of a Cycle Reserve as one bar drawn to scale against 100%:
 * each segment grows by its share, in the order and colours every chart of
 * the split uses (config/allocationTracks), with the share inside the
 * segment wherever it fits. Decorative (`aria-hidden`): pair it with a
 * legend or table that carries the figures. Server-safe, for any landing-host
 * page (the landing's Allocation Tracks, the white paper's allocation table).
 */
export function AllocationBar({ tracks, className }: AllocationBarProps) {
  return (
    <div className={cn(styles.bar, className)} aria-hidden="true" data-testid="allocation-bar">
      {tracks.map((track) => (
        <span
          key={track.id}
          className={cn(styles.segment, TRACK_FILL[track.id])}
          style={{ '--share': track.share } as CSSProperties}
          data-track={track.id}
          data-share={track.share}
        >
          <span className={cn('type-figure-sm', styles.segmentLabel)}>{track.percent}</span>
        </span>
      ))}
    </div>
  );
}
