import type { CSSProperties } from 'react';

import type { LandingEthTrack } from '@/content/landing';

import { ALLOCATION_TRACK_COLORS, type AllocationTrackId } from '@/config/allocationTracks';
import { cn } from '@/lib/utils';

import styles from './Landing.module.css';

/**
 * A track's fill for a bar segment or legend swatch: the colour every chart
 * of the split uses (config/allocationTracks), except that the remainder
 * compounding into the next cycle is drawn hatched in its own hue — it is
 * carried forward, not paid out.
 */
export function trackFill(id: AllocationTrackId): string {
  return id === 'nextCycle' ? (styles.hatched ?? '') : ALLOCATION_TRACK_COLORS[id];
}

interface AllocationBarProps {
  /** The ETH tracks with their shares, e.g. `getLandingContent(locale).tracks.eth`. */
  tracks: readonly LandingEthTrack[];
  /** `hero`: the landing's Allocation Tracks. `inline`: a figure inside reading text. */
  density?: 'hero' | 'inline';
  className?: string;
}

/**
 * The ETH split of a Cycle Reserve as one bar drawn to scale against 100%:
 * each segment grows by its share, in the order and colours every chart of
 * the split uses (config/allocationTracks), with the share inside the
 * segment wherever it fits and the compounding remainder hatched.
 * Decorative (`aria-hidden`): pair it with a legend, an AllocationKey or a
 * table that carries the figures. Server-safe, for any landing-host page
 * (the landing's Allocation Tracks, the white paper's §5.1 figure).
 */
export function AllocationBar({ tracks, density = 'hero', className }: AllocationBarProps) {
  return (
    <div
      className={cn(styles.bar, density === 'inline' && styles.barInline, className)}
      aria-hidden="true"
      data-testid="allocation-bar"
      data-density={density}
    >
      {tracks.map((track) => (
        <span
          key={track.id}
          className={cn(styles.segment, trackFill(track.id))}
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

interface AllocationKeyProps {
  tracks: readonly LandingEthTrack[];
  className?: string;
}

/**
 * The bar's key: each track's swatch and name in the bar's order. It names
 * the colours and leaves the figures to the bar and to the table or legend
 * that carries them, so a figure never repeats a table's numbers.
 */
export function AllocationKey({ tracks, className }: AllocationKeyProps) {
  return (
    <ul className={cn(styles.key, className)}>
      {tracks.map((track) => (
        <li key={track.id} className={styles.keyItem}>
          <span aria-hidden="true" className={cn(styles.swatch, trackFill(track.id))} />
          <span className="type-body-sm text-muted-foreground">{track.title}</span>
        </li>
      ))}
    </ul>
  );
}
