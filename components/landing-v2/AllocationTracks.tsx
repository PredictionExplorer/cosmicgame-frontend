import type { CSSProperties } from 'react';

import type { LandingContent } from '@/content/landing';

import type { AllocationTrackId } from '@/config/allocationTracks';
import { cn } from '@/lib/utils';

import { LandingSection, SectionHeading } from './SectionHeading';
import styles from './Landing.module.css';

/**
 * Each track's fill, from the palette-independent track tokens
 * (styles/themes.css). The remainder that compounds into the next cycle is
 * drawn hatched: it is carried forward, not paid out.
 */
const TRACK_FILL: Readonly<Record<AllocationTrackId, string>> = {
  signature: 'bg-track-signature',
  chrono: 'bg-track-chrono',
  stellar: 'bg-track-stellar-eth',
  anchor: 'bg-track-anchoring',
  publicGoods: 'bg-track-public-goods',
  nextCycle: styles.hatched ?? '',
};

/**
 * Allocation Tracks: where a cycle's ETH goes, as one bar drawn to scale
 * against 100% (the same order and colours as every chart of the split in
 * the app), a legend with each track's share and purpose, and the fixed CST
 * and NFT allocations beside it. Server-rendered and visible without
 * JavaScript; the bar is decorative and the legend carries every figure.
 */
export function AllocationTracks({ tracks }: { tracks: LandingContent['tracks'] }) {
  return (
    <LandingSection id="tracks" labelledBy="landing-tracks-heading">
      <SectionHeading
        eyebrow={tracks.eyebrow}
        heading={tracks.heading}
        headingId="landing-tracks-heading"
        description={tracks.description}
      />

      <div className={styles.split}>
        <h3 className="type-label text-subtle" id="landing-tracks-eth">
          {tracks.ethLabel}
        </h3>
        <div className={styles.bar} aria-hidden="true" data-testid="allocation-bar">
          {tracks.eth.map((track) => (
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
        <ul className={styles.legend} aria-labelledby="landing-tracks-eth">
          {tracks.eth.map((track) => (
            <li key={track.id} className={styles.legendItem}>
              <span aria-hidden="true" className={cn(styles.swatch, TRACK_FILL[track.id])} />
              <h4 className="type-title">{track.title}</h4>
              <span className="type-figure-md text-right">{track.percent}</span>
              <p className={cn('type-body-sm text-muted-foreground', styles.legendBody)}>
                {track.body}
              </p>
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.fixed}>
        <h3 className="type-label text-subtle" id="landing-tracks-fixed">
          {tracks.fixedLabel}
        </h3>
        <ul className={styles.fixedList} aria-labelledby="landing-tracks-fixed">
          {tracks.fixed.map((track) => (
            <li key={track.id} className={styles.fixedItem}>
              <span className="type-figure-md">{track.amount}</span>
              <h4 className="type-title mt-3">{track.title}</h4>
              <p className="type-body-sm mt-1.5 text-muted-foreground">{track.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </LandingSection>
  );
}
