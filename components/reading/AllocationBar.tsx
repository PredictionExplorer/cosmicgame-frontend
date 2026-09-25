import type { CSSProperties } from 'react';

import type { LandingEthTrack } from '@/content/landing';

import { ALLOCATION_TRACK_COLORS, type AllocationTrackId } from '@/config/allocationTracks';
import { cn } from '@/lib/utils';

import styles from './AllocationBar.module.css';

/**
 * A track's fill for a bar segment or legend swatch: the colour every chart
 * of the split uses (config/allocationTracks), except that the remainder
 * compounding into the next cycle is drawn hatched in its own hue — it is
 * carried forward, not paid out.
 */
export function trackFill(id: AllocationTrackId): string {
  return id === 'nextCycle' ? (styles.hatched ?? '') : ALLOCATION_TRACK_COLORS[id];
}

/** A track's colour key, for a legend row beside its name. */
export function TrackSwatch({ id, className }: { id: AllocationTrackId; className?: string }) {
  return <span aria-hidden="true" className={cn(styles.swatch, trackFill(id), className)} />;
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
 * (the landing's Allocation Tracks, the white paper's §5.1 figure, the Learn
 * guides), with its own small stylesheet.
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
 * The bar's key: each track's swatch, name and share in the bar's order, so
 * a segment too narrow to hold its figure (the 4% Stellar Selection) is
 * still read from the figure itself. The share is in tabular figures.
 */
export function AllocationKey({ tracks, className }: AllocationKeyProps) {
  return (
    <ul className={cn(styles.key, className)}>
      {tracks.map((track) => (
        <li key={track.id} className={styles.keyItem}>
          <TrackSwatch id={track.id} />
          <span className="type-body-sm text-muted-foreground">{track.title}</span>
          <span className="type-figure-sm text-foreground">{track.percent}</span>
        </li>
      ))}
    </ul>
  );
}
